/**
 * Background drain for GoogleCalendarSyncOp rows.
 *
 * Runs every 60 seconds. Pulls up to 10 unresolved ops with
 * nextAttemptAt <= now and processes them serially. Each op is
 * "claimed" with an atomic updateMany before we make any Google API
 * call, so two server instances on a Railway rolling deploy can't both
 * process the same op (only the instance whose updateMany returns
 * count: 1 proceeds).
 *
 * Failure mode: exponential backoff (1m, 5m, 30m, 2h, 12h). After 5
 * attempts the op stays unresolved with errorMessage set and the
 * dashboard shows a warning banner (Phase G).
 */

import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import {
  createEvent,
  updateEvent,
  cancelEvent,
  isGoogleCalendarConfigured,
} from './googleCalendar.js';

// Per-tick cap. The atomic claim makes any number safe across rolling
// deploys; this is purely a kindness to Google's rate limiter. 50
// keeps us well under the per-user/per-second soft cap (~250 req/s)
// while letting a typical batch (12 weekly classes) drain in one tick.
const MAX_PER_TICK = 50;
const MAX_ATTEMPTS = 5;

// Debounce timer for kickTick(). Set when an enqueue triggers a tick;
// cleared when the tick fires. Subsequent enqueues during the debounce
// window collapse onto the same scheduled tick so a batch of 12
// classes results in one extra DB scan, not 12.
let scheduledKick = null;
const KICK_DEBOUNCE_MS = 200;

// Backoff delays in seconds: 1m, 5m, 30m, 2h, 12h. Index = attemptCount
// AFTER this attempt fails. So a fresh op (attemptCount: 0) failing
// once gets a 1-minute delay; failing the 5th time stops retrying.
const BACKOFF_DELAYS_SEC = [60, 300, 1800, 7200, 43200];

