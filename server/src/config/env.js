import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().default(''), // Set to Railway public URL (e.g. https://daris-production.up.railway.app)
  SMTP_HOST: z.string().default('smtp.resend.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z.coerce.boolean().default(true),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('Daris <noreply@daris.com>'),
  CSRF_SECRET: z.string().min(16).default('dev-csrf-secret-change-me'),

  // WhatsApp (Meta Cloud API)
  WHATSAPP_ENABLED: z.coerce.boolean().default(false),
  WHATSAPP_API_TOKEN: z.string().default(''),
  WHATSAPP_PHONE_NUMBER_ID: z.string().default(''), // Meta Business phone number ID
  WHATSAPP_ADMIN_PHONE: z.string().default(''), // Sheikh's WhatsApp number (e.g. 966501234567)
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
