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

// Max concurrent email sends. Resend's docs suggest ~10 RPS on the free
// tier; we stay well under that while still being faster than serial.
const EMAIL_CONCURRENCY = 5;

/**
 * Run one reminder pass. Safe to call from a setInterval loop; uses per-class
 * timestamp columns on class_sessions to guarantee each class gets at most
 * one reminder per window even across concurrent server instances.
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

  // Find candidate class IDs first — don't include/hydrate yet. We'll claim
  // them via an atomic updateMany below so that if two server instances
  // run this tick simultaneously, only one wins each class.
  const candidates = await prisma.classSession.findMany({
    where: {
      cancelled: false,
      startTime: { gte: lo, lte: hi },
      [sentField]: null,
    },
    select: { id: true },
  });
  if (!candidates.length) return;

  const ids = candidates.map((c) => c.id);
  // Atomic claim: flip the flag from null → now() in one statement. Any
  // concurrent instance that reads the row after this point sees a non-null
  // value and skips it. count === how many we own.
  const claimed = await prisma.classSession.updateMany({
    where: { id: { in: ids }, [sentField]: null },
    data: { [sentField]: new Date() },
  });
  if (claimed.count === 0) return;

  // Load the claimed rows with all the joins we need for email content.
  const classes = await prisma.classSession.findMany({
    where: { id: { in: ids } },
    include: {
      assignments: {
        where: { student: { deletedAt: null } },
        include: { student: true },
      },
    },
  });

  // Run each class in parallel up to EMAIL_CONCURRENCY. Within a class, we
  // still parallelize the per-student sends with Promise.all.
  await parallel(classes, EMAIL_CONCURRENCY, async (cls) => {
    try {
      if (!cls.assignments.length) return; // already marked; nothing to send

      // All student emails in parallel — one bad address won't block others.
      await Promise.all(
        cls.assignments.map((a) =>
          sendClassReminderStudent(a.student, cls, label).catch((err) =>
            logger.error('classReminderJob: student email failed', {
              classId: cls.id,
              studentId: a.studentId,
              error: err.message,
            })
          )
        )
      );

      if (sendToAdmin && env.ADMIN_EMAIL) {
        const studentNames = cls.assignments.map(
          (a) => `${a.student.firstName} ${a.student.lastName}`.trim()
        );
        await sendClassReminderAdmin(cls, studentNames).catch((err) =>
          logger.error('classReminderJob: admin email failed', {
            classId: cls.id,
            error: err.message,
          })
        );
      }

      logger.info('classReminderJob: sent', {
        label,
        classId: cls.id,
        students: cls.assignments.length,
      });
    } catch (err) {
      // A failure here doesn't roll back the flag claim — that's by design.
      // Retrying a partial batch would re-spam students who already got
      // the email. We'd rather drop one class's reminder than double-send.
      logger.error('classReminderJob: class processing failed', {
        classId: cls.id,
        error: err.message,
      });
    }
  });
}

/**
 * Run `worker(item)` over `items` with at most `max` running at once.
 */
async function parallel(items, max, worker) {
  if (items.length <= max) return Promise.all(items.map(worker));
  const queue = items.slice();
  const runners = Array.from({ length: max }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}
