/**
 * Scoping helpers for the multi-teacher data model.
 *
 * The sheikh (User.role='admin') sees everything. A teacher
 * (User.role='teacher') sees only:
 *   - the students assigned to them via the TeacherStudent join, and
 *   - the class sessions either created by them OR attended by any of
 *     their assigned students.
 *
 * Every admin list / detail endpoint that returns user-scoped data must
 * compose its `where` clause with the relevant filter from this module.
 * Action endpoints (reschedule, cancel, edit, etc.) call `requireClassAccess`
 * before mutating to defend against direct-ID guessing.
 *
 * Phase A: this module exists but is not yet wired into any routes.
 * Phase B: every relevant route in admin.js gets one of these filters.
 */

/**
 * Where-clause for queries on the User model that should return only
 * the students a given admin/teacher is allowed to see.
 *
 * Sheikh: empty filter, returns all students.
 * Teacher: returns only students linked via TeacherStudent.
 *
 * Compose into existing filters with object-spread:
 *   prisma.user.findMany({
 *     where: {
 *       role: 'enrolled_student',
 *       ...scopedStudentFilter(req.user),
 *     },
 *   });
 */
export function scopedStudentFilter(user) {
  if (!user || !user.role) {
    // Defense: an unauthenticated request shouldn't reach here, but if it
    // does we return a "match nothing" filter rather than match everything.
    return { id: '00000000-0000-0000-0000-000000000000' };
  }
  if (user.role === 'admin') return {};
  return {
    teachers: { some: { teacherId: user.id } },
  };
}

/**
 * Where-clause for queries on the ClassSession model that should return
 * only the classes a given admin/teacher is allowed to see.
 *
 * Sheikh: empty filter, returns all classes.
 * Teacher: returns classes created by them OR with at least one
 * assignment to a student linked to them.
 */
export function scopedClassFilter(user) {
  if (!user || !user.role) {
    return { id: '00000000-0000-0000-0000-000000000000' };
  }
  if (user.role === 'admin') return {};
  return {
    OR: [
      { createdByAdminId: user.id },
      {
        assignments: {
          some: {
            student: {
              teachers: { some: { teacherId: user.id } },
            },
          },
        },
      },
    ],
  };
}

/**
 * Throw a 403-flavoured error if the user can't act on a specific class.
 * Use this in reschedule, cancel, edit, and lesson-report endpoints,
 * AFTER `requireAdminOrTeacher` has verified role, but BEFORE any
 * destructive write happens.
 *
 * The error is thrown rather than returned so callers can `throw await
 * requireClassAccess(...)` from within a try/catch and route everything
 * through the normal error handler.
 */
export async function requireClassAccess(user, classId, prisma) {
  if (!user) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  if (user.role === 'admin') return; // sheikh bypass
  if (user.role !== 'teacher') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  const accessible = await prisma.classSession.count({
    where: {
      id: classId,
      ...scopedClassFilter(user),
    },
  });
  if (accessible === 0) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
}

/**
 * Convenience: assert that a teacher is permitted to schedule a class for
 * a given studentId. Used by the schedule + batch endpoints to refuse a
 * teacher trying to add a student they're not linked to.
 *
 * Sheikh bypasses. Teachers must have a TeacherStudent row for the target
 * student. Throws if not.
 */
export async function requireStudentAccess(user, studentId, prisma) {
  if (!user) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  if (user.role === 'admin') return;
  if (user.role !== 'teacher') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  const link = await prisma.teacherStudent.count({
    where: { teacherId: user.id, studentId },
  });
  if (link === 0) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
}
