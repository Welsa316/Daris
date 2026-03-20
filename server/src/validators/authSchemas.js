import { z } from 'zod';

// Password requirements: 8+ chars, uppercase, lowercase, number, special char
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100).trim(),
    lastName: z.string().min(1, 'Last name is required').max(100).trim(),
    email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
    password: passwordSchema,
    country: z.string().min(1, 'Country is required').max(100).trim(),
    phone: z.string().max(20).optional().nullable(),
    whatsapp: z.string().max(20).optional().nullable(),
    telegram: z.string().max(50).optional().nullable(),
    enrollmentMessage: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => data.phone || data.whatsapp || data.telegram,
    { message: 'At least one contact method is required (phone, WhatsApp, or Telegram)', path: ['phone'] }
  );

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  telegram: z.string().max(50).optional().nullable(),
  country: z.string().min(1).max(100).trim().optional(),
});
