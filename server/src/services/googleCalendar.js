/**
 * Google Calendar integration — auth-only methods (Phase B).
 *
 * Wraps the OAuth Authorization Code flow against the Google Identity
 * Platform plus the per-user connection state stored in
 * GoogleCalendarConnection. Event create/update/cancel methods land in
 * Phase C; this file only handles connect, disconnect, and access-token
 * lifecycle.
 *
 * Scope: `calendar.events.owned` only — least privilege. Lets us
 * create/update/cancel events the admin owns; does NOT read events from
 * other calendars or any non-owned event.
 *
 * Token handling:
 *   - Refresh tokens never leave the DB. Stored AES-256-GCM encrypted
 *     in encryptedRefreshToken via utils/crypto.encryptSecret.
 *   - Access tokens are short-lived (~1h) and refreshed proactively
 *     when within 5 minutes of expiry.
 *   - All Google API calls go through `getValidAccessToken(userId)`
 *     which lazily refreshes and writes the new token back.
 *
 * State CSRF: the OAuth `state` parameter is HMAC-signed with
 * JWT_ACCESS_SECRET (already required env). Format is
 *   `<base64url-payload>.<hex-sig>`
 * where payload is `{ userId, nonce, ts }`. The callback verifies the
 * signature and the timestamp window (max 10 minutes) before trusting
 * the userId.
 */

import crypto from 'node:crypto';
import { env, isProd } from '../config/env.js';
import { prisma } from '../config/database.js';
import { encryptSecret, decryptSecret } from '../utils/crypto.js';
import { logger, auditLog } from '../utils/logger.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events.owned'];
const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes
const ACCESS_TOKEN_REFRESH_LEAD_MS = 5 * 60 * 1000; // refresh if <5 min left

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// Subject keys we render on calendar events. Matches the SUBJECTS array
// in the frontend so labels stay consistent across the dashboard and
// Google's UI.
const SUBJECT_LABELS = {
  quran: 'Quran',
  fiqh: 'Fiqh',
  arabic: 'Arabic',
};

/**
 * True when all four env vars are set. Routes that need the integration
 * should check this and return a friendly "not configured" response
 * rather than throwing on missing env.
 */
export function isGoogleCalendarConfigured() {
  return !!(
    env.GOOGLE_OAUTH_CLIENT_ID &&
    env.GOOGLE_OAUTH_CLIENT_SECRET &&
    env.GOOGLE_OAUTH_REDIRECT_URI &&
    env.TOKEN_ENCRYPTION_KEY
  );
}

// --- State token (HMAC-signed) ---

function signState(payload) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', env.JWT_ACCESS_SECRET)
    .update(b64)
    .digest('hex');
  return `${b64}.${sig}`;
}

function verifyState(state) {
  if (typeof state !== 'string' || !state.includes('.')) {
    throw new Error('state: malformed');
  }
  const [b64, sig] = state.split('.');
  const expected = crypto
    .createHmac('sha256', env.JWT_ACCESS_SECRET)
    .update(b64)
    .digest('hex');
  // Timing-safe compare to prevent leaking the signature one char at a time.
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('state: signature mismatch');
  }
  const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
  if (typeof payload?.ts !== 'number' || Date.now() - payload.ts > STATE_MAX_AGE_MS) {
    throw new Error('state: expired');
  }
  return payload;
}

// --- OAuth flow ---

/**
 * Build the URL to redirect the admin to so Google can prompt for
 * consent. The state encodes the userId so the callback can match the
 * grant back to the right account.
 */
