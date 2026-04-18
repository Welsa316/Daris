import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const BCRYPT_ROUNDS = 12;

// AES-256-GCM constants. IV length is 12 bytes per NIST guidance; auth tag
// is always 16 bytes. The key must be 32 raw bytes (we accept base64 input
// so it's safe to paste into Railway env vars).
const AES_ALGO = 'aes-256-gcm';
const AES_IV_LENGTH = 12;
const AES_KEY_LENGTH = 32;

/**
 * Parse TOKEN_ENCRYPTION_KEY from env into a 32-byte Buffer.
 * Cached after first call. Throws if the key is missing or the wrong length
 * so callers fail fast instead of silently writing undecryptable ciphertext.
 */
let cachedKey = null;
function getEncryptionKey() {
  if (cachedKey) return cachedKey;
  if (!env.TOKEN_ENCRYPTION_KEY) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY is not set. Generate one with ' +
      '`openssl rand -base64 32` and add it to the server environment.'
    );
  }
  const buf = Buffer.from(env.TOKEN_ENCRYPTION_KEY, 'base64');
  if (buf.length !== AES_KEY_LENGTH) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must decode to exactly ${AES_KEY_LENGTH} bytes ` +
      `(got ${buf.length}). Regenerate it with \`openssl rand -base64 32\`.`
    );
  }
  cachedKey = buf;
  return cachedKey;
}

/**
 * Hash a password with bcrypt (cost factor 12)
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically random token (hex string)
 */
export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash a token with SHA-256 for database storage
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically random UUID v4
 */
export function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Encrypt a short secret string (e.g. an OAuth refresh or access token)
 * using AES-256-GCM.
 *
 * Output format: `<iv_base64>:<ciphertext_base64>:<authTag_base64>`.
 * The colon separator is chosen because base64 never contains colons, so
 * parsing is unambiguous without JSON overhead.
 *
 * The IV is regenerated on every call so encrypting the same plaintext
 * twice produces different ciphertext (this is required: reusing an IV
 * with GCM compromises the key).
 */
export function encryptSecret(plaintext) {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('encryptSecret: plaintext must be a non-empty string');
  }
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(AES_IV_LENGTH);
  const cipher = crypto.createCipheriv(AES_ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    ciphertext.toString('base64'),
    authTag.toString('base64'),
  ].join(':');
}

/**
 * Decrypt a ciphertext produced by encryptSecret.
 *
 * Throws if the ciphertext is malformed, the auth tag doesn't match (wrong
 * key or tampered data), or the key isn't set. Callers should treat any
 * throw as a fatal credential-loss event and prompt the admin to reconnect.
 */
export function decryptSecret(ciphertext) {
  if (typeof ciphertext !== 'string' || !ciphertext.includes(':')) {
    throw new Error('decryptSecret: malformed ciphertext');
  }
  const [ivB64, dataB64, tagB64] = ciphertext.split(':');
  if (!ivB64 || !dataB64 || !tagB64) {
    throw new Error('decryptSecret: ciphertext missing one of iv/data/tag');
  }
  const key = getEncryptionKey();
  const iv = Buffer.from(ivB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  if (iv.length !== AES_IV_LENGTH) {
    throw new Error('decryptSecret: wrong IV length');
  }
  const decipher = crypto.createDecipheriv(AES_ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}
