import { verifyAccessToken } from '../services/tokenService.js';
import { prisma } from '../config/database.js';
import { t, getLang } from '../utils/i18n.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware. verifies JWT access token from cookie
 * Attaches req.user with { id, role, tokenVersion }. The isTeacher
 * capability is loaded fresh from the DB by `verifyTokenVersion` so
 * a sheikh-driven promote/demote takes effect on the user's next
 * request without forcing a re-login.
 */
export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;
  const lang = getLang(req);

  if (!token) {
    return res.status(401).json({ error: t('auth.unauthorized', lang) });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion,
      // Default until verifyTokenVersion fills the real value from DB.
      // Anything before that middleware runs should NOT trust isTeacher.
      isTeacher: false,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: t('auth.tokenExpired', lang), code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: t('auth.unauthorized', lang) });
  }
}

/**
 * Verify that the user's token version matches current DB version
 * (catches invalidated sessions from password change / force logout).
 * Also refreshes role + isTeacher from the DB so the sheikh's
 * promote/demote actions apply on the very next request.
 */
export async function verifyTokenVersion(req, res, next) {
  const lang = getLang(req);

  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: { tokenVersion: true, deletedAt: true, role: true, isTeacher: true },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({ error: t('auth.unauthorized', lang) });
    }

    if (user.tokenVersion !== req.user.tokenVersion) {
      return res.status(401).json({ error: t('auth.tokenExpired', lang), code: 'TOKEN_EXPIRED' });
    }

    // Refresh role + isTeacher from DB. A user toggled to isTeacher=true
    // mid-session gets teacher capabilities on their next call without
    // having to log out and back in.
    req.user.role = user.role;
    req.user.isTeacher = user.isTeacher;
    next();
  } catch (error) {
    logger.error('Token version check failed', { error: error.message });
    return res.status(500).json({ error: t('error.generic', lang) });
  }
}
