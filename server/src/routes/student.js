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
          },
        },
      },
      orderBy: { classSession: { startTime: 'asc' } },
      take: 10,
    });

    // Get global meeting link fallback
    const globalLinkSetting = await prisma.siteSetting.findUnique({ where: { key: 'meetingLink' } });
    const globalMeetingLink = globalLinkSetting?.value || null;

    // Conditionally show meeting links (only 30 min before class)
    const MEETING_LINK_WINDOW_MS = 30 * 60 * 1000;
    const classesForClient = upcomingClasses.map((assignment) => {
      const cls = assignment.classSession;
      const timeUntilClass = new Date(cls.startTime).getTime() - now.getTime();
      const link = cls.meetingLink || globalMeetingLink;
      return {
        id: cls.id,
        title: cls.title,
        titleAr: cls.titleAr,
        description: cls.description,
        descriptionAr: cls.descriptionAr,
        startTime: cls.startTime,
        endTime: cls.endTime,
        timezone: cls.timezone,
        // Only reveal meeting link within 30 minutes of class start
        meetingLink: timeUntilClass <= MEETING_LINK_WINDOW_MS && timeUntilClass > 0 ? link : null,
        meetingLinkAvailableIn: timeUntilClass > MEETING_LINK_WINDOW_MS ? Math.ceil(timeUntilClass / 60000) : null,
      };
    });

    // Past classes
    const pastClasses = await prisma.classAssignment.findMany({
      where: {
        studentId: req.user.id,
        classSession: {
          endTime: { lt: now },
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

    res.json({
      student: {
        firstName: user.firstName,
        lastName: user.lastName,
        enrolledAt: user.enrolledAt,
        status: 'Active',
      },
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
    const MEETING_LINK_WINDOW_MS = 30 * 60 * 1000;

    const [assignments, globalLinkSetting] = await Promise.all([
      prisma.classAssignment.findMany({
        where: { studentId: req.user.id },
        include: { classSession: true },
        orderBy: { classSession: { startTime: 'asc' } },
      }),
      prisma.siteSetting.findUnique({ where: { key: 'meetingLink' } }),
    ]);
    const globalMeetingLink = globalLinkSetting?.value || null;

    const schedule = assignments.map((a) => {
      const cls = a.classSession;
      const timeUntilClass = new Date(cls.startTime).getTime() - now.getTime();
      const link = cls.meetingLink || globalMeetingLink;
      return {
        id: cls.id,
        title: cls.title,
        titleAr: cls.titleAr,
        description: cls.description,
        descriptionAr: cls.descriptionAr,
        startTime: cls.startTime,
        endTime: cls.endTime,
        timezone: cls.timezone,
        meetingLink: timeUntilClass <= MEETING_LINK_WINDOW_MS && timeUntilClass > 0 ? link : null,
        cancelled: cls.cancelled,
        recurrence: cls.recurrence,
      };
    });

    res.json({ schedule });
  } catch (error) {
    next(error);
  }
});

export default router;
