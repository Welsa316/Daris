/**
 * Assign (or unassign) enrolled students to a teacher by email. The
 * site owner runs this directly; the dashboard never exposes it
 * because the sheikh's view of the Teachers tab is intentionally
 * read-only.
 *
 * Usage:
 *   DATABASE_URL=postgres://... \
 *     node server/scripts/assign-students-to-teacher.js \
 *       <teacher-email> <action> <student-email[,student-email...]>
 *
 * Where <action> is one of:
 *   add      attach the listed students to the teacher (skip duplicates)
 *   remove   detach the listed students (no-op for ones not currently linked)
 *   set      REPLACE the teacher's full assignment list with the given set
 *            (anything not in the list is removed)
 *
 * Examples:
 *   # Assign two students to teacher
 *   node server/scripts/assign-students-to-teacher.js \
 *     teacher@example.com add omar@example.com,ahmed@example.com
 *
 *   # Replace teacher's full roster with one student
 *   node server/scripts/assign-students-to-teacher.js \
 *     teacher@example.com set omar@example.com
 *
 *   # Unassign one student
 *   node server/scripts/assign-students-to-teacher.js \
 *     teacher@example.com remove ahmed@example.com
 *
 * Why we stub the JWT secrets: see set-user-role.js for the same trick.
 */

const ALLOWED_ACTIONS = ['add', 'remove', 'set'];

const [, , teacherEmailArg, actionArg, studentEmailsArg] = process.argv;

if (!teacherEmailArg || !actionArg || !studentEmailsArg) {
  console.error('Usage: node server/scripts/assign-students-to-teacher.js <teacher-email> <action> <student-emails>');
  console.error(`  <action> must be one of: ${ALLOWED_ACTIONS.join(', ')}`);
  console.error('  <student-emails> is a comma-separated list (no spaces around commas)');
  process.exit(1);
}

const teacherEmail = teacherEmailArg.toLowerCase().trim();
const action = actionArg.trim();
const studentEmails = studentEmailsArg
  .split(',')
  .map((e) => e.toLowerCase().trim())
  .filter(Boolean);

if (!ALLOWED_ACTIONS.includes(action)) {
  console.error(`Invalid action "${action}". Allowed: ${ALLOWED_ACTIONS.join(', ')}`);
  process.exit(1);
}

if (studentEmails.length === 0) {
  console.error('No student emails provided.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Grab it from Railway > Variables and run:');
  console.error(`  DATABASE_URL=postgres://... node server/scripts/assign-students-to-teacher.js ${teacherEmail} ${action} ${studentEmailsArg}`);
  process.exit(1);
}

// Stub the env vars the script doesn't use so env.js validation passes.
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'x'.repeat(32);
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'y'.repeat(32);

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

try {
  // 1. Resolve the teacher. Must be an active user with the
  //    isTeacher capability flag set (the role itself can be
  //    enrolled_student or admin). Pure role='teacher' users from the
  //    legacy schema were migrated to isTeacher=true so this still
  //    matches them.
  const teacher = await prisma.user.findFirst({
    where: { email: teacherEmail, isTeacher: true, deletedAt: null },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
  if (!teacher) {
    console.error(`No active teacher found with email "${teacherEmail}".`);
    console.error('If they exist but lack teacher capability, promote them first:');
    console.error(`  node server/scripts/set-user-role.js ${teacherEmail} teacher`);
    process.exit(1);
  }

  // 2. Resolve all student emails to ids. Refuse to silently drop bogus
  //    ones on the floor; the owner should know if a typo crept in.
  const students = await prisma.user.findMany({
    where: {
      email: { in: studentEmails },
      role: 'enrolled_student',
      deletedAt: null,
    },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  const foundEmails = new Set(students.map((s) => s.email));
  const missing = studentEmails.filter((e) => !foundEmails.has(e));
  if (missing.length > 0) {
    console.error('Some emails do not match an enrolled student:');
    for (const m of missing) console.error(`  - ${m}`);
    console.error('Re-check the spelling, or enroll them first.');
    process.exit(1);
  }

  const studentIds = students.map((s) => s.id);

  console.log('Teacher:');
  console.log(`  ${teacher.firstName} ${teacher.lastName} <${teacher.email}>`);
  console.log();
  console.log(`Action:  ${action}`);
  console.log(`Students (${students.length}):`);
  for (const s of students) {
    console.log(`  - ${s.firstName} ${s.lastName} <${s.email}>`);
  }
  console.log();
  console.log('Applying...');

  // 3. Apply the diff in a transaction so the assignments table never
  //    reflects a half-applied state if anything fails midway.
  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.teacherStudent.findMany({
      where: { teacherId: teacher.id },
      select: { studentId: true },
    });
    const currentSet = new Set(current.map((r) => r.studentId));
    const targetSet = new Set(studentIds);

    let toAdd = [];
    let toRemove = [];

    if (action === 'add') {
      toAdd = studentIds.filter((id) => !currentSet.has(id));
    } else if (action === 'remove') {
      toRemove = studentIds.filter((id) => currentSet.has(id));
    } else if (action === 'set') {
      toAdd = [...targetSet].filter((id) => !currentSet.has(id));
      toRemove = [...currentSet].filter((id) => !targetSet.has(id));
    }

    if (toRemove.length) {
      await tx.teacherStudent.deleteMany({
        where: { teacherId: teacher.id, studentId: { in: toRemove } },
      });
    }
    if (toAdd.length) {
      await tx.teacherStudent.createMany({
        data: toAdd.map((studentId) => ({
          teacherId: teacher.id,
          studentId,
          // assignedByAdminId left null for owner-driven CLI assignments
          // (no human admin-user behind the action).
        })),
      });
    }

    return {
      added: toAdd.length,
      removed: toRemove.length,
      total: action === 'set' ? targetSet.size : currentSet.size + toAdd.length - toRemove.length,
    };
  });

  // 4. Audit log entry. Lets us tell after the fact what happened
  //    without trawling through git history.
  await prisma.auditLog.create({
    data: {
      userId: teacher.id,
      action: `TEACHER_STUDENTS_${action.toUpperCase()}`,
      details: `Via assign-students-to-teacher.js. Added: ${result.added}, removed: ${result.removed}.`,
    },
  });

  console.log();
  console.log(`✓ Done. Added: ${result.added}, removed: ${result.removed}, total: ${result.total}.`);
} finally {
  await prisma.$disconnect();
}
