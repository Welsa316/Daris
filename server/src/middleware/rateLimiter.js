import rateLimit from 'express-rate-limit';

/**
 * Login endpoint: max 5 per IP per 15 minutes
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.', ar: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.' },
  keyGenerator: (req) => req.ip,
});

/**
 * Registration endpoint: max 3 per IP per hour
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.', ar: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.' },
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
  message: { error: 'Too many requests. Please try again later.', ar: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.' },
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
  message: { error: 'Too many requests. Please try again later.', ar: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.' },
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
  message: { error: 'Too many requests. Please try again later.', ar: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.' },
  keyGenerator: (req) => req.user?.id || req.ip,
});
