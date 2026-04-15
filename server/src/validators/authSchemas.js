import { z } from 'zod';

// Password requirements: 8+ chars. Strength is the user's responsibility.
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: passwordSchema,
  country: z.string().min(1, 'Country is required').max(100).trim(),
  phone: z.string().min(1, 'Phone number is required').max(20).trim(),
  enrollmentMessage: z.string().max(500).optional().nullable(),
});

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
