import { prisma } from '../config/database.js';
import { invalidateAllSessions } from './tokenService.js';
import { sendEnrollmentApprovedEmail, sendEnrollmentRejectedEmail } from './emailService.js';
import { auditLog } from '../utils/logger.js';

/**
 * Get registrations stuck at role='pending' — the user signed up but
 * hasn't clicked the verification link yet. They DON'T appear in the
 * normal pending-enrollments list (which only shows verified-but-
 * unapproved 'pending_review'), so the sheikh has no built-in surface
 * to nudge or override them. This function powers the small
 * "Unverified registrations" section above the regular pending list.
 */
export async function getUnverifiedRegistrations({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'pending', deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        phone: true,
        whatsapp: true,
        telegram: true,
        enrollmentMessage: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: 'pending', deletedAt: null } }),
  ]);
  return { requests, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Force a 'pending' (unverified) user into 'pending_review' so the
 * sheikh can approve or reject them via the normal flow. Skips the
 * email verification step entirely. Used when the student is real
 * (sheikh knows them) but the verification email got lost / never
 * clicked / etc. Logs the override in the audit trail.
 */
export async function forceVerifyEnrollment(studentId, adminId) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'pending', deletedAt: null },
  });
  if (!student) {
    return { error: 'student.notFound' };
  }
  await prisma.user.update({
    where: { id: studentId },
    data: { role: 'pending_review', emailVerified: true },
  });
  auditLog('ENROLLMENT_FORCE_VERIFIED', { studentId, adminId });
  return { success: true };
}

/**
 * Get all pending enrollment requests
 */
export async function getPendingEnrollments({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'pending_review' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        phone: true,
        whatsapp: true,
        telegram: true,
        enrollmentMessage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: 'pending_review' } }),
  ]);

  return { requests, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Approve an enrollment request
 */
export async function approveEnrollment(studentId, { message, adminId, lang }) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'pending_review' },
  });

  if (!student) {
    return { error: 'student.notFound' };
  }

  await prisma.user.update({
    where: { id: studentId },
    data: {
      role: 'enrolled_student',
      enrolledAt: new Date(),
    },
  });

  // Update student count cache
  await updateStudentCountCache();

  // Send approval email
  sendEnrollmentApprovedEmail(student.email, student.firstName, message, lang).catch(() => {});

  auditLog('ENROLLMENT_APPROVED', { studentId, adminId });

  return { success: true };
}

/**
 * Reject an enrollment request
 */
export async function rejectEnrollment(studentId, { message, adminId, lang }) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'pending_review' },
  });

  if (!student) {
    return { error: 'student.notFound' };
  }

  await prisma.user.update({
    where: { id: studentId },
    data: {
      role: 'rejected',
      rejectedAt: new Date(),
      rejectionMessage: message || null,
    },
  });

  sendEnrollmentRejectedEmail(student.email, student.firstName, message, lang).catch(() => {});

  auditLog('ENROLLMENT_REJECTED', { studentId, adminId, reason: message });

  return { success: true };
}

/**
 * Get rejected applicants
 */
export async function getRejectedApplicants({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [applicants, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'rejected' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        rejectedAt: true,
        rejectionMessage: true,
        createdAt: true,
      },
      orderBy: { rejectedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: 'rejected' } }),
  ]);

  return { applicants, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Suspend/remove a student
 */
export async function suspendStudent(studentId, adminId) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'enrolled_student' },
  });

  if (!student) {
    return { error: 'student.notFound' };
  }

  await prisma.user.update({
    where: { id: studentId },
    data: { role: 'suspended' },
  });

  // Immediately invalidate all sessions
  await invalidateAllSessions(studentId);

  // Update student count
  await updateStudentCountCache();

  auditLog('STUDENT_SUSPENDED', { studentId, adminId });

  return { success: true };
}

/**
 * Soft-delete a student
 */
export async function removeStudent(studentId, adminId) {
  const student = await prisma.user.findFirst({
    where: { id: studentId },
  });

  if (!student) {
    return { error: 'student.notFound' };
  }

  // The four writes below are wrapped in a transaction: between "delete
  // assignments" and "delete orphan sessions" another request could re-
  // populate the class, leaving dangling data. $transaction serializes
  // the read-then-write pattern.
  await prisma.$transaction(async (tx) => {
    const affected = await tx.classAssignment.findMany({
      where: { studentId },
      select: { classSessionId: true },
    });

    await tx.classAssignment.deleteMany({ where: { studentId } });

    if (affected.length) {
      const sessionIds = [...new Set(affected.map((a) => a.classSessionId))];
      await tx.classSession.deleteMany({
        where: {
          id: { in: sessionIds },
          assignments: { none: { student: { deletedAt: null } } },
        },
      });
    }

    await tx.user.update({
      where: { id: studentId },
      data: { deletedAt: new Date(), role: 'suspended' },
    });
  });

  // Immediately invalidate all sessions
  await invalidateAllSessions(studentId);

  // Update student count
  await updateStudentCountCache();

  auditLog('STUDENT_REMOVED', { studentId, adminId });

  return { success: true };
}

/**
 * Update the cached student count
 */
export async function updateStudentCountCache() {
  const count = await prisma.user.count({
    where: { role: 'enrolled_student', deletedAt: null },
  });

  await prisma.studentCountCache.upsert({
    where: { id: 'singleton' },
    update: { count },
    create: { id: 'singleton', count },
  });

  return count;
}

/**
 * Get the cached student count
 */
export async function getStudentCount() {
  const cached = await prisma.studentCountCache.findUnique({
    where: { id: 'singleton' },
  });

  if (cached) {
    return cached.count;
  }

  // Cache miss. compute and store
  return updateStudentCountCache();
}

/**
 * Public-facing marketing stats: how many students taught, how many
 * countries those students span. Used by the Why Daris row on the home
 * page. Both numbers come from the live student table — they grow as
 * the school grows, no manual update needed in the i18n file.
 *
 * Country count counts distinct non-null country values across active
 * (non-deleted, enrolled) students. Empty / null countries are ignored
 * so a stray test account without a country doesn't inflate the count.
 */

// Pre-Daris-platform baseline. The sheikh taught students for years
// before this app existed, and those students should count toward the
// "Students taught" stat on the marketing site. The number grows with
// new enrollments — display value = baseline + current enrolled count.
// Edit this constant if the baseline needs adjusting; the API and both
// home-page stat components pick it up automatically.
const STUDENTS_TAUGHT_BASELINE = 100;

export async function getPublicStats() {
  const enrolled = await getStudentCount();
  const rows = await prisma.user.findMany({
    where: {
      role: 'enrolled_student',
      deletedAt: null,
      country: { not: null },
    },
    select: { country: true },
    distinct: ['country'],
  });
  const countriesCount = rows.filter((r) => (r.country || '').trim().length > 0).length;
  return {
    studentsCount: STUDENTS_TAUGHT_BASELINE + enrolled,
    countriesCount,
  };
}
