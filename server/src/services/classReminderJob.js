import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import {
  sendClassReminderStudent,
  sendClassReminderAdmin,
} from './emailService.js';

// How generous we are about "30 minutes before" — if the tick runs every
// 5 min, a 5-min window means every class gets exactly one reminder even if
// one tick misses.
const WINDOW_MIN = 5;

/**
 * Run one reminder pass. Safe to call from a setInterval loop; uses per-class
 * timestamp columns on class_sessions to guarantee each class gets at most
 * one reminder per window.
 */
export async function runClassReminderTick() {
  try {
    await sendWindow({
      label: '30min',
      offsetMin: 30,
      sentField: 'reminder30SentAt',
      sendToAdmin: true,
    });
    await sendWindow({
      label: '24hr',
      offsetMin: 24 * 60,
      sentField: 'reminder24SentAt',
      sendToAdmin: false,
    });
  } catch (err) {
    logger.error('classReminderJob: tick failed', { error: err.message });
  }
}

async function sendWindow({ label, offsetMin, sentField, sendToAdmin }) {
  const target = new Date(Date.now() + offsetMin * 60_000);
  const lo = new Date(target.getTime() - WINDOW_MIN * 60_000);
  const hi = new Date(target.getTime() + WINDOW_MIN * 60_000);

  const classes = await prisma.classSession.findMany({
    where: {
      cancelled: false,
      startTime: { gte: lo, lte: hi },
      [sentField]: null,
    },
    include: {
      assignments: {
        where: { student: { deletedAt: null } },
        include: { student: true },
      },
    },
  });

  if (!classes.length) return;

  for (const cls of classes) {
    if (!cls.assignments.length) {
      // No live students → skip, but mark as sent so we don't scan it forever.
      await prisma.classSession.update({
        where: { id: cls.id },
        data: { [sentField]: new Date() },
      });
      continue;
    }

    // Per-student reminder. Do them serially so one bad address doesn't nuke
    // the rest of the batch — if it throws we catch and keep going.
    for (const a of cls.assignments) {
      try {
        await sendClassReminderStudent(a.student, cls, label);
      } catch (err) {
        logger.error('classReminderJob: student email failed', {
          classId: cls.id,
          studentId: a.studentId,
          error: err.message,
        });
      }
    }

    if (sendToAdmin && env.ADMIN_EMAIL) {
      try {
        const studentNames = cls.assignments.map(
          (a) => `${a.student.firstName} ${a.student.lastName}`.trim()
        );
        await sendClassReminderAdmin(cls, studentNames);
      } catch (err) {
        logger.error('classReminderJob: admin email failed', {
          classId: cls.id,
          error: err.message,
        });
      }
    }

    await prisma.classSession.update({
      where: { id: cls.id },
      data: { [sentField]: new Date() },
    });

    logger.info('classReminderJob: sent', {
      label,
      classId: cls.id,
      students: cls.assignments.length,
    });
  }
}
