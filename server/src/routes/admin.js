import { Router } from 'express';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { enrollmentDecisionSchema, adminNoteSchema, classSessionSchema, classSessionUpdateSchema, announcementSchema, paginationSchema, messageStudentSchema } from '../validators/adminSchemas.js';
import { getPendingEnrollments, approveEnrollment, rejectEnrollment, getRejectedApplicants, suspendStudent, removeStudent } from '../services/enrollmentService.js';
import { prisma } from '../config/database.js';
import { sendClassCancelledEmail } from '../services/emailService.js';
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
    const [totalEnrolled, totalPending, upcomingClasses, recentActivity] = await Promise.all([
      prisma.user.count({ where: { role: 'enrolled_student', deletedAt: null } }),
      prisma.user.count({ where: { role: 'pending_review', deletedAt: null } }),
      prisma.classSession.count({
        where: {
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
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
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

    const [classes, total] = await Promise.all([
      prisma.classSession.findMany({
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
      prisma.classSession.count(),
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
