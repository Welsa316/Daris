import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import {
  sendClassReminderStudent,
  sendClassReminderAdmin,
  sendClassReminderTeacher,
} from './emailService.js';

// Half-width of the match window around each reminder target. The job
// tick runs every 5 min, so a 5-min window means every class gets
// exactly one reminder per kind even if a single tick is missed (e.g.
// during a Railway rolling deploy).
const WINDOW_MIN = 5;

// Max concurrent email sends. Resend's docs suggest ~10 RPS on the free
// tier; we stay well under that while still being faster than serial.
const EMAIL_CONCURRENCY = 5;

/**
 * Run one reminder pass. Safe to call from a setInterval loop; uses
 * per-class timestamp columns on class_sessions to guarantee each class
 * gets at most one reminder of each kind even across concurrent server
 * instances.
 *
 * Two reminders fire from each tick: one 24 hours before the class and
 * one 1 hour before. Each has its own sent-flag column and runs
 * independently, so a failure in one window never suppresses the other.
 * Each goes out in the recipient's dashboard-set language. (The 30-min
 * reminder was retired; reminder30SentAt stays on the schema so old
 * records keep resolving but the column is no longer written.)
 */
export async function runClassReminderTick() {
  const windows = [
    { label: '24hr', offsetMin: 24 * 60, sentField: 'reminder24SentAt', sendToAdmin: true },
    { label: '1hr', offsetMin: 60, sentField: 'reminder1hSentAt', sendToAdmin: true },
  ];
  for (const w of windows) {
    try {
      await sendWindow(w);
    } catch (err) {
      logger.error('classReminderJob: tick failed', { label: w.label, error: err.message });
    }
  }
}

async function sendWindow({ label, offsetMin, sentField, sendToAdmin }) {
  const target = new Date(Date.now() + offsetMin * 60_000);
  const lo = new Date(target.getTime() - WINDOW_MIN * 60_000);
  const hi = new Date(target.getTime() + WINDOW_MIN * 60_000);

  // Find candidate class IDs first. don't include/hydrate yet. We'll claim
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

  // Fall back to the global meeting link for classes that don't have a
  // per-class one set yet (e.g., the GCal sync hasn't fired or it's a
  // legacy row). Looked up once per tick — every email goes out with a
  // working link instead of the "link will be sent" placeholder.
  const needsFallback = classes.some((c) => !c.meetingLink);
  let globalLink = null;
  if (needsFallback) {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'meetingLink' },
    });
    globalLink = setting?.value || null;
  }
  for (const cls of classes) {
    if (!cls.meetingLink && globalLink) cls.meetingLink = globalLink;
  }

  // Run each class in parallel up to EMAIL_CONCURRENCY. Within a class, we
  // still parallelize the per-student sends with Promise.all.
  await parallel(classes, EMAIL_CONCURRENCY, async (cls) => {
    try {
      if (!cls.assignments.length) return; // already marked; nothing to send

      // All student emails in parallel. one bad address won't block others.
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

      // Teacher reminders: each TeacherStudent-linked teacher for a
      // student in this class gets one email, grouped by teacher so
      // someone with two of their students in the same merged class
      // gets one mail naming both. The sheikh-admin is excluded
      // (covered by the admin reminder below).
      const studentIds = cls.assignments.map((a) => a.studentId);
      const teacherLinks = await prisma.teacherStudent.findMany({
        where: {
          studentId: { in: studentIds },
          teacher: { deletedAt: null, role: { not: 'admin' } },
        },
        include: { teacher: true },
      });
      if (teacherLinks.length > 0) {
        const studentById = new Map(
          cls.assignments.map((a) => [a.studentId, a.student])
        );
        const byTeacher = new Map();
        for (const link of teacherLinks) {
          if (!byTeacher.has(link.teacherId)) {
            byTeacher.set(link.teacherId, {
              teacher: link.teacher,
              studentIds: new Set(),
            });
          }
          byTeacher.get(link.teacherId).studentIds.add(link.studentId);
        }
        await Promise.all(
          [...byTeacher.values()].map(({ teacher, studentIds: sids }) => {
            const names = [...sids]
              .map((id) => {
                const s = studentById.get(id);
                return s ? `${s.firstName} ${s.lastName}`.trim() : '';
              })
              .filter(Boolean);
            return sendClassReminderTeacher(teacher, cls, names, label).catch((err) =>
              logger.error('classReminderJob: teacher email failed', {
                classId: cls.id,
                teacherId: teacher.id,
                error: err.message,
              })
            );
          })
        );
      }

      if (sendToAdmin && env.ADMIN_EMAIL) {
        const studentNames = cls.assignments.map(
          (a) => `${a.student.firstName} ${a.student.lastName}`.trim()
        );
        await sendClassReminderAdmin(cls, studentNames, label).catch((err) =>
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
      // A failure here doesn't roll back the flag claim. that's by design.
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
