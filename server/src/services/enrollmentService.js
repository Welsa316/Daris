import { prisma } from '../config/database.js';
import { invalidateAllSessions } from './tokenService.js';
import { sendEnrollmentApprovedEmail, sendEnrollmentRejectedEmail } from './emailService.js';
import { sendEnrollmentApprovedWhatsApp, sendEnrollmentRejectedWhatsApp } from './whatsappService.js';
import { auditLog } from '../utils/logger.js';

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

  // Send approval email + WhatsApp
  sendEnrollmentApprovedEmail(student.email, student.firstName, message, lang).catch(() => {});
  sendEnrollmentApprovedWhatsApp(student.whatsapp, student.firstName, message, lang).catch(() => {});

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
  sendEnrollmentRejectedWhatsApp(student.whatsapp, student.firstName, message, lang).catch(() => {});

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

  await prisma.user.update({
    where: { id: studentId },
    data: { deletedAt: new Date(), role: 'suspended' },
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

  // Cache miss — compute and store
  return updateStudentCountCache();
}
