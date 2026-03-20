import { verifyAccessToken } from '../services/tokenService.js';
import { prisma } from '../config/database.js';
import { t, getLang } from '../utils/i18n.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware — verifies JWT access token from cookie
 * Attaches req.user with { id, role, tokenVersion }
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
 * (catches invalidated sessions from password change / force logout)
 */
export async function verifyTokenVersion(req, res, next) {
  const lang = getLang(req);

  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: { tokenVersion: true, deletedAt: true, role: true },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({ error: t('auth.unauthorized', lang) });
    }

    if (user.tokenVersion !== req.user.tokenVersion) {
      return res.status(401).json({ error: t('auth.tokenExpired', lang), code: 'TOKEN_EXPIRED' });
    }

    // Update role from DB (in case it changed)
    req.user.role = user.role;
    next();
  } catch (error) {
    logger.error('Token version check failed', { error: error.message });
    return res.status(500).json({ error: t('error.generic', lang) });
  }
}