export function buildAuthUrl({ userId }) {
  if (!isGoogleCalendarConfigured()) {
    throw new Error('Google Calendar integration is not configured');
  }
  const state = signState({
    userId,
    nonce: crypto.randomBytes(16).toString('hex'),
    ts: Date.now(),
  });
  const params = new URLSearchParams({
    client_id: env.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: ['openid', 'email', 'profile', ...SCOPES].join(' '),
    access_type: 'offline',     // get a refresh token
    prompt: 'consent',          // force re-consent so we always get a refresh token
    include_granted_scopes: 'true',
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Handle the callback from Google: verify state, exchange the auth code
 * for tokens, fetch the connecting account's email, and upsert the
 * GoogleCalendarConnection row. Returns the updated connection row
 * (without the encrypted token blobs, which never leave the server).
 */
export async function exchangeCodeForTokens({ code, state }) {
  const payload = verifyState(state);

  // 1. Exchange code -> tokens.
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${tokenRes.status} ${body}`);
  }
  const tokens = await tokenRes.json();
  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    scope: grantedScope,
  } = tokens;

  if (!refreshToken) {
    // Without a refresh token we can't keep syncing. This usually means
    // the user has previously granted consent and Google didn't re-issue
    // one. We force prompt=consent in buildAuthUrl to avoid this.
    throw new Error(
      'Google did not return a refresh token. Disconnect from Google account ' +
      'permissions and try again.'
    );
  }

  // 2. Fetch the email of the connected Google account so we can show
  //    it on the dashboard ("Connected as ...").
  const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userInfoRes.ok) {
    throw new Error(`Google userinfo fetch failed: ${userInfoRes.status}`);
  }
  const userInfo = await userInfoRes.json();
  const googleEmail = userInfo.email || '(unknown)';

  // 3. Upsert the connection row. Re-connecting reuses the same row so
  //    audit trail (connectedAt) reflects the LATEST connect, while
  //    disconnected rows reset cleanly on reconnect.
  const expiresAt = new Date(Date.now() + (expiresIn || 3600) * 1000);
  await prisma.googleCalendarConnection.upsert({
    where: { userId: payload.userId },
    update: {
      googleAccountEmail: googleEmail,
      encryptedRefreshToken: encryptSecret(refreshToken),
      encryptedAccessToken: encryptSecret(accessToken),
      accessTokenExpiresAt: expiresAt,
      status: 'active',
      scopes: grantedScope || SCOPES.join(' '),
      lastErrorAt: null,
      lastErrorMessage: null,
      connectedAt: new Date(),
    },
    create: {
      userId: payload.userId,
      googleAccountEmail: googleEmail,
      encryptedRefreshToken: encryptSecret(refreshToken),
      encryptedAccessToken: encryptSecret(accessToken),
      accessTokenExpiresAt: expiresAt,
      status: 'active',
      scopes: grantedScope || SCOPES.join(' '),
    },
  });

  auditLog('GCAL_CONNECTED', { adminId: payload.userId, googleEmail });

  return { userId: payload.userId, googleEmail };
}

/**
 * Refresh the access token for a user using their stored refresh token.
 * Updates the row in place with the new access token + expiry.
 *
 * If Google rejects the refresh token (revoked, password changed, etc.)
 * we mark the connection 'needs_reconnect' so the dashboard can prompt
 * the admin. The next API call from this user will see the bad status
 * and fall back to a no-op until they reconnect.
 */
export async function refreshAccessToken(userId) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });
  if (!conn || !conn.encryptedRefreshToken) {
    throw new Error('No active Google Calendar connection');
  }
  const refreshToken = decryptSecret(conn.encryptedRefreshToken);

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // invalid_grant means the refresh token is no longer valid; user
    // must re-consent. Mark the connection accordingly.
    if (body.includes('invalid_grant') || res.status === 400) {
      await prisma.googleCalendarConnection.update({
        where: { userId },
        data: {
          status: 'needs_reconnect',
          encryptedAccessToken: null,
          accessTokenExpiresAt: null,
          lastErrorAt: new Date(),
          lastErrorMessage: 'Refresh token rejected (invalid_grant)',
        },
      });
      auditLog('GCAL_NEEDS_RECONNECT', { adminId: userId });
    }
    throw new Error(`Google refresh failed: ${res.status} ${body}`);
  }
  const tokens = await res.json();
  const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

  await prisma.googleCalendarConnection.update({
    where: { userId },
    data: {
      encryptedAccessToken: encryptSecret(tokens.access_token),
      accessTokenExpiresAt: expiresAt,
      status: 'active',
      lastErrorAt: null,
      lastErrorMessage: null,
    },
  });

  return { accessToken: tokens.access_token, expiresAt };
}

/**
 * Get a valid access token for the given user. Refreshes lazily if the
 * stored token is missing, expired, or about to expire.
 */
export async function getValidAccessToken(userId) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });
  if (!conn || conn.status !== 'active') {
    throw new Error(`Google Calendar not active for user ${userId}`);
  }
  const now = Date.now();
  const expiry = conn.accessTokenExpiresAt?.getTime() ?? 0;
  if (
    !conn.encryptedAccessToken ||
    expiry - now < ACCESS_TOKEN_REFRESH_LEAD_MS
  ) {
    const refreshed = await refreshAccessToken(userId);
    return refreshed.accessToken;
  }
  return decryptSecret(conn.encryptedAccessToken);
}

/**
 * Revoke this user's Google Calendar connection. Best-effort: we hit
 * Google's revoke endpoint AND drop the local tokens / mark the row
 * disconnected. If the revoke call fails we still drop the local
 * tokens — Google revocation is hygiene, not a security boundary
 * (the local tokens were our copy of the secret).
 */
export async function revokeAccess(userId) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });
  if (!conn) return;

  // Best-effort revoke against Google. Failure here is non-fatal.
  if (conn.encryptedRefreshToken) {
    try {
      const refreshToken = decryptSecret(conn.encryptedRefreshToken);
      await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(refreshToken)}`, {
        method: 'POST',
      });
    } catch (err) {
      logger.warn('GCal revoke call failed (continuing to drop local tokens)', {
        userId,
        error: err.message,
      });
    }
  }

  await prisma.googleCalendarConnection.update({
    where: { userId },
    data: {
      status: 'disconnected',
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      accessTokenExpiresAt: null,
      lastErrorAt: null,
      lastErrorMessage: null,
    },
  });

  auditLog('GCAL_DISCONNECTED', { adminId: userId });
}

