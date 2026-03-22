import { Router } from 'express';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { enrollmentDecisionSchema, adminNoteSchema, classSessionSchema, classSessionUpdateSchema, rescheduleClassSchema, announcementSchema, paginationSchema, messageStudentSchema, availabilitySlotsSchema, availabilityOverrideSchema, batchClassSchema, meetingLinkSchema } from '../validators/adminSchemas.js';
import { getPendingEnrollments, approveEnrollment, rejectEnrollment, getRejectedApplicants, suspendStudent, removeStudent } from '../services/enrollmentService.js';
import { prisma } from '../config/database.js';
import { sendClassCancelledEmail, sendClassRescheduledEmail } from '../services/emailService.js';
import { t, getLang } from '../utils/i18n.js';
import { auditLog } from '../utils/logger.js';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, verifyTokenVersion, requireAdmin);

// --- Dashboard Stats ---
router.get('/stats', async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const [totalEnrolled, totalPending, upcomingClasses, recentActivity] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'enrolled_student',
          deletedAt: null,
          classAssignments: { some: { classSession: { createdByAdminId: adminId } } },
        },
      }),
      prisma.user.count({ where: { role: 'pending_review', deletedAt: null } }),
      prisma.classSession.count({
        where: {
          createdByAdminId: adminId,
          startTime: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          cancelled: false,
        },
      }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      totalEnrolled,
      totalPending,
      upcomingClasses,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

// --- Enrollment Management ---

router.get('/enrollments/pending', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await getPendingEnrollments(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/enrollments/rejected', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await getRejectedApplicants(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/enrollments/:id/approve', validate(enrollmentDecisionSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await approveEnrollment(req.params.id, {
      message: req.body.message,
      adminId: req.user.id,
      lang,
    });

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('enrollment.approvedAdmin', lang) });
  } catch (error) {
    next(error);
  }
});

