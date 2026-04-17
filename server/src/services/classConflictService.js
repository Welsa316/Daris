import { prisma } from '../config/database.js';

/**
 * Detect scheduling conflicts for a proposed set of class sessions.
 *
 * For each proposed session we distinguish two conflict shapes:
 *
 *   - 'same_student':  The target student already has ANOTHER class whose
 *                      time overlaps. The admin almost never wants this; the
 *                      UI confirms with "are you sure?" before forcing.
 *
 *   - 'existing_slot': A class already exists at the EXACT same start/end
 *                      (owned by this admin) but the target student is not
 *                      on it. This is usually the case where the admin wants
 *                      to add the student to an already-running co-taught
 *                      class rather than creating a parallel duplicate.
 *
 * @param {{ startTime: string|Date, endTime: string|Date }[]} sessions
 * @param {string} studentId
 * @param {string} adminId
 * @returns {Promise<Array>}
 */
export async function findConflicts(sessions, studentId, adminId) {
  if (!sessions?.length) return [];

  // Widen the search window to the full span of proposed sessions so we only
  // hit the DB once instead of per-session.
  const starts = sessions.map((s) => new Date(s.startTime));
  const ends = sessions.map((s) => new Date(s.endTime));
  const windowStart = new Date(Math.min(...starts.map((d) => d.getTime())));
  const windowEnd = new Date(Math.max(...ends.map((d) => d.getTime())));

  const existing = await prisma.classSession.findMany({
    where: {
      createdByAdminId: adminId,
      cancelled: false,
      // overlap: existing.startTime < windowEnd AND existing.endTime > windowStart
      startTime: { lt: windowEnd },
      endTime: { gt: windowStart },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      assignments: {
        where: { student: { deletedAt: null } },
        select: {
          studentId: true,
          student: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  const conflicts = [];

  for (const proposed of sessions) {
    const pStart = new Date(proposed.startTime);
    const pEnd = new Date(proposed.endTime);

    // 1) same-student overlap (any class, not just exact slot)
    const overlapping = existing.filter(
      (c) => c.startTime < pEnd && c.endTime > pStart
    );

    const sameStudent = overlapping.find((c) =>
      c.assignments.some((a) => a.studentId === studentId)
    );
    if (sameStudent) {
      conflicts.push({
        startTime: pStart.toISOString(),
        endTime: pEnd.toISOString(),
        kind: 'same_student',
        existingClassId: sameStudent.id,
        existingTitle: sameStudent.title,
      });
      continue;
    }

    // 2) existing-slot match: same start+end, different students
    const exactSlot = overlapping.find(
      (c) =>
        c.startTime.getTime() === pStart.getTime() &&
        c.endTime.getTime() === pEnd.getTime()
    );
    if (exactSlot) {
      conflicts.push({
        startTime: pStart.toISOString(),
        endTime: pEnd.toISOString(),
        kind: 'existing_slot',
        existingClassId: exactSlot.id,
        existingTitle: exactSlot.title,
        existingStudents: exactSlot.assignments.map((a) => ({
          firstName: a.student.firstName,
          lastName: a.student.lastName,
        })),
      });
    }
  }

  return conflicts;
}
