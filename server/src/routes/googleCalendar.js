/**
 * Google Calendar admin routes (Phase B).
 *
 * Endpoints (all sheikh-only):
 *   GET  /api/admin/google-calendar/status      connection card data
 *   GET  /api/admin/google-calendar/connect     302 -> Google consent URL
 *   GET  /api/admin/google-calendar/callback    Google redirects here
 *   POST /api/admin/google-calendar/disconnect  revoke + drop tokens
 *
 * The callback is special: Google redirects the BROWSER here, so the
 * request carries the admin's auth cookie. We still verify the OAuth
 * `state` HMAC + the timestamp window (10 min) before trusting the
 * embedded userId.
 */

import { Router } from 'express';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import {
  buildAuthUrl,
  exchangeCodeForTokens,
  revokeAccess,
  getStatus,
  isGoogleCalendarConfigured,
} from '../services/googleCalendar.js';
import { verifyAccessToken } from '../services/tokenService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Status, connect, and disconnect run with the standard admin auth
// chain. The callback is mounted separately below because Google's
// redirect must NOT be blocked by middleware that 401s on a missing
// JWT (the cookie is present in normal use, but we want to render a
// helpful error page if it isn't).

router.get(
  '/status',
  authenticate,
  verifyTokenVersion,
  requireAdmin,
  async (req, res, next) => {
    try {
      const status = await getStatus(req.user.id);
      res.json(status);
    } catch (error) {
      next(error);
    }
  }
);

// Return the OAuth consent URL as JSON. The frontend then navigates
// the browser there manually. We DON'T 302 directly because the only
// way to call this endpoint is via fetch() with credentials, which
// goes through the api.js wrapper's refresh-on-TOKEN_EXPIRED path.
// A direct <a href> navigation would skip that path and 401 the
// instant the access-token JWT (15-min) expires.
router.get(
  '/connect',
  authenticate,
  verifyTokenVersion,
  requireAdmin,
  async (req, res, next) => {
    try {
      if (!isGoogleCalendarConfigured()) {
        return res.status(503).json({ error: 'Google Calendar is not configured' });
      }
      const url = buildAuthUrl({ userId: req.user.id });
      res.json({ url });
    } catch (error) {
      next(error);
    }
  }
);

// Google's redirect target. Critical: the request to this URL is a
// CROSS-SITE navigation (Google → Daris), so cookies marked
// SameSite=Strict are NOT sent — even though the user is logged in.
// We therefore can NOT use the standard authenticate middleware here.
//
// Instead we rely on the HMAC-signed `state` parameter: it encodes the
// initiating user's id + a 10-minute timestamp window, signed with
// JWT_ACCESS_SECRET, so an attacker can't forge it. The state itself
// is the proof that whoever is hitting this URL initiated the connect
// flow. exchangeCodeForTokens() verifies the signature and timestamp
// before trusting any payload field.
//
// Defense in depth: if a cookie IS sent (e.g. SameSite=Lax in the
// future, or same-site browser quirk), we still cross-check the
// authenticated user against the state's userId.
router.get('/callback', async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    logger.warn('GCal OAuth callback: provider error', { error: oauthError });
    return res.redirect(302, '/admin?calendar=error&reason=denied');
  }
  if (!code || !state) {
    return res.redirect(302, '/admin?calendar=error&reason=missing_code');
  }

  try {
    // exchangeCodeForTokens does the signature + 10-min window check
    // on the state internally and throws if either fails.
    const result = await exchangeCodeForTokens({ code, state });

    // Best-effort cross-check against any cookie that DID make it
    // through. If the cookie is missing (the common case under
    // SameSite=Strict) we still trust the verified state.
    if (req.cookies?.accessToken) {
      try {
        const decoded = verifyAccessToken(req.cookies.accessToken);
        if (decoded?.sub && decoded.sub !== result.userId) {
          logger.warn('GCal callback: cookie userId did not match state userId', {
            cookieUserId: decoded.sub,
            stateUserId: result.userId,
          });
          return res.redirect(302, '/admin?calendar=error&reason=state_mismatch');
        }
      } catch {
        // Cookie present but invalid/expired. Don't fail the whole flow
        // on that — the state is still trustworthy on its own.
      }
    }

    return res.redirect(302, '/admin?calendar=connected');
  } catch (error) {
    logger.error('GCal OAuth callback failed', { error: error.message });
    return res.redirect(302, '/admin?calendar=error&reason=exchange_failed');
  }
});

router.post(
  '/disconnect',
  authenticate,
  verifyTokenVersion,
  requireAdmin,
  async (req, res, next) => {
    try {
      await revokeAccess(req.user.id);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  }
);

// Backfill is now automatic. The OAuth callback path
// (exchangeCodeForTokens → autoBackfillForUser) enqueues create ops
// for every future, uncancelled, un-synced class the admin owns the
// moment the connection becomes active. The previous manual endpoint
// is gone; the dashboard card no longer renders a button.

export default router;
