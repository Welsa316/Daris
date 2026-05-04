import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().default(''), // Set to Railway public URL (e.g. https://daris-production.up.railway.app)
  RESEND_API_KEY: z.string().default(''),            // Resend API key (starts with re_)
  EMAIL_FROM: z.string().default('Daris <noreply@daris.education>'),
  ADMIN_EMAIL: z.string().default(''),
  CSRF_SECRET: z.string().min(16).default('dev-csrf-secret-change-me'),

  // Google Calendar integration. All four are optional so the server can
  // boot without them (Calendar integration is then silently disabled and
  // the admin UI shows a "Not configured" state). In production any admin
  // who tries to connect without these set will get a clear error instead
  // of the OAuth flow starting against garbage credentials.
  GOOGLE_OAUTH_CLIENT_ID: z.string().default(''),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().default(''),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().default(''),
  // 32 raw bytes, base64-encoded (generate once: `openssl rand -base64 32`).
  // Used to AES-256-GCM encrypt refresh tokens at rest. If absent or the
  // wrong length, tokenCrypto refuses to encrypt/decrypt and the sync job
  // won't start. Classes still work; they just use the global meeting link.
  TOKEN_ENCRYPTION_KEY: z.string().default(''),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';

// Calendar integration is only truly active when all four Google vars are
// present. Booleans used by the OAuth route, the sync job, and the admin
// UI status endpoint to degrade gracefully.
export const isGoogleCalendarConfigured = Boolean(
  env.GOOGLE_OAUTH_CLIENT_ID &&
  env.GOOGLE_OAUTH_CLIENT_SECRET &&
  env.GOOGLE_OAUTH_REDIRECT_URI &&
  env.TOKEN_ENCRYPTION_KEY
);

if (isProd && !isGoogleCalendarConfigured) {
  // Spell out exactly which var(s) are missing so we don't have to play
  // "guess which one Railway didn't pick up". Each entry is the var name
  // if it's empty/unset, false otherwise; the filter strips the falsies.
  const missing = [
    !env.GOOGLE_OAUTH_CLIENT_ID && 'GOOGLE_OAUTH_CLIENT_ID',
    !env.GOOGLE_OAUTH_CLIENT_SECRET && 'GOOGLE_OAUTH_CLIENT_SECRET',
    !env.GOOGLE_OAUTH_REDIRECT_URI && 'GOOGLE_OAUTH_REDIRECT_URI',
    !env.TOKEN_ENCRYPTION_KEY && 'TOKEN_ENCRYPTION_KEY',
  ].filter(Boolean);
  console.warn(
    `[env] Google Calendar integration is NOT configured. ` +
    `Missing or empty env vars: ${missing.join(', ')}. ` +
    `Classes will continue to use the global meeting link.`
  );
}
