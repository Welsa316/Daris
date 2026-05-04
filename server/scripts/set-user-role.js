/**
 * Promote (or demote) a user by email. CLI fallback for the
 * dashboard-driven promote/demote flow that lives in the Teachers tab.
 *
 * Usage:
 *   DATABASE_URL=postgres://... \
 *     node server/scripts/set-user-role.js <email> <role>
 *
 * Where <role> is one of:
 *   admin              full sheikh-level access
 *   teacher            grants the isTeacher capability while keeping
 *                      the user as role=enrolled_student so they can
 *                      still attend classes themselves (dual role)
 *   enrolled_student   normal active student. clears isTeacher.
 *   suspended          locked out, kept for audit. clears isTeacher.
 *
 * Demoting away from teacher cascade-deletes the user's TeacherStudent
 * assignment rows in the same transaction so orphaned assignments don't
 * accumulate. Their authored ClassSession rows stay on the schedule
 * (createdByAdminId is preserved) so historical attribution survives.
 *
 * Other Prisma roles (pending, pending_review, rejected) exist but
 * should be handled through the normal enrollment flow rather than
 * this script.
 *
 * The script bumps `tokenVersion` after the change so any existing JWTs
 * for that user are invalidated. They'll need to log in again to pick
 * up the new role/capability. This prevents a recently-demoted admin
 * from continuing to act with admin powers until their token expires.
 *
 * Why we stub the JWT secrets:
 *   server/src/config/env.js validates env on import. We only need
 *   DATABASE_URL for this script, so the JWT secrets are stubbed with
 *   placeholders to keep the script runnable from a developer machine
 *   that doesn't have prod secrets.
 */

const ALLOWED_ROLES = ['admin', 'teacher', 'enrolled_student', 'suspended'];

const [, , emailArg, roleArg] = process.argv;

if (!emailArg || !roleArg) {
  console.error('Usage: node server/scripts/set-user-role.js <email> <role>');
  console.error(`  <role> must be one of: ${ALLOWED_ROLES.join(', ')}`);
  process.exit(1);
}

const email = emailArg.toLowerCase().trim();
const roleArgInput = roleArg.trim();

if (!ALLOWED_ROLES.includes(roleArgInput)) {
  console.error(`Invalid role "${roleArgInput}". Allowed: ${ALLOWED_ROLES.join(', ')}`);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Grab it from Railway > Variables and run:');
  console.error(`  DATABASE_URL=postgres://... node server/scripts/set-user-role.js ${email} ${roleArgInput}`);
  process.exit(1);
}

// Stub the env vars the script doesn't use so env.js validation passes.
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'x'.repeat(32);
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'y'.repeat(32);

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isTeacher: true,
      emailVerified: true,
      enrolledAt: true,
    },
  });

  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exit(1);
  }

  // The legacy 'teacher' enum value is deprecated. The CLI accepts
  // "teacher" as a convenience and translates it: the user becomes
  // role=enrolled_student + isTeacher=true. This is the dual-role
  // shape that lets a senior student also help teach.
  let nextRole;
  let nextIsTeacher;
  if (roleArgInput === 'teacher') {
    nextRole = 'enrolled_student';
    nextIsTeacher = true;
  } else if (roleArgInput === 'enrolled_student' || roleArgInput === 'suspended') {
    nextRole = roleArgInput;
    nextIsTeacher = false;
  } else if (roleArgInput === 'admin') {
    nextRole = 'admin';
    nextIsTeacher = user.isTeacher;
  } else {
    // Belt-and-braces: ALLOWED_ROLES gate above already covers this.
    console.error(`Unsupported role "${roleArgInput}".`);
    process.exit(1);
  }

  const noChange = user.role === nextRole && user.isTeacher === nextIsTeacher;
  if (noChange) {
    console.log(
      `User ${user.email} is already role=${nextRole}, isTeacher=${nextIsTeacher}. Nothing to do.`
    );
    process.exit(0);
  }

  if ((nextRole === 'admin' || nextIsTeacher) && !user.emailVerified) {
    console.error(`Refusing to promote ${user.email}: email not verified yet.`);
    console.error('Have them verify their email first, then re-run.');
    process.exit(1);
  }

  const losingTeacherCap = user.isTeacher && !nextIsTeacher;
  const teacherAssignmentCount = losingTeacherCap
    ? await prisma.teacherStudent.count({ where: { teacherId: user.id } })
    : 0;

  console.log('Found user:');
  console.log(`  email:    ${user.email}`);
  console.log(`  name:     ${user.firstName} ${user.lastName}`);
  console.log(`  current:  role=${user.role}, isTeacher=${user.isTeacher}`);
  console.log(`  new:      role=${nextRole}, isTeacher=${nextIsTeacher}`);
  if (losingTeacherCap && teacherAssignmentCount > 0) {
    console.log(`  cascade:  ${teacherAssignmentCount} student assignment(s) will be removed`);
  }
  console.log();
  console.log('Applying...');

  // Bump tokenVersion so existing JWTs for this user are immediately invalid.
  // They'll have to log in again to receive a new token reflecting the role.
  const updated = await prisma.$transaction(async (tx) => {
    if (losingTeacherCap) {
      await tx.teacherStudent.deleteMany({ where: { teacherId: user.id } });
    }
    return tx.user.update({
      where: { id: user.id },
      data: {
        role: nextRole,
        isTeacher: nextIsTeacher,
        tokenVersion: { increment: 1 },
        // If we're promoting someone who was never formally "enrolled"
        // (e.g. a user we promoted directly from pending_review),
        // backfill the enrolledAt timestamp so the admin dashboard
        // treats them sensibly.
        ...(nextRole !== 'suspended' && !user.enrolledAt ? { enrolledAt: new Date() } : {}),
      },
      select: { id: true, email: true, role: true, isTeacher: true, tokenVersion: true },
    });
  });

  // Audit log entry so we can tell after the fact who got promoted when.
  await prisma.auditLog.create({
    data: {
      userId: updated.id,
      action: `ROLE_CHANGED:${user.role}_${user.isTeacher ? 'T' : ''}_to_${updated.role}_${updated.isTeacher ? 'T' : ''}`,
      details: `Via set-user-role.js script`,
    },
  });

  console.log(
    `✓ Done. ${updated.email} is now role=${updated.role}, isTeacher=${updated.isTeacher}.`
  );
  console.log(`  tokenVersion bumped to ${updated.tokenVersion}.`);
  console.log(`  They'll need to log in again to pick up the new role.`);
} finally {
  await prisma.$disconnect();
}