export async function runGCalSyncTick() {
  if (!isGoogleCalendarConfigured()) return;
  try {
    const now = new Date();
    const candidates = await prisma.googleCalendarSyncOp.findMany({
      where: {
        resolved: false,
        nextAttemptAt: { lte: now },
        attemptCount: { lt: MAX_ATTEMPTS },
      },
      orderBy: { nextAttemptAt: 'asc' },
      take: MAX_PER_TICK,
      include: {
        classSession: {
          include: {
            assignments: {
              where: { student: { deletedAt: null } },
              include: { student: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    });

    for (const op of candidates) {
      // Atomic claim: only the instance whose updateMany returns count
      // 1 proceeds. The (id, attemptCount) WHERE clause is the lock.
      const claimed = await prisma.googleCalendarSyncOp.updateMany({
        where: {
          id: op.id,
          attemptCount: op.attemptCount,
          resolved: false,
        },
        data: {
          attemptCount: { increment: 1 },
          lastAttemptAt: now,
        },
      });
      if (claimed.count !== 1) continue;

      try {
        await processOp(op);
        await prisma.googleCalendarSyncOp.update({
          where: { id: op.id },
          data: { resolved: true, errorMessage: null },
        });
      } catch (err) {
        // Schedule a retry with backoff. attemptCount is already
        // incremented from the claim above; nextAttemptAt uses the
        // current attempt index to pick the right delay.
        const nextAttempt = op.attemptCount + 1;
        const delaySec = BACKOFF_DELAYS_SEC[Math.min(nextAttempt - 1, BACKOFF_DELAYS_SEC.length - 1)];
        const nextAttemptAt = new Date(Date.now() + delaySec * 1000);
        await prisma.googleCalendarSyncOp.update({
          where: { id: op.id },
          data: {
            nextAttemptAt,
            errorMessage: String(err.message || err).slice(0, 500),
          },
        });
        logger.error('GCal sync op failed', {
          opId: op.id,
          classSessionId: op.classSessionId,
          op: op.op,
          attempts: nextAttempt,
          willRetryAt: nextAttemptAt,
          error: err.message,
        });
      }

      // Update the connection row's lastSyncedAt so the dashboard
      // card shows when we last touched Google. Do this regardless
      // of success/failure so the timestamp reflects activity, not
      // health (health is read from the connection's status field).
      const adminId = op.classSession?.createdByAdminId;
      if (adminId) {
        await prisma.googleCalendarConnection
          .update({
            where: { userId: adminId },
            data: { lastSyncedAt: new Date() },
          })
          .catch(() => {}); // never fail the job because of this update
      }
    }
  } catch (err) {
    logger.error('GCal sync tick fatal', { error: err.message });
  }
}

/**
 * Process one op. Throws on Google API failure (caller catches and
 * schedules a retry). Returns silently on permanent skips (class
 * deleted, user not connected, etc) so the op gets marked resolved.
 */
async function processOp(op) {
  const cls = op.classSession;
  if (!cls) {
    // Class deleted before its sync ran — nothing to do.
    return;
  }
  const adminId = cls.createdByAdminId;
  if (!adminId) {
    return; // orphan class; can't tell whose calendar to use
  }

  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: adminId },
    select: { status: true },
  });
  if (!conn || conn.status !== 'active') {
    // No active connection — can't sync. Mark resolved so we don't
    // keep retrying a permanently-skipped op. If the admin reconnects
    // later, the backfill flow re-enqueues for everything.
    return;
  }

  if (op.op === 'create') {
    if (cls.googleEventId) return; // already created (dup op)
    const result = await createEvent(adminId, cls);
    await prisma.classSession.update({
      where: { id: cls.id },
      data: {
        googleEventId: result.eventId,
        meetingLink: result.meetingLink || cls.meetingLink,
        googleEventSyncedAt: new Date(),
      },
    });
    return;
  }

  if (op.op === 'update') {
    if (!cls.googleEventId) {
      // No event yet — promote to a create. This handles the case
      // where someone reschedules a pre-Phase-C class that never had
      // a Google event in the first place.
      const result = await createEvent(adminId, cls);
      await prisma.classSession.update({
        where: { id: cls.id },
        data: {
          googleEventId: result.eventId,
          meetingLink: result.meetingLink || cls.meetingLink,
          googleEventSyncedAt: new Date(),
        },
      });
      return;
    }
    await updateEvent(adminId, cls);
    await prisma.classSession.update({
      where: { id: cls.id },
      data: { googleEventSyncedAt: new Date() },
    });
    return;
  }

  if (op.op === 'cancel') {
    if (!cls.googleEventId) return; // never created on Google
    const result = await cancelEvent(adminId, cls.googleEventId);
    await prisma.classSession.update({
      where: { id: cls.id },
      data: {
        googleEventId: null,
        googleEventSyncedAt: new Date(),
      },
    });
    if (result.alreadyGone) {
      logger.info('GCal cancel: event already gone', {
        classSessionId: cls.id,
      });
    }
    return;
  }

  throw new Error(`Unknown op type: ${op.op}`);
}

// SiteSetting key marking the attendee backfill as done. Bump the
// version suffix if a future change needs the backfill to run again.
const ATTENDEE_BACKFILL_FLAG = 'gcalAttendeeBackfillV1';

/**
 * One-time retrofit for the "teacher couldn't join the auto-generated
 * link" bug. Calendar events created before attendees were wired in
 * have a Meet link nobody can join without the sheikh knock-approving
 * them. This enqueues an `update` op for every future, uncancelled,
 * already-synced class so the next sync pass patches the guest list
 * onto each event (updateEvent now always includes attendees).
 *
 * Guarded by a SiteSetting flag so it runs exactly once across all
 * deploys — after the first sweep sets the flag, every later sweep
 * short-circuits on a single indexed lookup.
 */
async function backfillAttendeesOnce() {
  const done = await prisma.siteSetting.findUnique({
    where: { key: ATTENDEE_BACKFILL_FLAG },
  });
  if (done) return;

  const classes = await prisma.classSession.findMany({
    where: {
      cancelled: false,
      startTime: { gte: new Date() },
      googleEventId: { not: null },
    },
    select: { id: true },
  });
  for (const c of classes) {
    await enqueueSyncOp(c.id, 'update');
  }

  await prisma.siteSetting.upsert({
    where: { key: ATTENDEE_BACKFILL_FLAG },
    update: { value: new Date().toISOString() },
    create: { key: ATTENDEE_BACKFILL_FLAG, value: new Date().toISOString() },
  });
  if (classes.length > 0) {
    logger.info('GCal: enqueued attendee backfill for existing events', {
      classes: classes.length,
    });
  }
}

/**
 * Convergent sync sweep. Walks every active GoogleCalendarConnection
 * and looks for future, uncancelled, un-synced classes the admin owns.
 * For each, ensures there's a viable `create` sync op:
 *
 *   - No op ever created → enqueue one (e.g. class predates the
 *     Phase C wiring; or the connection was set up after the class
 *     was scheduled).
 *   - Existing op is dead (attemptCount >= MAX_ATTEMPTS) → reset
 *     attemptCount to 0 + nextAttemptAt to now, so the next tick
 *     retries. Useful when a transient Google outage exhausted the
 *     backoff and the class would otherwise stay un-synced forever.
 *   - Existing op is unresolved and still has retries left → leave
 *     it alone, normal backoff handles it.
 *
 * Cheap enough to run every few minutes — the per-connection work
 * is one COUNT query plus, in the rare un-synced case, a few writes.
 */
export async function runGCalSweep() {
  if (!isGoogleCalendarConfigured()) return;
  try {
    await backfillAttendeesOnce();

    const connections = await prisma.googleCalendarConnection.findMany({
      where: { status: 'active' },
      select: { userId: true },
    });

    for (const { userId } of connections) {
      const unsynced = await prisma.classSession.findMany({
        where: {
          createdByAdminId: userId,
          cancelled: false,
          startTime: { gte: new Date() },
          googleEventId: null,
        },
        select: { id: true },
      });
      if (unsynced.length === 0) continue;

      const unsyncedIds = unsynced.map((c) => c.id);

      // Bulk-fetch the most recent 'create' op per class in ONE query
      // instead of one findFirst per class. Group by classSessionId in
      // memory after sorting by createdAt desc.
      const allOps = await prisma.googleCalendarSyncOp.findMany({
        where: {
          classSessionId: { in: unsyncedIds },
          op: 'create',
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          classSessionId: true,
          attemptCount: true,
          resolved: true,
        },
      });
      const latestOpByClass = new Map();
      for (const op of allOps) {
        if (!latestOpByClass.has(op.classSessionId)) {
          latestOpByClass.set(op.classSessionId, op);
        }
      }

      // IDs of dead ops we'll revive in a single updateMany at the end.
      const reviveIds = [];
      let enqueued = 0;

      for (const id of unsyncedIds) {
        const existing = latestOpByClass.get(id);
        if (!existing) {
          await enqueueSyncOp(id, 'create');
          enqueued++;
        } else if (!existing.resolved && existing.attemptCount >= MAX_ATTEMPTS) {
          // Dead op: resurrect so the user doesn't have to disconnect
          // and reconnect to recover from a transient failure run.
          reviveIds.push(existing.id);
        }
      }

      if (reviveIds.length > 0) {
        await prisma.googleCalendarSyncOp.updateMany({
          where: { id: { in: reviveIds } },
          data: {
            attemptCount: 0,
            nextAttemptAt: new Date(),
            errorMessage: null,
          },
        });
      }

      if (enqueued + reviveIds.length > 0) {
        logger.info('GCal sweep refreshed sync state', {
          userId,
          enqueued,
          revived: reviveIds.length,
        });
        // Kick the tick now so the user sees results immediately
        // instead of waiting another full minute.
        kickTick();
      }
    }
  } catch (err) {
    logger.error('GCal sweep failed', { error: err.message });
  }
}

/**
 * Helper used by the admin routes to drop a sync op into the queue.
 * Idempotent for `update`: if there's already a pending update op for
 * this class, we leave it in place (the next tick picks up the latest
 * class state regardless). For create/cancel we always queue.
 *
 * After enqueueing, kicks the sync tick immediately (with a 200ms
 * debounce so a batch of 12 enqueues collapses into one tick) so the
 * Google Calendar update lands within ~half a second instead of
 * waiting for the 60-second interval. The interval ticks stay around
 * as a safety net in case the immediate kick fails.
 */
export async function enqueueSyncOp(classSessionId, op) {
  if (!['create', 'update', 'cancel'].includes(op)) {
    throw new Error(`enqueueSyncOp: invalid op ${op}`);
  }
  if (op === 'update') {
    const existing = await prisma.googleCalendarSyncOp.findFirst({
      where: { classSessionId, op: 'update', resolved: false },
      select: { id: true },
    });
    if (existing) {
      kickTick();
      return existing.id; // already queued
    }
  }
  const created = await prisma.googleCalendarSyncOp.create({
    data: { classSessionId, op },
    select: { id: true },
  });
  kickTick();
  return created.id;
}

/**
 * Trigger a sync-job tick on the next event loop iteration, debounced
 * so multiple enqueues within 200ms result in one extra tick. Safe to
 * call alongside the regular interval tick — the atomic claim in
 * runGCalSyncTick ensures no op is processed twice.
 */
function kickTick() {
  if (scheduledKick) return;
  scheduledKick = setTimeout(() => {
    scheduledKick = null;
    runGCalSyncTick().catch((err) =>
      logger.error('GCal sync immediate tick failed', { error: err.message })
    );
  }, KICK_DEBOUNCE_MS);
}
