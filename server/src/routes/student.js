import { Router } from 'express';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireEnrolled, requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/authSchemas.js';
import { prisma } from '../config/database.js';
import { t, getLang } from '../utils/i18n.js';
import { auditLog, logger } from '../utils/logger.js';
import { sendNewEnrollmentNotification } from '../services/emailService.js';

const router = Router();

// All student routes require authentication
router.use(authenticate, verifyTokenVersion);

// --- Enrollment Status (accessible by any authenticated user) ---
router.get('/enrollment-status', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: {
        role: true,
        emailVerified: true,
        rejectedAt: true,
        rejectionMessage: true,
        enrolledAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    // If email is verified but role is still 'pending', fix the inconsistency
    if (user.emailVerified && user.role === 'pending') {
      const fullUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { role: 'pending_review' },
      });
      user.role = 'pending_review';

      // Send admin notification via Formspree that was missed
      sendNewEnrollmentNotification(fullUser).catch((err) =>
        logger.error('Failed to send admin enrollment notification', { error: err.message })
      );
    }

    let status;
    let message;
    switch (user.role) {
      case 'pending':
        status = 'pending_verification';
        message = t('auth.emailNotVerified', lang);
        break;
      case 'pending_review':
        status = 'pending_review';
        message = t('enrollment.pending', lang);
        break;
      case 'enrolled_student':
        status = 'enrolled';
        message = t('enrollment.approved', lang);
        break;
      case 'rejected':
        status = 'rejected';
        message = t('enrollment.rejected', lang);
        break;
      case 'suspended':
        status = 'suspended';
        message = t('auth.forbidden', lang);
        break;
      default:
        status = user.role;
        message = '';
    }

    res.json({
      status,
      message,
      enrolledAt: user.enrolledAt,
      rejectedAt: user.rejectedAt,
    });
  } catch (error) {
    next(error);
  }
});

// --- Student Dashboard (enrolled only) ---
router.get('/dashboard', requireEnrolled, async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: {
        firstName: true,
        lastName: true,
        enrolledAt: true,
        // Notebook URL surfaced as a view-only link on the student
        // dashboard. The sheet itself is shared with anyone-with-link
        // as Reader at create time, so the student opens it and sees
        // a read-only Google Sheets view.
        notebookSheetUrl: true,
      },
    });

    // Upcoming classes assigned to this student
    const now = new Date();
    const upcomingClasses = await prisma.classAssignment.findMany({
      where: {
        studentId: req.user.id,
        classSession: {
          startTime: { gte: now },
          cancelled: false,
        },
      },
      include: {
        classSession: {
          select: {
            id: true,
            title: true,
            titleAr: true,
            description: true,
            descriptionAr: true,
            startTime: true,
            endTime: true,
            timezone: true,
            meetingLink: true,
            cancelled: true,
            rescheduled: true,
            originalStartTime: true,
            originalEndTime: true,
          },
        },
      },
      orderBy: { classSession: { startTime: 'asc' } },
      take: 10,
    });

    // We used to embed the meeting URL in this response during the 15-min
    // window. That's a leak. anyone with network-tab access could grab
    // the URL and reconnect outside class hours. Instead, return only a
    // `canJoin` flag and make the student hit /api/meeting/:id/link to
    // actually retrieve the URL; that endpoint enforces the window server-
    // side so the URL is never handed out outside it.
    const MEETING_LINK_WINDOW_MS = 15 * 60 * 1000;
    const classesForClient = upcomingClasses.map((assignment) => {
      const cls = assignment.classSession;
      const timeUntilClass = new Date(cls.startTime).getTime() - now.getTime();
      const classEnded = new Date(cls.endTime).getTime() < now.getTime();
      return {
        id: cls.id,
        title: cls.title,
        titleAr: cls.titleAr,
        subject: cls.subject,
        description: cls.description,
        descriptionAr: cls.descriptionAr,
        startTime: cls.startTime,
        endTime: cls.endTime,
        timezone: cls.timezone,
        rescheduled: cls.rescheduled,
        originalStartTime: cls.originalStartTime,
        canJoin: !classEnded && timeUntilClass <= MEETING_LINK_WINDOW_MS,
        meetingLinkAvailableIn: timeUntilClass > MEETING_LINK_WINDOW_MS ? Math.ceil(timeUntilClass / 60000) : null,
      };
    });

    // Past classes. Filter out soft-cancelled rows (legacy data from
    // before hard-delete shipped) so the student doesn't see classes
    // that were cancelled, especially since we no longer email them
    // about cancellations — those should be invisible end-to-end.
    const pastClasses = await prisma.classAssignment.findMany({
      where: {
        studentId: req.user.id,
        classSession: {
          endTime: { lt: now },
          cancelled: false,
        },
      },
      include: {
        classSession: {
          select: {
            id: true,
            title: true,
            titleAr: true,
            startTime: true,
            endTime: true,
            cancelled: true,
            rescheduled: true,
            originalStartTime: true,
          },
        },
      },
      orderBy: { classSession: { startTime: 'desc' } },
      take: 20,
    });

    // Active announcements
    const announcements = await prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        titleAr: true,
        content: true,
        contentAr: true,
        createdAt: true,
      },
      take: 10,
    });

    // Effective teachers = explicit TeacherStudent rows if any exist,
    // otherwise fall back to all active admins (the sheikh teaches by
    // default). The student-side dashboard renders this as
    // "Your teacher: {first names}" so the relationship is visible
    // even when no one explicitly assigned anything.
    const explicitTeachers = await prisma.teacherStudent.findMany({
      where: { studentId: req.user.id },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });
    let teachers = explicitTeachers
      .map((row) => row.teacher)
      .filter((t) => t != null);
    if (teachers.length === 0) {
      const admins = await prisma.user.findMany({
        where: { role: 'admin', deletedAt: null },
        select: { id: true, firstName: true, lastName: true, role: true },
      });
      teachers = admins;
    }

    res.json({
      student: {
        firstName: user.firstName,
        lastName: user.lastName,
        enrolledAt: user.enrolledAt,
        status: 'Active',
      },
      notebookSheetUrl: user.notebookSheetUrl || null,
      teachers: teachers.map((t) => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        // Owner flag so the frontend can show a small "Sheikh" or
        // "Owner" hint next to the sheikh's name if multiple teachers
        // exist.
        isOwner: t.role === 'admin',
      })),
      upcomingClasses: classesForClient,
      pastClasses: pastClasses.map((a) => a.classSession),
      announcements,
    });
  } catch (error) {
    next(error);
  }
});

