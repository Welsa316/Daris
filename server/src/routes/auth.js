import { Router } from 'express';
import { registerUser, loginUser, verifyEmail, resendVerificationEmail, changePassword } from '../services/authService.js';
import { rotateRefreshToken, invalidateSession, invalidateAllSessions, getUserSessions } from '../services/tokenService.js';
import { prisma } from '../config/database.js';
import { generateToken, hashToken, hashPassword } from '../utils/crypto.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, registerLimiter, passwordResetLimiter, verificationResendLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, changePasswordSchema, requestPasswordResetSchema, resetPasswordSchema, resendVerificationSchema, verifyEmailSchema } from '../validators/authSchemas.js';
import { t, getLang } from '../utils/i18n.js';
import { auditLog } from '../utils/logger.js';
import { env, isProd } from '../config/env.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  path: '/',
};

// --- Registration ---
router.post('/register', registerLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await registerUser(req.body, { ipAddress: req.ip, lang });

    if (result.error) {
      return res.status(400).json({ error: t(result.error, lang) });
    }

    res.status(201).json({ message: t('register.success', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Email Verification ---
router.post('/verify-email', validate(verifyEmailSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await verifyEmail(req.body.token);

    if (result.error) {
      return res.status(400).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('email.verified', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Resend Verification Email ---
router.post('/resend-verification', verificationResendLimiter, validate(resendVerificationSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await resendVerificationEmail(req.body.email, lang);

    if (result.error) {
      return res.status(429).json({ error: t(result.error, lang) });
    }

    // Always return success to not reveal email existence
    res.json({ message: t('email.verificationSent', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Login ---
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const result = await loginUser(req.body, { ipAddress: req.ip, deviceInfo, lang });

    if (result.error) {
      const status = result.error === 'auth.accountLocked' ? 423 : 401;
      return res.status(status).json({ error: t(result.error, lang) });
    }

    // Set tokens in HttpOnly cookies
    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth', // Restrict refresh token path
    });

    res.json({ user: result.user });
  } catch (error) {
    next(error);
  }
});

// --- Token Refresh ---
router.post('/refresh', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const oldToken = req.cookies?.refreshToken;

    if (!oldToken) {
      return res.status(401).json({ error: t('auth.tokenExpired', lang), code: 'TOKEN_EXPIRED' });
    }

    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const result = await rotateRefreshToken(oldToken, { deviceInfo, ipAddress: req.ip });

    if (!result) {
      // Clear cookies
      res.clearCookie('accessToken', COOKIE_OPTIONS);
      res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/api/auth' });
      return res.status(401).json({ error: t('auth.tokenExpired', lang), code: 'TOKEN_EXPIRED' });
    }

    // Set new cookies
    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({ user: { id: result.user.id, role: result.user.role } });
  } catch (error) {
    next(error);
  }
});

// --- Logout ---
router.post('/logout', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await invalidateSession(refreshToken);
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/api/auth' });

    res.json({ message: t('auth.loggedOut', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Logout All Devices ---
router.post('/logout-all', authenticate, verifyTokenVersion, async (req, res, next) => {
  try {
    const lang = getLang(req);
    await invalidateAllSessions(req.user.id);

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/api/auth' });

    auditLog('LOGOUT_ALL_DEVICES', { userId: req.user.id, ip: req.ip });

    res.json({ message: t('auth.loggedOutAll', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Get Active Sessions ---
router.get('/sessions', authenticate, verifyTokenVersion, async (req, res, next) => {
  try {
    const sessions = await getUserSessions(req.user.id);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

// --- Change Password ---
router.post('/change-password', authenticate, verifyTokenVersion, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await changePassword(req.user.id, req.body, req.ip);

    if (result.error) {
      return res.status(400).json({ error: t(result.error, lang) });
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/api/auth' });

    res.json({ message: t('auth.passwordChanged', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Request Password Reset ---
router.post('/forgot-password', passwordResetLimiter, validate(requestPasswordResetSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const normalizedEmail = req.body.email.toLowerCase().trim();

    // Always respond the same way regardless of whether email exists
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });

    if (user) {
      // Check rate limit for this email
      const recentResets = await prisma.emailToken.count({
        where: {
          userId: user.id,
          type: 'password_reset',
          createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });

      if (recentResets < 3) {
        const rawToken = generateToken(32);
        const tokenHash = hashToken(rawToken);

        await prisma.emailToken.create({
          data: {
            userId: user.id,
            tokenHash,
            type: 'password_reset',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          },
        });

        sendPasswordResetEmail(normalizedEmail, rawToken, lang).catch(() => {});
        auditLog('PASSWORD_RESET_REQUESTED', { userId: user.id, ip: req.ip });
      }
    }

    // Always return success
    res.json({ message: t('auth.passwordResetSent', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Reset Password with Token ---
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const tokenHash = hashToken(req.body.token);

    const emailToken = await prisma.emailToken.findFirst({
      where: {
        tokenHash,
        type: 'password_reset',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!emailToken) {
      return res.status(400).json({ error: t('auth.invalidResetToken', lang) });
    }

    // Hash new password and update
    const newHash = await hashPassword(req.body.password);

    await prisma.$transaction([
      prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: emailToken.userId },
        data: { passwordHash: newHash },
      }),
    ]);

    // Invalidate all sessions
    await invalidateAllSessions(emailToken.userId);

    auditLog('PASSWORD_RESET_COMPLETED', { userId: emailToken.userId, ip: req.ip });

    res.json({ message: t('auth.passwordResetSuccess', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Get Current User ---
router.get('/me', authenticate, verifyTokenVersion, async (req, res, next) => {
  try {
    const lang = getLang(req);
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        phone: true,
        whatsapp: true,
        telegram: true,
        role: true,
        emailVerified: true,
        enrolledAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
