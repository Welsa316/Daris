import { z } from 'zod';

export const enrollmentDecisionSchema = z.object({
  message: z.string().max(1000).optional().nullable(),
});

export const adminNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(10000),
});

export const classSessionSchema = z.object({
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
});

export const classSessionUpdateSchema = classSessionSchema.partial();

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  titleAr: z.string().max(200).trim().optional().nullable(),
  content: z.string().min(1, 'Content is required').max(5000).trim(),
  contentAr: z.string().max(5000).trim().optional().nullable(),
  active: z.boolean().default(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
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
  sessions: z.array(z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })).min(1).max(200),
});

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
