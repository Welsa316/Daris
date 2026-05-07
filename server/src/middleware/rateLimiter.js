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

/**
 * Meeting-link gate: max 20 per user per minute. The endpoint already logs
 * every attempt, but without a rate limit a compromised account could still
 * brute-force class IDs to trigger audit noise. 20/min leaves room for a
 * fumble-click or a tab reload but stops scripted attempts dead.
 */
export const meetingLinkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyHandler,
  keyGenerator: (req) => req.user?.id || req.ip,
});

/**
 * Public contact form: max 5 submissions per IP per hour. The form is
 * unauthenticated and visible to anyone on the public site, so we cap
 * hard against bots and scrape-and-spam loops. Genuine retries (form
 * mistypes, network errors) fit comfortably under 5; anything past
 * that is almost certainly automated.
 */
export const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyHandler,
  keyGenerator: (req) => req.ip,
});