// --- Update Profile ---
router.put('/profile', requireRole('enrolled_student', 'pending', 'pending_review'), validate(updateProfileSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        country: true,
        phone: true,
        whatsapp: true,
        telegram: true,
      },
    });

    auditLog('PROFILE_UPDATED', { userId: req.user.id, ip: req.ip });

    res.json({ message: t('student.profileUpdated', lang), user: updated });
  } catch (error) {
    next(error);
  }
});

// --- Get Schedule ---
router.get('/schedule', requireEnrolled, async (req, res, next) => {
  try {
    const now = new Date();
    const MEETING_LINK_WINDOW_MS = 15 * 60 * 1000;

    const assignments = await prisma.classAssignment.findMany({
      where: { studentId: req.user.id },
      include: { classSession: true },
      orderBy: { classSession: { startTime: 'asc' } },
    });

    // Same rationale as /dashboard: don't embed the URL here. Return a
    // canJoin boolean so the frontend knows to show a Join button, and
    // make the button fetch the link from /api/meeting/:id/link, which
    // enforces the window server-side.
    const schedule = assignments.map((a) => {
      const cls = a.classSession;
      const timeUntilClass = new Date(cls.startTime).getTime() - now.getTime();
      const classEnded = new Date(cls.endTime).getTime() < now.getTime();
      return {
        id: cls.id,
        title: cls.title,
        titleAr: cls.titleAr,
        subject: cls.subject,
        description: cls.description,
        descriptionAr: cls.descriptionAr,
        startTime: cls.startTime,
        endTime: cls.endTime,
        timezone: cls.timezone,
        canJoin: !cls.cancelled && !classEnded && timeUntilClass <= MEETING_LINK_WINDOW_MS,
        cancelled: cls.cancelled,
        recurrence: cls.recurrence,
      };
    });

    res.json({ schedule });
  } catch (error) {
    next(error);
  }
});

/**
 * Student-visible lesson reports. Only returns rows the sheikh explicitly
 * published (visibility='student'). adminNotes is stripped from the
 * response regardless of visibility. it's never shared.
 */
router.get('/lesson-reports', requireEnrolled, async (req, res, next) => {
  try {
    const reports = await prisma.classLog.findMany({
      where: { studentId: req.user.id, visibility: 'student' },
      select: {
        id: true,
        summary: true,
        homework: true,
        nextSteps: true,
        createdAt: true,
        updatedAt: true,
        classSession: {
          select: { id: true, title: true, titleAr: true, startTime: true },
        },
      },
      orderBy: { classSession: { startTime: 'desc' } },
    });
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

export default router;
