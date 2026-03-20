import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { generateToken, hashToken } from '../utils/crypto.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const ABSOLUTE_SESSION_HOURS = 24;

/**
 * Generate a signed JWT access token
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' }
  );
}

/**
 * Verify and decode a JWT access token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
}

/**
 * Create a new refresh token + session record
 */
export async function createRefreshToken(user, { deviceInfo, ipAddress }) {
  const rawToken = generateToken(48);
  const tokenHash = hashToken(rawToken);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const absoluteExpiry = new Date(now.getTime() + ABSOLUTE_SESSION_HOURS * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: tokenHash,
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || null,
      expiresAt,
      absoluteExpiry,
    },
  });

  return rawToken;
}

/**
 * Rotate a refresh token: validate old one, issue new one, invalidate old
 */
export async function rotateRefreshToken(oldRawToken, { deviceInfo, ipAddress }) {
  const oldHash = hashToken(oldRawToken);

  const session = await prisma.session.findUnique({
    where: { refreshToken: oldHash },
    include: { user: true },
  });

  if (!session) return null;

  // Check expiry
  const now = new Date();
  if (session.expiresAt < now || session.absoluteExpiry < now) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  // Check if user is still active
  if (session.user.deletedAt || session.user.role === 'suspended') {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  // Delete old session
  await prisma.session.delete({ where: { id: session.id } });

  // Create new refresh token + session
  const newRawToken = generateToken(48);
  const newHash = hashToken(newRawToken);
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: session.userId,
      refreshToken: newHash,
      deviceInfo: deviceInfo || session.deviceInfo,
      ipAddress: ipAddress || session.ipAddress,
      expiresAt,
      absoluteExpiry: session.absoluteExpiry, // Keep original absolute expiry
      lastActiveAt: now,
    },
  });

  // Generate new access token
  const accessToken = generateAccessToken(session.user);

  return { accessToken, refreshToken: newRawToken, user: session.user };
}

/**
 * Invalidate a single session by refresh token
 */
export async function invalidateSession(rawToken) {
  const tokenHash = hashToken(rawToken);
  try {
    await prisma.session.delete({ where: { refreshToken: tokenHash } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Invalidate ALL sessions for a user (logout all devices, password change, etc.)
 */
export async function invalidateAllSessions(userId) {
  await prisma.session.deleteMany({ where: { userId } });
  // Increment token version so existing access tokens become invalid
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId) {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      deviceInfo: true,
      ipAddress: true,
      lastActiveAt: true,
      createdAt: true,
    },
    orderBy: { lastActiveAt: 'desc' },
  });
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
