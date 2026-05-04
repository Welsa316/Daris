/**
 * Scoping helpers for the multi-teacher data model.
 *
 * The sheikh (User.role='admin') sees everything. A user with the
 * teacher capability (User.isTeacher=true) sees only:
 *   - the students assigned to them via the TeacherStudent join, and
 *   - the class sessions either created by them OR attended by any of
 *     their assigned students.
 *
 * isTeacher is independent of role: a senior enrolled_student with
 * isTeacher=true is BOTH a student (their own ClassAssignment rows
 * stay theirs) and a teacher (assigned-student data is also theirs).
 *
 * Every admin list / detail endpoint that returns user-scoped data must
 * compose its `where` clause with the relevant filter from this module.
 * Action endpoints (reschedule, cancel, edit, etc.) call `requireClassAccess`
 * before mutating to defend against direct-ID guessing.
 */

/**
 * True when the user has teacher capability (the isTeacher flag) and
 * is NOT a sheikh. Sheikh-grade access is checked separately so they
 * bypass the scope filter entirely.
 */
function hasTeacherCapability(user) {
  return !!user && user.role !== 'admin' && user.isTeacher === true;
}

/**
 * Where-clause for queries on the User model that should return only
 * the students a given admin/teacher is allowed to see.
 *
 * Sheikh: empty filter, returns all students.
 * Teacher (isTeacher=true): returns only students linked via TeacherStudent.
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
  if (hasTeacherCapability(user)) {
    return {
      teachers: { some: { teacherId: user.id } },
    };
  }
  // Anyone reaching here without admin or teacher capability shouldn't
  // be on an admin route in the first place. Return deny-all as belt-
  // and-braces against a future middleware regression.
  return { id: '00000000-0000-0000-0000-000000000000' };
}

/**
 * Where-clause for queries on the ClassSession model that should return
 * only the classes a given admin/teacher is allowed to see.
 *
 * Sheikh: empty filter, returns all classes.
 * Teacher (isTeacher=true): returns classes created by them OR with at
 * least one assignment to a student linked to them.
 */
export function scopedClassFilter(user) {
  if (!user || !user.role) {
    return { id: '00000000-0000-0000-0000-000000000000' };
  }
  if (user.role === 'admin') return {};
  if (hasTeacherCapability(user)) {
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
  return { id: '00000000-0000-0000-0000-000000000000' };
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
  if (!hasTeacherCapability(user)) {
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
  if (!hasTeacherCapability(user)) {
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
