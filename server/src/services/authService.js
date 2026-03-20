import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword, generateToken, hashToken } from '../utils/crypto.js';
import { generateAccessToken, createRefreshToken, invalidateAllSessions } from './tokenService.js';
import { sendVerificationEmail, sendAccountLockedEmail, sendNewEnrollmentNotification } from './emailService.js';
import { logger, auditLog } from '../utils/logger.js';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

/**
 * Register a new user account
 */
export async function registerUser({ firstName, lastName, email, password, country, phone, whatsapp, telegram, enrollmentMessage }, { ipAddress, lang }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check email uniqueness
  const existing = await prisma.user.findFirst({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return { error: 'register.emailExists' };
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      firstName: sanitizeText(firstName),
      lastName: sanitizeText(lastName),
      country: sanitizeText(country),
      phone: phone || null,
      whatsapp: whatsapp || null,
      telegram: telegram || null,
      enrollmentMessage: enrollmentMessage ? sanitizeText(enrollmentMessage).substring(0, 500) : null,
      role: 'pending',
    },
  });

  // Generate email verification token
  const rawToken = generateToken(32);
  const tokenHash = hashToken(rawToken);

  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash,
      type: 'verification',
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    },
  });

  // Send verification email (async, don't block)
  sendVerificationEmail(normalizedEmail, rawToken, lang).catch((err) =>
    logger.error('Failed to send verification email', { error: err.message })
  );

  auditLog('USER_REGISTERED', { userId: user.id, ip: ipAddress });

  return { success: true, userId: user.id };
}

/**
 * Verify email with token
 */
export async function verifyEmail(rawToken) {
  const tokenHash = hashToken(rawToken);

  const emailToken = await prisma.emailToken.findFirst({
    where: {
      tokenHash,
      type: 'verification',
      used: false,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!emailToken) {
    return { error: 'email.invalidToken' };
  }

  if (emailToken.user.emailVerified) {
    return { error: 'email.alreadyVerified' };
  }

  // Mark token as used and update user
  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: emailToken.id },
      data: { used: true },
    }),
    prisma.user.update({
      where: { id: emailToken.userId },
      data: {
        emailVerified: true,
        role: 'pending_review',
      },
    }),
  ]);

  auditLog('EMAIL_VERIFIED', { userId: emailToken.userId });

  // Notify admin that a student is ready for review
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) {
    const student = emailToken.user;
    sendNewEnrollmentNotification(admin.email, `${student.firstName} ${student.lastName}`).catch((err) =>
      logger.error('Failed to send admin enrollment notification', { error: err.message })
    );
  }

  return { success: true };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email, lang) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });

  if (!user || user.emailVerified) {
    // Don't reveal whether user exists
    return { success: true };
  }

  // Check rate limit: max 3 per hour
  const recentTokens = await prisma.emailToken.count({
    where: {
      userId: user.id,
      type: 'verification',
      createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  if (recentTokens >= 3) {
    return { error: 'email.resendLimit' };
  }

  const rawToken = generateToken(32);
  const tokenHash = hashToken(rawToken);

  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash,
      type: 'verification',
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    },
  });

  sendVerificationEmail(normalizedEmail, rawToken, lang).catch((err) =>
    logger.error('Failed to resend verification email', { error: err.message })
  );

  return { success: true };
}

/**
 * Login a user
 */
export async function loginUser({ email, password }, { ipAddress, deviceInfo, lang }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findFirst({
    where: { email: normalizedEmail },
  });

  if (!user) {
    auditLog('LOGIN_FAILED_UNKNOWN_EMAIL', { email: normalizedEmail, ip: ipAddress });
    return { error: 'auth.invalidCredentials' };
  }

  // Check account lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    auditLog('LOGIN_ATTEMPT_LOCKED', { userId: user.id, ip: ipAddress });
    return { error: 'auth.accountLocked' };
  }

  // Reset lockout if expired
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  // Verify password
  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    const newAttempts = user.failedLoginAttempts + 1;
    const updateData = { failedLoginAttempts: newAttempts };

    if (newAttempts >= LOCKOUT_THRESHOLD) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      sendAccountLockedEmail(user.email, lang).catch(() => {});
      auditLog('ACCOUNT_LOCKED', { userId: user.id, ip: ipAddress });
    }

    await prisma.user.update({ where: { id: user.id }, data: updateData });
    auditLog('LOGIN_FAILED', { userId: user.id, ip: ipAddress });
    return { error: 'auth.invalidCredentials' };
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return { error: 'auth.emailNotVerified' };
  }

  // Check if user is suspended or deleted
  if (user.role === 'suspended' || user.deletedAt) {
    return { error: 'auth.invalidCredentials' };
  }

  // Successful login — reset failed attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = await createRefreshToken(user, { deviceInfo, ipAddress });

  auditLog('LOGIN_SUCCESS', { userId: user.id, ip: ipAddress });

  return {
    success: true,
    accessToken,
    refreshToken,
    user: sanitizeUserForClient(user),
  };
}

/**
 * Change password (authenticated user)
 */
export async function changePassword(userId, { currentPassword, newPassword }, ipAddress) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) return { error: 'student.notFound' };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { error: 'auth.invalidCredentials' };

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Invalidate ALL sessions
  await invalidateAllSessions(userId);

  auditLog('PASSWORD_CHANGED', { userId, ip: ipAddress });

  return { success: true };
}

// --- Helpers ---

function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '') // Strip basic HTML tags
    .replace(/&/g, '&amp;')
    .trim();
}

export function sanitizeUserForClient(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phone: user.phone,
    whatsapp: user.whatsapp,
    telegram: user.telegram,
    role: user.role,
    emailVerified: user.emailVerified,
    enrolledAt: user.enrolledAt,
    createdAt: user.createdAt,
  };
}
