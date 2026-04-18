import { Router } from 'express';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { meetingLinkLimiter } from '../middleware/rateLimiter.js';
import { prisma } from '../config/database.js';
import { auditLog } from '../utils/logger.js';

const router = Router();

// How far before a class starts the join link becomes valid. This single
// constant governs both what students/admins see on their dashboard AND
// what this endpoint returns. so the cosmetic gate and the real gate can
// never drift apart.
const JOIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * Resolve the meeting link for a class after checking that the caller is
 * actually allowed to join it right now. This is the only place on our
 * side that enforces the "link only during the window" rule. the
 * dashboard's show/hide is purely cosmetic and would leak if we embedded
 * the raw URL anywhere.
 *
 * The endpoint always responds; callers never see the URL, only get it
 * when they would actually be admitted.
 *
 *   200 { meetingLink }               . caller can join; URL included.
 *   403 { error, reason: 'too_early' | 'too_late' | 'cancelled' | 'forbidden' | 'no_link' }
 *   404 { error }                     . class not found.
 */
router.get('/:classId/link', meetingLinkLimiter, authenticate, verifyTokenVersion, async (req, res, next) => {
  try {
    const cls = await prisma.classSession.findUnique({
      where: { id: req.params.classId },
      include: {
        assignments: {
          where: { student: { deletedAt: null } },
          select: { studentId: true },
        },
      },
    });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Admins can always join their own classes; students must be assigned.
    const isAdmin = req.user.role === 'admin';
    const isAssigned = cls.assignments.some((a) => a.studentId === req.user.id);
    if (!isAdmin && !isAssigned) {
      auditLog('JOIN_LINK_FORBIDDEN', {
        classId: cls.id,
        userId: req.user.id,
        reason: 'not_assigned',
      });
      return res.status(403).json({ error: 'Not authorised for this class', reason: 'forbidden' });
    }

    if (cls.cancelled) {
      return res.status(403).json({ error: 'Class was cancelled', reason: 'cancelled' });
    }

    const now = Date.now();
    const opens = new Date(cls.startTime).getTime() - JOIN_WINDOW_MS;
    const closes = new Date(cls.endTime).getTime();

    if (now < opens) {
      return res.status(403).json({
        error: 'Class has not opened yet',
        reason: 'too_early',
        opensAt: new Date(opens).toISOString(),
      });
    }
    if (now > closes) {
      return res.status(403).json({ error: 'Class has ended', reason: 'too_late' });
    }

    // Prefer a per-class link if one is set, otherwise fall back to the
    // global Zoom link the sheikh configured in Settings.
    let meetingLink = cls.meetingLink;
    if (!meetingLink) {
      const globalSetting = await prisma.siteSetting.findUnique({
        where: { key: 'meetingLink' },
      });
      meetingLink = globalSetting?.value || null;
    }
    if (!meetingLink) {
      return res.status(403).json({ error: 'No meeting link configured', reason: 'no_link' });
    }

    auditLog('JOIN_LINK_ISSUED', {
      classId: cls.id,
      userId: req.user.id,
      role: isAdmin ? 'admin' : 'student',
    });

    res.json({ meetingLink });
  } catch (error) {
    next(error);
  }
});

export default router;
