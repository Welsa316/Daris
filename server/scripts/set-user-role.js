/**
 * Promote (or demote) a user by email. Used for one-off role changes:
 * adding a second admin, demoting an admin back to student, etc.
 *
 * Usage:
 *   DATABASE_URL=postgres://... \
 *     node server/scripts/set-user-role.js <email> <role>
 *
 * Where <role> is one of:
 *   admin              full sheikh-level access
 *   teacher            scoped admin: only assigned students + own classes
 *   enrolled_student   normal active student
 *   suspended          locked out, kept for audit
 *
 * Demoting away from `teacher` cascade-deletes the user's TeacherStudent
 * assignment rows in the same transaction so orphaned assignments don't
 * accumulate. Their authored ClassSession rows stay on the schedule
 * (createdByAdminId is preserved) so historical attribution survives.
 *
 * Other Prisma roles (pending, pending_review, rejected) exist but should
 * be handled through the normal enrollment flow rather than this script.
 *
 * The script bumps `tokenVersion` after the change so any existing JWTs
 * for that user are invalidated. They'll need to log in again to pick up
 * the new role. This prevents a recently-demoted admin from continuing
 * to act with admin powers until their token expires.
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
const role = roleArg.trim();

if (!ALLOWED_ROLES.includes(role)) {
  console.error(`Invalid role "${role}". Allowed: ${ALLOWED_ROLES.join(', ')}`);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Grab it from Railway > Variables and run:');
  console.error(`  DATABASE_URL=postgres://... node server/scripts/set-user-role.js ${email} ${role}`);
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
      emailVerified: true,
      enrolledAt: true,
    },
  });

  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exit(1);
  }

  if (user.role === role) {
    console.log(`User ${user.email} is already ${role}. Nothing to do.`);
    process.exit(0);
  }

  if ((role === 'admin' || role === 'teacher') && !user.emailVerified) {
    console.error(`Refusing to promote ${user.email}: email not verified yet.`);
    console.error('Have them verify their email first, then re-run.');
    process.exit(1);
  }

  // If we're moving away from teacher, drop the user's assigned-student
  // rows in the same transaction so a half-applied state can never exist.
  const wasTeacher = user.role === 'teacher';
  const teacherAssignmentCount = wasTeacher
    ? await prisma.teacherStudent.count({ where: { teacherId: user.id } })
    : 0;

  console.log('Found user:');
  console.log(`  email:    ${user.email}`);
  console.log(`  name:     ${user.firstName} ${user.lastName}`);
  console.log(`  current:  ${user.role}`);
  console.log(`  new:      ${role}`);
  if (wasTeacher && role !== 'teacher' && teacherAssignmentCount > 0) {
    console.log(`  cascade:  ${teacherAssignmentCount} student assignment(s) will be removed`);
  }
  console.log();
  console.log('Applying...');

  // Bump tokenVersion so existing JWTs for this user are immediately invalid.
  // They'll have to log in again to receive a new token reflecting the role.
  const updated = await prisma.$transaction(async (tx) => {
    if (wasTeacher && role !== 'teacher') {
      await tx.teacherStudent.deleteMany({ where: { teacherId: user.id } });
    }
    return tx.user.update({
      where: { id: user.id },
      data: {
        role,
        tokenVersion: { increment: 1 },
        // If we're promoting someone who was never formally "enrolled"
        // (e.g. a user we promoted directly from pending_review),
        // backfill the enrolledAt timestamp so the admin dashboard
        // treats them sensibly.
        ...(role !== 'suspended' && !user.enrolledAt ? { enrolledAt: new Date() } : {}),
      },
      select: { id: true, email: true, role: true, tokenVersion: true },
    });
  });

  // Audit log entry so we can tell after the fact who got promoted when.
  await prisma.auditLog.create({
    data: {
      userId: updated.id,
      action: `ROLE_CHANGED:${user.role}_to_${role}`,
      details: `Promoted via set-user-role.js script`,
    },
  });

  console.log(`✓ Done. ${updated.email} is now ${updated.role}.`);
  console.log(`  tokenVersion bumped to ${updated.tokenVersion}.`);
  console.log(`  They'll need to log in again to pick up the new role.`);
} finally {
  await prisma.$disconnect();
}