/**
 * Public-shape connection status for the dashboard card. Strips
 * encrypted token blobs so they never leave the server.
 */
export async function getStatus(userId) {
  if (!isGoogleCalendarConfigured()) {
    return { configured: false };
  }
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    select: {
      googleAccountEmail: true,
      googleCalendarId: true,
      status: true,
      scopes: true,
      connectedAt: true,
      lastSyncedAt: true,
      lastErrorAt: true,
      lastErrorMessage: true,
    },
  });
  if (!conn) {
    return { configured: true, status: 'not_connected' };
  }
  return { configured: true, ...conn };
}

// --- Event API ---
//
// Each method requires an active connection for the given userId.
// Throws if there's no connection or the access token can't be
// obtained. The sync job catches and reschedules with backoff.

/**
 * Format an ISO timestamp into Google's `dateTime` field. Always send
 * the full ISO string + the `timeZone` field so Google interprets it
 * in the class's home zone, not the calendar's default.
 */
function toGoogleDateTime(iso, timeZone) {
  return {
    dateTime: new Date(iso).toISOString(),
    timeZone: timeZone || 'UTC',
  };
}

/**
 * Build the event summary line. Single-subject classes get
 * "{names} · {Subject}", split-subject classes (Phase D) will get
 * "{names} · {Primary} + {Secondary}". For now we only handle the
 * single-subject case; subjectSecondary is reserved for later.
 */
