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
      // 302 so the browser navigates to Google's consent screen.
      res.redirect(302, url);
    } catch (error) {
      next(error);
    }
  }
);

// Google's redirect target. The admin's browser is making the request,
// so the auth cookie comes along normally. We don't run requireAdmin
// here because we want to render a clean error page rather than 403 if
// something's off — but we DO require an authenticated session: the
// state's HMAC isn't enough on its own (a leaked state would let an
// attacker complete the flow on someone else's behalf).
router.get(
  '/callback',
  authenticate,
  verifyTokenVersion,
  async (req, res) => {
    const { code, state, error: oauthError } = req.query;

    // The user denied consent or Google sent us back with an error.
    if (oauthError) {
      logger.warn('GCal OAuth callback: provider error', { error: oauthError });
      return res.redirect(302, '/admin?calendar=error&reason=denied');
    }
    if (!code || !state) {
      return res.redirect(302, '/admin?calendar=error&reason=missing_code');
    }

    try {
      const result = await exchangeCodeForTokens({ code, state });

      // Defense in depth: the state encodes a userId. The user making
      // this request must be the same person who initiated the connect
      // flow. Otherwise an attacker who got hold of a state could
      // attach their Google account to a different admin's record.
      if (result.userId !== req.user.id) {
        logger.warn('GCal callback: state userId mismatch', {
          authUserId: req.user.id,
          stateUserId: result.userId,
        });
        return res.redirect(302, '/admin?calendar=error&reason=state_mismatch');
      }

      return res.redirect(302, '/admin?calendar=connected');
    } catch (error) {
      logger.error('GCal OAuth callback failed', { error: error.message });
      return res.redirect(302, '/admin?calendar=error&reason=exchange_failed');
    }
  }
);

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

export default router;
