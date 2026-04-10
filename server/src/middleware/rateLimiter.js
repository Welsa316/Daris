import rateLimit from 'express-rate-limit';
import { t, getLang } from '../utils/i18n.js';

const tooManyHandler = (req, res) => {
  const lang = getLang(req);
  res.status(429).json({ error: t('error.tooManyRequests', lang) });
};

/**
 * Login endpoint: max 15 per IP per 15 minutes
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyHandler,
  keyGenerator: (req) => req.ip,
});

/**
 * Registration endpoint: max 10 per IP per hour
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyHandler,
  keyGenerator: (req) => req.ip,
});

/**
 * Password reset: max 3 per IP per hour
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyHandler,
  keyGenerator: (req) => req.ip,
});

/**
 * Email verification resend: max 3 per hour
 */
export const verificationResendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyHandler,
  keyGenerator: (req) => req.ip,
});

/**
 * General API: max 100 per user per minute
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyHandler,
  keyGenerator: (req) => req.user?.id || req.ip,
});