function buildEventSummary(classSession) {
  const names = (classSession.assignments || [])
    .map((a) => a.student?.firstName)
    .filter(Boolean)
    .join(' + ');
  const primary = SUBJECT_LABELS[classSession.subject] || 'Class';
  const subjectLine = classSession.subjectSecondary
    ? `${primary} + ${SUBJECT_LABELS[classSession.subjectSecondary] || classSession.subjectSecondary}`
    : primary;
  return names ? `${names} · ${subjectLine}` : subjectLine;
}

const EVENT_DESCRIPTION = 'Scheduled via Daris. Manage at https://daris.education/admin';

/**
 * Build the full event body for a Google Calendar create/patch call.
 */
function buildEventBody(classSession) {
  return {
    summary: buildEventSummary(classSession),
    description: EVENT_DESCRIPTION,
    start: toGoogleDateTime(classSession.startTime, classSession.timezone),
    end: toGoogleDateTime(classSession.endTime, classSession.timezone),
    // Daris owns reminder timing — we send our own emails 24h before.
    // Tell Google to skip its own pop/email reminders so the user
    // isn't double-pinged.
    reminders: { useDefault: false, overrides: [] },
    // Status of an event — left default 'confirmed'. Cancellations
    // delete the event rather than flipping status.
  };
}

/**
 * Create a Calendar event with an auto-generated Google Meet link.
 * Returns { eventId, meetingLink } so the caller can store both on
 * the ClassSession row.
 */
export async function createEvent(userId, classSession) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    select: { googleCalendarId: true, status: true },
  });
  if (!conn || conn.status !== 'active') {
    throw new Error('No active Google Calendar connection for this user');
  }
  const accessToken = await getValidAccessToken(userId);
  const body = {
    ...buildEventBody(classSession),
    // conferenceData.createRequest tells Google to allocate a new Meet
    // room for this event. requestId must be unique-ish per call so
    // retries don't collide.
    conferenceData: {
      createRequest: {
        requestId: `daris-${classSession.id}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const url =
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(conn.googleCalendarId)}` +
    `/events?conferenceDataVersion=1`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`createEvent ${res.status}: ${errBody}`);
  }
  const event = await res.json();
  return {
    eventId: event.id,
    meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null,
  };
}

/**
 * Patch an existing event in place. Used when a class is rescheduled
 * or its details change. Keeps the same eventId + Meet link.
 */
export async function updateEvent(userId, classSession) {
  if (!classSession.googleEventId) {
    throw new Error('updateEvent: classSession has no googleEventId');
  }
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    select: { googleCalendarId: true, status: true },
  });
  if (!conn || conn.status !== 'active') {
    throw new Error('No active Google Calendar connection for this user');
  }
  const accessToken = await getValidAccessToken(userId);
  const body = buildEventBody(classSession);
  const url =
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(conn.googleCalendarId)}` +
    `/events/${encodeURIComponent(classSession.googleEventId)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (res.status === 404) {
    // Event was deleted out from under us. Treat as gone — caller
    // can decide to recreate or just drop the link.
    throw new Error('updateEvent 404: event missing on Google');
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`updateEvent ${res.status}: ${errBody}`);
  }
  return { eventId: classSession.googleEventId };
}

/**
 * Delete an event. 404 (already gone) is treated as success — that's
 * what the caller wanted anyway. Other non-2xx errors throw.
 */
export async function cancelEvent(userId, googleEventId) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    select: { googleCalendarId: true, status: true },
  });
  if (!conn || conn.status !== 'active') {
    throw new Error('No active Google Calendar connection for this user');
  }
  const accessToken = await getValidAccessToken(userId);
  const url =
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(conn.googleCalendarId)}` +
    `/events/${encodeURIComponent(googleEventId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404 || res.status === 410) {
    return { alreadyGone: true };
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`cancelEvent ${res.status}: ${errBody}`);
  }
  return { alreadyGone: false };
}

// Exposed for tests / unrelated callers; stays unused in production.
export const __internal = { signState, verifyState, buildEventSummary };