router.post('/enrollments/:id/reject', validate(enrollmentDecisionSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await rejectEnrollment(req.params.id, {
      message: req.body.message,
      adminId: req.user.id,
      lang,
    });

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('enrollment.rejectedAdmin', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Student Management ---

router.get('/students', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const { page, limit, search, sort, order } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      role: 'enrolled_student',
      deletedAt: null,
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { country: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const orderBy = {};
    if (sort && ['firstName', 'lastName', 'email', 'country', 'enrolledAt', 'lastLoginAt', 'createdAt'].includes(sort)) {
      orderBy[sort] = order;
    } else {
      orderBy.enrolledAt = 'desc';
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          phone: true,
          whatsapp: true,
          telegram: true,
          enrolledAt: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:id', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const student = await prisma.user.findFirst({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        phone: true,
        whatsapp: true,
        telegram: true,
        role: true,
        enrollmentMessage: true,
        enrolledAt: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        adminNotes: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        classAssignments: {
          orderBy: { classSession: { startTime: 'desc' } },
          select: {
            id: true,
            classSession: {
              select: {
                id: true,
                title: true,
                titleAr: true,
                startTime: true,
                endTime: true,
                meetingLink: true,
                cancelled: true,
                recurrence: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    res.json({ student });
  } catch (error) {
    next(error);
  }
});

router.post('/students/:id/suspend', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await suspendStudent(req.params.id, req.user.id);

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('student.suspended', lang) });
  } catch (error) {
    next(error);
  }
});

router.delete('/students/:id', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await removeStudent(req.params.id, req.user.id);

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('student.removed', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Admin Notes ---

router.get('/students/:id/notes', async (req, res, next) => {
  try {
    const notes = await prisma.adminNote.findMany({
      where: { studentId: req.params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ notes });
  } catch (error) {
    next(error);
  }
});

router.post('/students/:id/notes', validate(adminNoteSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);

    const student = await prisma.user.findFirst({ where: { id: req.params.id } });
    if (!student) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    const note = await prisma.adminNote.create({
      data: {
        studentId: req.params.id,
        authorId: req.user.id,
        content: req.body.content,
      },
      select: { id: true, content: true, createdAt: true },
    });

    auditLog('NOTE_CREATED', { studentId: req.params.id, noteId: note.id, adminId: req.user.id });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

router.put('/notes/:id', validate(adminNoteSchema), async (req, res, next) => {
  try {
    const note = await prisma.adminNote.update({
      where: { id: req.params.id },
      data: { content: req.body.content },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });

    res.json({ note });
  } catch (error) {
    next(error);
  }
});

router.delete('/notes/:id', async (req, res, next) => {
  try {
    await prisma.adminNote.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Scheduling ---

router.get('/classes', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const classWhere = { createdByAdminId: req.user.id };

    const [classes, total] = await Promise.all([
      prisma.classSession.findMany({
        where: classWhere,
        orderBy: { startTime: 'asc' },
        include: {
          assignments: {
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.classSession.count({ where: classWhere }),
    ]);

    res.json({ classes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

router.post('/classes', validate(classSessionSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { studentIds, ...classData } = req.body;

    const classSession = await prisma.classSession.create({
      data: {
        ...classData,
        startTime: new Date(classData.startTime),
        endTime: new Date(classData.endTime),
        recurrenceEnd: classData.recurrenceEnd ? new Date(classData.recurrenceEnd) : null,
        createdByAdminId: req.user.id,
      },
    });

    // Assign students
    let assigneeIds = studentIds;
    if (!assigneeIds || assigneeIds.length === 0) {
      // Assign to all enrolled students
      const enrolled = await prisma.user.findMany({
        where: { role: 'enrolled_student', deletedAt: null },
        select: { id: true },
      });
      assigneeIds = enrolled.map((s) => s.id);
    }

    if (assigneeIds.length > 0) {
      await prisma.classAssignment.createMany({
        data: assigneeIds.map((studentId) => ({
          classSessionId: classSession.id,
          studentId,
        })),
      });
    }

    auditLog('CLASS_CREATED', { classId: classSession.id, adminId: req.user.id });

    res.status(201).json({ message: t('schedule.created', lang), classSession });
  } catch (error) {
    next(error);
  }
});

router.put('/classes/:id', validate(classSessionUpdateSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { studentIds, ...updateData } = req.body;

    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);
    if (updateData.recurrenceEnd) updateData.recurrenceEnd = new Date(updateData.recurrenceEnd);

    const classSession = await prisma.classSession.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Update student assignments if provided
    if (studentIds) {
      await prisma.classAssignment.deleteMany({ where: { classSessionId: classSession.id } });

      if (studentIds.length > 0) {
        await prisma.classAssignment.createMany({
          data: studentIds.map((studentId) => ({
            classSessionId: classSession.id,
            studentId,
          })),
        });
      }
    }

    auditLog('CLASS_UPDATED', { classId: classSession.id, adminId: req.user.id });

    res.json({ message: t('schedule.updated', lang), classSession });
  } catch (error) {
    next(error);
  }
});

router.post('/classes/:id/cancel', async (req, res, next) => {
  try {
    const lang = getLang(req);

    const classSession = await prisma.classSession.update({
      where: { id: req.params.id },
      data: { cancelled: true, cancelledAt: new Date() },
      include: {
        assignments: {
          include: {
            student: { select: { email: true, firstName: true } },
          },
        },
      },
    });

    // Notify assigned students
    for (const assignment of classSession.assignments) {
      sendClassCancelledEmail(
        assignment.student.email,
        assignment.student.firstName,
        classSession.title,
        classSession.startTime.toISOString(),
        lang
      ).catch(() => {});
    }

    auditLog('CLASS_CANCELLED', { classId: classSession.id, adminId: req.user.id });

    res.json({ message: t('schedule.cancelled', lang) });
  } catch (error) {
    next(error);
  }
});

router.post('/classes/:id/reschedule', validate(rescheduleClassSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { startTime, endTime } = req.body;

    // Fetch current class to preserve original times
    const existing = await prisma.classSession.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Class not found' });

    // Preserve the first original times (don't overwrite on subsequent reschedules)
    const originalStartTime = existing.originalStartTime || existing.startTime;
    const originalEndTime = existing.originalEndTime || existing.endTime;

    const classSession = await prisma.classSession.update({
      where: { id: req.params.id },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rescheduled: true,
        rescheduledAt: new Date(),
        originalStartTime,
        originalEndTime,
        // Clear cancelled status if it was cancelled
        cancelled: false,
        cancelledAt: null,
      },
      include: {
        assignments: {
          include: {
            student: { select: { email: true, firstName: true } },
          },
        },
      },
    });

    // Notify assigned students
    for (const assignment of classSession.assignments) {
      sendClassRescheduledEmail(
        assignment.student.email,
        assignment.student.firstName,
        classSession.title,
        existing.startTime.toISOString(),
        new Date(startTime).toISOString(),
        lang
      ).catch(() => {});
    }

    auditLog('CLASS_RESCHEDULED', { classId: classSession.id, adminId: req.user.id });

    res.json({ message: t('schedule.rescheduled', lang), classSession });
  } catch (error) {
    next(error);
  }
});

router.delete('/classes/:id', async (req, res, next) => {
  try {
    const lang = getLang(req);
    await prisma.classSession.delete({ where: { id: req.params.id } });
    auditLog('CLASS_DELETED', { classId: req.params.id, adminId: req.user.id });
    res.json({ message: t('schedule.deleted', lang) });
  } catch (error) {
    next(error);
  }
});

// Delete all classes (bulk wipe)
router.delete('/classes', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const now = new Date();
    await prisma.classAssignment.deleteMany({
      where: { classSession: { createdByAdminId: req.user.id, startTime: { gte: now } } },
    });
    const result = await prisma.classSession.deleteMany({
      where: { createdByAdminId: req.user.id, startTime: { gte: now } },
    });
    auditLog('ALL_CLASSES_DELETED', { count: result.count, adminId: req.user.id });
    res.json({ message: t('schedule.deleted', lang), count: result.count });
  } catch (error) {
    next(error);
  }
});

// --- Settings ---

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result = {};
    for (const s of settings) result[s.key] = s.value;
    res.json({ settings: result });
  } catch (error) {
    next(error);
  }
});

router.put('/settings/meeting-link', validate(meetingLinkSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    await prisma.siteSetting.upsert({
      where: { key: 'meetingLink' },
      update: { value: req.body.meetingLink },
      create: { key: 'meetingLink', value: req.body.meetingLink },
    });
    auditLog('MEETING_LINK_UPDATED', { adminId: req.user.id });
    res.json({ message: t('schedule.updated', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Batch Class Creation (simplified scheduling) ---

router.post('/classes/batch', validate(batchClassSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { studentId, title, titleAr, sessions } = req.body;

    // Get global meeting link
    const meetingLinkSetting = await prisma.siteSetting.findUnique({ where: { key: 'meetingLink' } });
    const meetingLink = meetingLinkSetting?.value || null;

    // Create all sessions + assignments in a transaction
    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const session of sessions) {
        const classSession = await tx.classSession.create({
          data: {
            title,
            titleAr: titleAr || null,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
            meetingLink,
            recurrence: 'weekly',
            createdByAdminId: req.user.id,
          },
        });
        await tx.classAssignment.create({
          data: {
            classSessionId: classSession.id,
            studentId,
          },
        });
        results.push(classSession);
      }
      return results;
    });

    auditLog('CLASSES_BATCH_CREATED', { count: created.length, studentId, adminId: req.user.id });

    res.status(201).json({ message: t('schedule.created', lang), count: created.length });
  } catch (error) {
    next(error);
  }
});

// --- Announcements ---

router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements', validate(announcementSchema), async (req, res, next) => {
  try {
    const announcement = await prisma.announcement.create({ data: req.body });
    auditLog('ANNOUNCEMENT_CREATED', { announcementId: announcement.id, adminId: req.user.id });
    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.put('/announcements/:id', validate(announcementSchema), async (req, res, next) => {
  try {
    const announcement = await prisma.announcement.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.delete('/announcements/:id', async (req, res, next) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Message Student ---
router.post('/students/:id/message', validate(messageStudentSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const student = await prisma.user.findFirst({
      where: { id: req.params.id },
      select: { email: true, firstName: true },
    });

    if (!student) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    // Send email via the configured transport
    const { sendEmail } = await import('../services/emailService.js');

    // We'll use nodemailer directly since sendEmail is not exported
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: student.email,
      subject: req.body.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F4D3A;">Message from Daris</h2>
          <p>Dear ${student.firstName},</p>
          <div style="background: #f5f1e8; padding: 16px; border-radius: 6px; margin: 16px 0;">
            ${req.body.message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    });

    auditLog('STUDENT_MESSAGED', { studentId: req.params.id, adminId: req.user.id });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Availability Management ---

router.get('/availability', async (req, res, next) => {
  try {
    const [slots, overrides] = await Promise.all([
      prisma.availabilitySlot.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }, { startMin: 'asc' }] }),
      prisma.availabilityOverride.findMany({ orderBy: { date: 'asc' } }),
    ]);
    res.json({ slots, overrides });
  } catch (error) {
    next(error);
  }
});

// Replace all availability slots (full save)
router.put('/availability/slots', validate(availabilitySlotsSchema), async (req, res, next) => {
  try {
    const { slots } = req.body;

    // Delete all existing slots and re-create
    await prisma.availabilitySlot.deleteMany();

    if (slots.length > 0) {
      await prisma.availabilitySlot.createMany({
        data: slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startHour: s.startHour,
          startMin: s.startMin || 0,
          endHour: s.endHour,
          endMin: s.endMin || 0,
        })),
      });
    }

    auditLog('AVAILABILITY_UPDATED', { adminId: req.user.id, slotCount: slots.length });

    const updated = await prisma.availabilitySlot.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }] });
    res.json({ slots: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/availability/overrides', validate(availabilityOverrideSchema), async (req, res, next) => {
  try {
    const { date, available, startHour, startMin, endHour, endMin, reason } = req.body;

    const override = await prisma.availabilityOverride.upsert({
      where: { date: new Date(date) },
      create: { date: new Date(date), available, startHour, startMin, endHour, endMin, reason },
      update: { available, startHour, startMin, endHour, endMin, reason },
    });

    auditLog('AVAILABILITY_OVERRIDE_SET', { adminId: req.user.id, date, available });

    res.json({ override });
  } catch (error) {
    next(error);
  }
});

router.delete('/availability/overrides/:id', async (req, res, next) => {
  try {
    await prisma.availabilityOverride.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Get available booking slots for a specific week ---
router.get('/availability/open-slots', async (req, res, next) => {
  try {
    const { weekStart } = req.query; // ISO date string for Monday of the week
    const start = weekStart ? new Date(weekStart) : getMonday(new Date());
    const end = new Date(start.getTime() + 7 * 86400000);

    // Get recurring availability
    const slots = await prisma.availabilitySlot.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }] });

    // Get overrides for this week
    const overrides = await prisma.availabilityOverride.findMany({
      where: { date: { gte: start, lt: end } },
    });

    // Get booked classes for this week
    const bookedClasses = await prisma.classSession.findMany({
      where: {
        startTime: { gte: start, lt: end },
        cancelled: false,
      },
      select: { startTime: true, endTime: true },
    });

    // Build open 1-hour slots
    const openSlots = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + d * 86400000);
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      // Check for override on this date
      const override = overrides.find((o) => o.date.toISOString().split('T')[0] === dateStr);

      let daySlots = [];
      if (override) {
        if (!override.available) continue; // Day off
        if (override.startHour != null && override.endHour != null) {
          daySlots = [{ startHour: override.startHour, startMin: override.startMin || 0, endHour: override.endHour, endMin: override.endMin || 0 }];
        }
      } else {
        daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
      }

      // Generate 1-hour slots within each availability window
      for (const slot of daySlots) {
        const slotStartMin = slot.startHour * 60 + (slot.startMin || 0);
        const slotEndMin = slot.endHour * 60 + (slot.endMin || 0);

        for (let min = slotStartMin; min + 60 <= slotEndMin; min += 60) {
          const hour = Math.floor(min / 60);
          const minute = min % 60;
          const slotStart = new Date(date);
          slotStart.setUTCHours(hour, minute, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + 3600000);

          // Check if this slot overlaps with any booked class
          const isBooked = bookedClasses.some((cls) => {
            return slotStart < new Date(cls.endTime) && slotEnd > new Date(cls.startTime);
          });

          if (!isBooked && slotStart > new Date()) {
            openSlots.push({
              date: dateStr,
              dayOfWeek,
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
            });
          }
        }
      }
    }

    res.json({ openSlots });
  } catch (error) {
    next(error);
  }
});

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// --- Admin List ---
router.get('/admins', async (req, res, next) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin', deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ admins });
  } catch (error) {
    next(error);
  }
});

// --- Audit Logs ---
router.get('/audit-logs', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

export default router;
