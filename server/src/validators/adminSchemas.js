import { z } from 'zod';

// Shared refinement: endTime must be strictly after startTime. Applied to every
// schema that accepts a time range so the admin can't accidentally create an
// inverted class (which also breaks conflict-detection math).
const endAfterStart = (d) => new Date(d.endTime) > new Date(d.startTime);
const endAfterStartErr = {
  message: 'End time must be after start time',
  path: ['endTime'],
};

export const enrollmentDecisionSchema = z.object({
  message: z.string().max(1000).optional().nullable(),
});

export const adminNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(10000),
});

export const classSessionSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200).trim(),
    titleAr: z.string().max(200).trim().optional().nullable(),
    description: z.string().max(5000).trim().optional().nullable(),
    descriptionAr: z.string().max(5000).trim().optional().nullable(),
    startTime: z.string().datetime({ message: 'Invalid start time' }),
    endTime: z.string().datetime({ message: 'Invalid end time' }),
    timezone: z.string().default('UTC'),
    meetingLink: z.string().url('Invalid meeting link').optional().nullable(),
    recurrence: z.enum(['weekly', 'biweekly', 'custom']).optional().nullable(),
    recurrenceEnd: z.string().datetime().optional().nullable(),
    studentIds: z.array(z.string().uuid()).optional(), // Empty = all enrolled students
  })
  .refine(endAfterStart, endAfterStartErr);

// `.partial()` strips the refine; re-apply conditionally so a partial update
// touching only one of the two fields isn't blocked, but a PATCH with both
// still gets validated.
export const classSessionUpdateSchema = classSessionSchema
  .innerType()
  .partial()
  .refine(
    (d) => d.startTime == null || d.endTime == null || endAfterStart(d),
    endAfterStartErr
  );

export const rescheduleClassSchema = z
  .object({
    startTime: z.string().datetime({ message: 'Invalid start time' }),
    endTime: z.string().datetime({ message: 'Invalid end time' }),
  })
  .refine(endAfterStart, endAfterStartErr);

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  titleAr: z.string().max(200).trim().optional().nullable(),
  content: z.string().min(1, 'Content is required').max(5000).trim(),
  contentAr: z.string().max(5000).trim().optional().nullable(),
  active: z.boolean().default(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
  search: z.string().max(100).optional(),
  sort: z.string().max(50).optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const messageStudentSchema = z.object({
  subject: z.string().min(1).max(200).trim(),
  message: z.string().min(1).max(5000).trim(),
});

export const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startHour: z.number().int().min(0).max(23),
  startMin: z.number().int().min(0).max(59).default(0),
  endHour: z.number().int().min(0).max(23),
  endMin: z.number().int().min(0).max(59).default(0),
});

export const availabilitySlotsSchema = z.object({
  slots: z.array(availabilitySlotSchema),
});

export const batchClassSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().min(1).max(200).trim(),
  titleAr: z.string().max(200).trim().optional().nullable(),
  // Subject area: 'quran' | 'fiqh' | 'arabic' (or any free-form label).
  // Null lets a scheduler skip picking one and drops into the neutral
  // calendar color. Keep the list open so we can add types later.
  subject: z.string().min(1).max(40).optional().nullable(),
  // IANA timezone the wall-clock times should be interpreted in. Persisted
  // on each ClassSession so reminder emails render in the right zone.
  timezone: z.string().min(1).max(64).default('Africa/Cairo'),
  sessions: z
    .array(
      z
        .object({
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),
        })
        .refine(endAfterStart, endAfterStartErr)
    )
    .min(1)
    .max(200),
  // Optional per-session resolutions for detected conflicts. Key is the session
  // startTime ISO string, value is the action the admin chose in the UI.
  resolutions: z
    .record(z.string(), z.enum(['merge', 'create', 'force', 'skip']))
    .optional(),
});

export const checkConflictsSchema = z.object({
  studentId: z.string().uuid(),
  sessions: z
    .array(
      z
        .object({
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),
        })
        .refine(endAfterStart, endAfterStartErr)
    )
    .min(1)
    .max(200),
});

export const classLogSchema = z.object({
  summary: z.string().max(20000).default(''),
  homework: z.string().max(20000).default(''),
  nextSteps: z.string().max(20000).default(''),
  adminNotes: z.string().max(20000).default(''),
  // 'private' = admin only. 'student' = student can see summary/homework/next.
  // adminNotes is always admin-only regardless of visibility.
  visibility: z.enum(['private', 'student']).default('private'),
});

// Payment amounts are stored in minor units (piastres / cents). Cap at
// 10,000,000 = 100,000 major units per row. well above realistic tuition so
// a fat-finger can't create a nine-figure entry.
// paidAt must be on or before now so "future" payments can't land in the
// ledger from a typo on the date picker.
export const paymentSchema = z.object({
  amount: z.number().int().positive().max(10_000_000),
  currency: z.string().min(1).max(10).default('EGP'),
  period: z.string().min(1).max(100).trim(),
  paidAt: z.string().datetime().refine(
    (d) => new Date(d).getTime() <= Date.now() + 60_000, // 60s clock-skew tolerance
    { message: 'Payment date cannot be in the future', path: ['paidAt'] }
  ),
  notes: z.string().max(2000).optional().nullable(),
});

export const paymentUpdateSchema = paymentSchema.partial();

// Only admin-facing profile fields go through this route. All optional.
// sending only one key updates only that one.
export const studentProfileSchema = z
  .object({
    preferredLanguage: z.enum(['en', 'ar']).optional(),
    // Minor units again. Null explicitly allowed so admin can clear the
    // expectation (no balance pill will render).
    expectedMonthlyAmount: z
      .number()
      .int()
      .positive()
      .max(10_000_000)
      .optional()
      .nullable(),
    expectedMonthlyCurrency: z.string().min(1).max(10).optional().nullable(),
  })
  .refine(
    (d) =>
      (d.expectedMonthlyAmount == null && d.expectedMonthlyCurrency == null) ||
      (d.expectedMonthlyAmount != null && d.expectedMonthlyCurrency),
    {
      message: 'Amount and currency must be set together, or both cleared',
      path: ['expectedMonthlyCurrency'],
    }
  );

export const meetingLinkSchema = z.object({
  meetingLink: z.string().url('Invalid meeting link').max(500),
});

export const availabilityOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  available: z.boolean().default(false),
  startHour: z.number().int().min(0).max(23).optional().nullable(),
  startMin: z.number().int().min(0).max(59).optional().nullable(),
  endHour: z.number().int().min(0).max(23).optional().nullable(),
  endMin: z.number().int().min(0).max(59).optional().nullable(),
  reason: z.string().max(200).optional().nullable(),
});
