import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { enrollmentDecisionSchema, adminNoteSchema, classSessionSchema, classSessionUpdateSchema, rescheduleClassSchema, announcementSchema, paginationSchema, messageStudentSchema, availabilitySlotsSchema, availabilityOverrideSchema, batchClassSchema, meetingLinkSchema, checkConflictsSchema, classLogSchema, paymentSchema, paymentUpdateSchema, studentProfileSchema, studentTeachersSchema } from '../validators/adminSchemas.js';
import { getPendingEnrollments, approveEnrollment, rejectEnrollment, getRejectedApplicants, suspendStudent, removeStudent } from '../services/enrollmentService.js';
import { prisma } from '../config/database.js';
import { sendClassCancelledEmail, sendClassRescheduledEmail, sendFutureAssignmentsClearedEmail } from '../services/emailService.js';
import { findConflicts } from '../services/classConflictService.js';
import {
  scopedStudentFilter,
  scopedClassFilter,
  requireClassAccess,
  requireStudentAccess,
} from '../services/scopingService.js';
import { toCsv, sendCsv } from '../utils/csv.js';
import { t, getLang } from '../utils/i18n.js';
import { auditLog, logger } from '../utils/logger.js';
import { sendEmail } from '../services/emailService.js';
import { env } from '../config/env.js';

const router = Router();

// All admin routes require authentication. Default access tier is
// admin-or-teacher; sheikh-only routes add `requireAdmin` per-route so
// teachers get a 403 rather than a scoped-empty response. Data visibility
// inside admin-or-teacher routes is constrained by scopedStudentFilter
// and scopedClassFilter at the query level (sheikh's filter is empty;
// teachers see only their own assigned students + own creations).
router.use(authenticate, verifyTokenVersion, requireAdminOrTeacher);

// --- Dashboard Stats ---
router.get('/stats', async (req, res, next) => {
  try {
    const isSheikh = req.user.role === 'admin';
    const studentScope = scopedStudentFilter(req.user);
    const classScope = scopedClassFilter(req.user);

    const [totalEnrolled, totalPending, upcomingClasses, recentActivity] = await Promise.all([
      // Sheikh: all enrolled students. Teacher: only their assigned students.
      prisma.user.count({
        where: {
          role: 'enrolled_student',
          deletedAt: null,
          ...studentScope,
        },
      }),
      // Pending enrollment count is a sheikh-only signal. Teachers don't
      // approve enrollments, so we don't show the number to them.
      isSheikh
        ? prisma.user.count({ where: { role: 'pending_review', deletedAt: null } })
        : Promise.resolve(0),
      prisma.classSession.count({
        where: {
          startTime: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          cancelled: false,
          ...classScope,
        },
      }),
      // Audit log is sheikh-only. Teachers don't see what other teachers
      // (or the sheikh) have done.
      isSheikh
        ? prisma.auditLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              action: true,
              details: true,
              createdAt: true,
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    res.json({
      totalEnrolled,
      totalPending,
      upcomingClasses,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

// --- Enrollment Management ---

// Enrollment management is sheikh-only. Teachers don't approve who
// joins the school; they only work with already-enrolled students.
router.get('/enrollments/pending', requireAdmin, validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await getPendingEnrollments(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/enrollments/rejected', requireAdmin, validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await getRejectedApplicants(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/enrollments/:id/approve', requireAdmin, validate(enrollmentDecisionSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await approveEnrollment(req.params.id, {
      message: req.body.message,
      adminId: req.user.id,
      lang,
    });

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('enrollment.approvedAdmin', lang) });
  } catch (error) {
    next(error);
  }
});

router.post('/enrollments/:id/reject', requireAdmin, validate(enrollmentDecisionSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await rejectEnrollment(req.params.id, {
      message: req.body.message,
      adminId: req.user.id,
      lang,
    });

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('enrollment.rejectedAdmin', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Student Management ---

router.get('/students', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const { page, limit, search, sort, order } = req.query;
    const skip = (page - 1) * limit;

    // Scope the list: sheikh sees all enrolled students, teacher sees
    // only those they're linked to via TeacherStudent. Sheikh's filter
    // contributes nothing to the where clause.
    const where = {
      role: 'enrolled_student',
      deletedAt: null,
      ...scopedStudentFilter(req.user),
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { country: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const orderBy = {};
    if (sort && ['firstName', 'lastName', 'email', 'country', 'enrolledAt', 'lastLoginAt', 'createdAt'].includes(sort)) {
      orderBy[sort] = order;
    } else {
      orderBy.enrolledAt = 'desc';
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          phone: true,
          whatsapp: true,
          telegram: true,
          enrolledAt: true,
          lastLoginAt: true,
          createdAt: true,
          expectedMonthlyAmount: true,
          expectedMonthlyCurrency: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Attach this-month's payment total per student so the frontend can render
    // an outstanding-balance pill without hitting the detail endpoint per row.
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const paymentsThisMonth = await prisma.payment.groupBy({
      by: ['studentId', 'currency'],
      where: {
        studentId: { in: students.map((s) => s.id) },
        paidAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });
    const paidMap = {};
    for (const row of paymentsThisMonth) {
      paidMap[row.studentId] ??= {};
      paidMap[row.studentId][row.currency] = row._sum.amount || 0;
    }
    for (const s of students) {
      s.paidThisMonth = paidMap[s.id] || {};
    }

    res.json({
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:id', async (req, res, next) => {
  try {
    const lang = getLang(req);
    // Compose the scope filter into the lookup so a teacher who knows the
    // id of an unassigned student gets a 404 (effectively, "doesn't exist
    // to you") rather than the student data.
    const student = await prisma.user.findFirst({
      where: { id: req.params.id, ...scopedStudentFilter(req.user) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        phone: true,
        whatsapp: true,
        telegram: true,
        role: true,
        enrollmentMessage: true,
        enrolledAt: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        preferredLanguage: true,
        expectedMonthlyAmount: true,
        expectedMonthlyCurrency: true,
        adminNotes: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        classAssignments: {
          orderBy: { classSession: { startTime: 'desc' } },
          select: {
            id: true,
            classSession: {
              select: {
                id: true,
                title: true,
                titleAr: true,
                startTime: true,
                endTime: true,
                meetingLink: true,
                cancelled: true,
                rescheduled: true,
                recurrence: true,
                seriesId: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    res.json({ student });
  } catch (error) {
    next(error);
  }
});

// Suspending is a heavy global action (locks the student out entirely,
// not just from one teacher's classes). Sheikh-only.
router.post('/students/:id/suspend', requireAdmin, async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await suspendStudent(req.params.id, req.user.id);

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('student.suspended', lang) });
  } catch (error) {
    next(error);
  }
});

// Update the editable admin-facing fields on a student's profile. currently
// preferred language and expected monthly tuition. These drive the balance
// pill and the language used in reminder emails.
router.put(
  '/students/:id/profile',
  validate(studentProfileSchema),
  async (req, res, next) => {
    try {
      // Teachers can only edit profile fields for their assigned students.
      // Sheikh edits anyone. requireStudentAccess throws 403 if the teacher
      // is touching a student outside their scope.
      await requireStudentAccess(req.user, req.params.id, prisma);

      const { preferredLanguage, expectedMonthlyAmount, expectedMonthlyCurrency } = req.body;
      const data = {};
      if (preferredLanguage !== undefined) data.preferredLanguage = preferredLanguage;
      if (expectedMonthlyAmount !== undefined) data.expectedMonthlyAmount = expectedMonthlyAmount;
      if (expectedMonthlyCurrency !== undefined) data.expectedMonthlyCurrency = expectedMonthlyCurrency;

      const student = await prisma.user.update({
        where: { id: req.params.id },
        data,
        select: {
          id: true,
          preferredLanguage: true,
          expectedMonthlyAmount: true,
          expectedMonthlyCurrency: true,
        },
      });

      auditLog('STUDENT_PROFILE_UPDATED', {
        studentId: req.params.id,
        adminId: req.user.id,
        fields: Object.keys(data),
      });

      res.json({ student });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: t('student.notFound', getLang(req)) });
      }
      next(error);
    }
  }
);

// Soft-deleting a student is a global account-level action. Sheikh-only.
router.delete('/students/:id', requireAdmin, async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await removeStudent(req.params.id, req.user.id);

    if (result.error) {
      return res.status(404).json({ error: t(result.error, lang) });
    }

    res.json({ message: t('student.removed', lang) });
  } catch (error) {
    next(error);
  }
});

// Drop the student from every upcoming class without suspending their account.
// Used when a student changes their schedule permanently. Other students in
// co-taught classes keep their bookings. Sheikh-only because it nukes
// classes across all teachers; a single teacher who wants to "stop teaching"
// a student should unassign them in the Teachers tab instead.
router.delete('/students/:id/future-assignments', requireAdmin, async (req, res, next) => {
  try {
    const lang = getLang(req);
    const studentId = req.params.id;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        deletedAt: true, preferredLanguage: true,
      },
    });
    if (!student || student.deletedAt) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    const now = new Date();

    // Wrap in a transaction so we can't end up with a half-cleaned state
    // if a concurrent request re-adds an assignment between our read and
    // our delete.
    const result = await prisma.$transaction(async (tx) => {
      const affected = await tx.classAssignment.findMany({
        where: {
          studentId,
          classSession: { startTime: { gt: now }, cancelled: false },
        },
        select: { classSessionId: true },
      });

      const deleted = await tx.classAssignment.deleteMany({
        where: {
          studentId,
          classSession: { startTime: { gt: now }, cancelled: false },
        },
      });

      if (affected.length) {
        const sessionIds = [...new Set(affected.map((a) => a.classSessionId))];
        await tx.classSession.deleteMany({
          where: {
            id: { in: sessionIds },
            assignments: { none: { student: { deletedAt: null } } },
          },
        });
      }

      return deleted;
    });

    auditLog('STUDENT_FUTURE_ASSIGNMENTS_CLEARED', {
      studentId,
      removed: result.count,
      adminId: req.user.id,
    });

    // Fire-and-forget email in the STUDENT's preferred language. not the
    // admin's current UI language.
    if (result.count > 0) {
      const studentLang = student.preferredLanguage === 'en' ? 'en' : 'ar';
      sendFutureAssignmentsClearedEmail(student, result.count, studentLang).catch((err) =>
        logger.error('future-assignments email failed', { error: err.message })
      );
    }

    res.json({ removed: result.count });
  } catch (error) {
    next(error);
  }
});

// --- Admin Notes ---

router.get('/students/:id/notes', async (req, res, next) => {
  try {
    await requireStudentAccess(req.user, req.params.id, prisma);
    const notes = await prisma.adminNote.findMany({
      where: { studentId: req.params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ notes });
  } catch (error) {
    next(error);
  }
});

router.post('/students/:id/notes', validate(adminNoteSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    await requireStudentAccess(req.user, req.params.id, prisma);

    const student = await prisma.user.findFirst({ where: { id: req.params.id } });
    if (!student) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    const note = await prisma.adminNote.create({
      data: {
        studentId: req.params.id,
        authorId: req.user.id,
        content: req.body.content,
      },
      select: { id: true, content: true, createdAt: true },
    });

    auditLog('NOTE_CREATED', { studentId: req.params.id, noteId: note.id, adminId: req.user.id });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

// Replace this student's full taught-by set. Sheikh-only on purpose:
// who teaches whom is a sheikh-driven decision, not a teacher-driven
// one. The endpoint is idempotent (re-submitting the same list is a
// no-op) so the schedule form can call it on every save without
// special-casing "did the picker change".
router.put(
  '/students/:id/teachers',
  requireAdmin,
  validate(studentTeachersSchema),
  async (req, res, next) => {
    try {
      const lang = getLang(req);
      const studentId = req.params.id;
      const { teacherIds } = req.body;

      const student = await prisma.user.findFirst({
        where: { id: studentId, role: 'enrolled_student', deletedAt: null },
        select: { id: true },
      });
      if (!student) {
        return res.status(404).json({ error: t('error.notFound', lang) });
      }

      // Verify every teacherId actually refers to an active teacher.
      // Refuses to silently drop bogus ids on the floor — typos or stale
      // dashboard state should fail loudly so the sheikh knows to refresh.
      if (teacherIds.length > 0) {
        const existingTeachers = await prisma.user.findMany({
          where: {
            id: { in: teacherIds },
            role: 'teacher',
            deletedAt: null,
          },
          select: { id: true },
        });
        if (existingTeachers.length !== teacherIds.length) {
          return res.status(400).json({
            error: 'One or more teacherIds do not refer to an active teacher',
          });
        }
      }

      // Diff in a transaction so the assignments table never reflects a
      // half-applied state if a concurrent request changes things mid-flight.
      const desired = new Set(teacherIds);
      const result = await prisma.$transaction(async (tx) => {
        const current = await tx.teacherStudent.findMany({
          where: { studentId },
          select: { teacherId: true },
        });
        const currentSet = new Set(current.map((r) => r.teacherId));

        const toAdd = [...desired].filter((tid) => !currentSet.has(tid));
        const toRemove = [...currentSet].filter((tid) => !desired.has(tid));

        if (toRemove.length) {
          await tx.teacherStudent.deleteMany({
            where: { studentId, teacherId: { in: toRemove } },
          });
        }
        if (toAdd.length) {
          await tx.teacherStudent.createMany({
            data: toAdd.map((teacherId) => ({
              teacherId,
              studentId,
              assignedByAdminId: req.user.id,
            })),
          });
        }

        return { added: toAdd.length, removed: toRemove.length, total: desired.size };
      });

      auditLog('STUDENT_TEACHERS_UPDATED', {
        studentId,
        adminId: req.user.id,
        ...result,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/notes/:id', validate(adminNoteSchema), async (req, res, next) => {
  try {
    // Look up the note's studentId before update so we can verify the
    // current user can act on that student. Teachers editing notes for
    // students outside their scope get a 403.
    const existing = await prisma.adminNote.findUnique({
      where: { id: req.params.id },
      select: { studentId: true },
    });
    if (!existing) return res.status(404).json({ error: t('error.notFound', getLang(req)) });
    await requireStudentAccess(req.user, existing.studentId, prisma);

    const note = await prisma.adminNote.update({
      where: { id: req.params.id },
      data: { content: req.body.content },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });

    res.json({ note });
  } catch (error) {
    next(error);
  }
});

router.delete('/notes/:id', async (req, res, next) => {
  try {
    const existing = await prisma.adminNote.findUnique({
      where: { id: req.params.id },
      select: { studentId: true },
    });
    if (!existing) return res.status(404).json({ error: t('error.notFound', getLang(req)) });
    await requireStudentAccess(req.user, existing.studentId, prisma);

    await prisma.adminNote.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Scheduling ---

router.get('/classes', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    // Hide classes with zero live students (orphans left behind when a
    // student was removed; rows are preserved for audit but shouldn't
    // clutter the calendar). Then layer the role-based scope on top:
    // sheikh sees everything, teacher sees own creations + assigned
    // students' classes.
    const classWhere = {
      assignments: { some: { student: { deletedAt: null } } },
      ...scopedClassFilter(req.user),
    };

    const [classes, total] = await Promise.all([
      prisma.classSession.findMany({
        where: classWhere,
        orderBy: { startTime: 'asc' },
        include: {
          assignments: {
            // Hide assignments belonging to soft-deleted students so removed
            // students don't keep haunting the upcoming-classes list.
            where: { student: { deletedAt: null } },
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.classSession.count({ where: classWhere }),
    ]);

    res.json({ classes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

router.post('/classes', validate(classSessionSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { studentIds, ...classData } = req.body;

    // For teachers, every studentId in the body must be one of their
    // assigned students. Sheikh bypasses the check.
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      for (const sid of studentIds) {
        await requireStudentAccess(req.user, sid, prisma);
      }
    }

    const classSession = await prisma.classSession.create({
      data: {
        ...classData,
        startTime: new Date(classData.startTime),
        endTime: new Date(classData.endTime),
        recurrenceEnd: classData.recurrenceEnd ? new Date(classData.recurrenceEnd) : null,
        createdByAdminId: req.user.id,
      },
    });

    // Assign students. Default-to-all means "all enrolled students" for
    // the sheikh, but only "all students assigned to me" for a teacher.
    let assigneeIds = studentIds;
    if (!assigneeIds || assigneeIds.length === 0) {
      const enrolled = await prisma.user.findMany({
        where: {
          role: 'enrolled_student',
          deletedAt: null,
          ...scopedStudentFilter(req.user),
        },
        select: { id: true },
      });
      assigneeIds = enrolled.map((s) => s.id);
    }

    if (assigneeIds.length > 0) {
      await prisma.classAssignment.createMany({
        data: assigneeIds.map((studentId) => ({
          classSessionId: classSession.id,
          studentId,
        })),
      });
    }

    auditLog('CLASS_CREATED', { classId: classSession.id, adminId: req.user.id });

    res.status(201).json({ message: t('schedule.created', lang), classSession });
  } catch (error) {
    next(error);
  }
});

router.put('/classes/:id', validate(classSessionUpdateSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { studentIds, ...updateData } = req.body;

    // Scope check: sheikh can edit any class. Teachers can only edit
    // classes they created or whose attendees are their students.
    const owned = await prisma.classSession.findFirst({
      where: { id: req.params.id, ...scopedClassFilter(req.user) },
      select: { id: true },
    });
    if (!owned) return res.status(404).json({ error: t('schedule.classNotFound', lang) });

    // If the editor is a teacher, they may only assign students within
    // their own scope. Sheikh can attach anyone.
    if (Array.isArray(studentIds)) {
      for (const sid of studentIds) {
        await requireStudentAccess(req.user, sid, prisma);
      }
    }

    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);
    if (updateData.recurrenceEnd) updateData.recurrenceEnd = new Date(updateData.recurrenceEnd);

    const classSession = await prisma.classSession.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Update student assignments if provided
    if (studentIds) {
      await prisma.classAssignment.deleteMany({ where: { classSessionId: classSession.id } });

      if (studentIds.length > 0) {
        await prisma.classAssignment.createMany({
          data: studentIds.map((studentId) => ({
            classSessionId: classSession.id,
            studentId,
          })),
        });
      }
    }

    auditLog('CLASS_UPDATED', { classId: classSession.id, adminId: req.user.id });

    res.json({ message: t('schedule.updated', lang), classSession });
  } catch (error) {
    next(error);
  }
});

router.post('/classes/:id/cancel', async (req, res, next) => {
  try {
    const lang = getLang(req);

    // Scope check: sheikh can cancel any class; teachers only their own.
    const owned = await prisma.classSession.findFirst({
      where: { id: req.params.id, ...scopedClassFilter(req.user) },
      select: { id: true },
    });
    if (!owned) return res.status(404).json({ error: t('schedule.classNotFound', lang) });

    const classSession = await prisma.classSession.update({
      where: { id: req.params.id },
      data: { cancelled: true, cancelledAt: new Date() },
      include: {
        assignments: {
          where: { student: { deletedAt: null } },
          include: {
            student: { select: { email: true, firstName: true, preferredLanguage: true } },
          },
        },
      },
    });

    // Notify each assigned student in their own preferred language.
    for (const assignment of classSession.assignments) {
      const studentLang = assignment.student.preferredLanguage === 'en' ? 'en' : 'ar';
      sendClassCancelledEmail(
        assignment.student.email,
        assignment.student.firstName,
        classSession.title,
        classSession.startTime.toISOString(),
        studentLang
      ).catch(() => {});
    }

    auditLog('CLASS_CANCELLED', { classId: classSession.id, adminId: req.user.id });

    res.json({ message: t('schedule.cancelled', lang) });
  } catch (error) {
    next(error);
  }
});

// Cancel every not-yet-started class in the same series starting at or after
// the given class's start time. Used by the "cancel this and following" UI.
router.post('/classes/:id/cancel-series', async (req, res, next) => {
  try {
    const lang = getLang(req);

    // Scope check on the anchor class itself. Teachers can't anchor
    // a series cancel on a class they can't see.
    const anchor = await prisma.classSession.findFirst({
      where: { id: req.params.id, ...scopedClassFilter(req.user) },
      select: { id: true, seriesId: true, startTime: true, createdByAdminId: true },
    });
    if (!anchor) return res.status(404).json({ error: t('schedule.classNotFound', lang) });
    if (!anchor.seriesId) {
      return res.status(400).json({ error: t('schedule.notSeries', lang) });
    }

    // Find every not-already-cancelled session in the same series at or
    // after this anchor that the user can also act on. The createdByAdminId
    // filter on `anchor.createdByAdminId` keeps the original "cancel only
    // sessions in this series owned by the same person" semantics, which
    // happens to align with the scope filter for teachers anyway.
    const targets = await prisma.classSession.findMany({
      where: {
        seriesId: anchor.seriesId,
        cancelled: false,
        startTime: { gte: anchor.startTime },
        createdByAdminId: anchor.createdByAdminId,
        ...scopedClassFilter(req.user),
      },
      include: {
        assignments: {
          where: { student: { deletedAt: null } },
          include: {
            student: { select: { email: true, firstName: true, preferredLanguage: true } },
          },
        },
      },
    });

    await prisma.classSession.updateMany({
      where: { id: { in: targets.map((c) => c.id) } },
      data: { cancelled: true, cancelledAt: new Date() },
    });

    // Notify each student once per cancelled class in their own language.
    for (const cls of targets) {
      for (const a of cls.assignments) {
        const studentLang = a.student.preferredLanguage === 'en' ? 'en' : 'ar';
        sendClassCancelledEmail(
          a.student.email,
          a.student.firstName,
          cls.title,
          cls.startTime.toISOString(),
          studentLang
        ).catch(() => {});
      }
    }

    auditLog('CLASS_SERIES_CANCELLED', {
      anchorClassId: anchor.id,
      seriesId: anchor.seriesId,
      count: targets.length,
      adminId: req.user.id,
    });

    res.json({ message: t('schedule.cancelled', lang), count: targets.length });
  } catch (error) {
    next(error);
  }
});

router.post('/classes/:id/reschedule', validate(rescheduleClassSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { startTime, endTime } = req.body;

    // Fetch current class to preserve original times AND assert access.
    // Sheikh: any class. Teacher: own creations + assigned-student classes.
    const existing = await prisma.classSession.findFirst({
      where: { id: req.params.id, ...scopedClassFilter(req.user) },
    });
    if (!existing) return res.status(404).json({ error: t('schedule.classNotFound', lang) });

    // Preserve the first original times (don't overwrite on subsequent reschedules)
    const originalStartTime = existing.originalStartTime || existing.startTime;
    const originalEndTime = existing.originalEndTime || existing.endTime;

    const classSession = await prisma.classSession.update({
      where: { id: req.params.id },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rescheduled: true,
        rescheduledAt: new Date(),
        originalStartTime,
        originalEndTime,
        // Clear cancelled status if it was cancelled
        cancelled: false,
        cancelledAt: null,
        // Reset reminder timestamps so the reminder job re-fires for the
        // new time. Without this, a rescheduled class silently skips both
        // its 30-min and 24-hr reminders forever.
        reminder30SentAt: null,
        reminder24SentAt: null,
      },
      include: {
        assignments: {
          where: { student: { deletedAt: null } },
          include: {
            student: { select: { email: true, firstName: true, preferredLanguage: true } },
          },
        },
      },
    });

    // Notify each assigned student in their own preferred language.
    for (const assignment of classSession.assignments) {
      const studentLang = assignment.student.preferredLanguage === 'en' ? 'en' : 'ar';
      sendClassRescheduledEmail(
        assignment.student.email,
        assignment.student.firstName,
        classSession.title,
        existing.startTime.toISOString(),
        new Date(startTime).toISOString(),
        studentLang
      ).catch(() => {});
    }

    auditLog('CLASS_RESCHEDULED', { classId: classSession.id, adminId: req.user.id });

    res.json({ message: t('schedule.rescheduled', lang), classSession });
  } catch (error) {
    next(error);
  }
});

router.delete('/classes/:id', async (req, res, next) => {
  try {
    const lang = getLang(req);
    // Scope the delete: sheikh deletes any class, teacher only what they
    // can see. Stranger ids return 404 the same as before.
    const result = await prisma.classSession.deleteMany({
      where: { id: req.params.id, ...scopedClassFilter(req.user) },
    });
    if (result.count === 0) return res.status(404).json({ error: t('schedule.classNotFound', lang) });
    auditLog('CLASS_DELETED', { classId: req.params.id, adminId: req.user.id });
    res.json({ message: t('schedule.deleted', lang) });
  } catch (error) {
    next(error);
  }
});

// Delete all classes (bulk wipe). Sheikh-only because nuking a teacher's
// schedule globally is too destructive an operation to expose to teachers.
router.delete('/classes', requireAdmin, async (req, res, next) => {
  try {
    const lang = getLang(req);
    const now = new Date();
    await prisma.classAssignment.deleteMany({
      where: { classSession: { startTime: { gte: now } } },
    });
    const result = await prisma.classSession.deleteMany({
      where: { startTime: { gte: now } },
    });
    auditLog('ALL_CLASSES_DELETED', { count: result.count, adminId: req.user.id });
    res.json({ message: t('schedule.deleted', lang), count: result.count });
  } catch (error) {
    next(error);
  }
});

// --- Settings (sheikh-only) ---

router.get('/settings', requireAdmin, async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result = {};
    for (const s of settings) result[s.key] = s.value;
    res.json({ settings: result });
  } catch (error) {
    next(error);
  }
});

router.put('/settings/meeting-link', requireAdmin, validate(meetingLinkSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    await prisma.siteSetting.upsert({
      where: { key: 'meetingLink' },
      update: { value: req.body.meetingLink },
      create: { key: 'meetingLink', value: req.body.meetingLink },
    });
    auditLog('MEETING_LINK_UPDATED', { adminId: req.user.id });
    res.json({ message: t('schedule.updated', lang) });
  } catch (error) {
    next(error);
  }
});

// --- Batch Class Creation (simplified scheduling) ---

router.post('/classes/batch', validate(batchClassSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { studentId, title, titleAr, subject, timezone, sessions, resolutions = {} } = req.body;

    // Teacher can only schedule for students assigned to them. Sheikh
    // bypasses this check and can schedule for any enrolled student.
    await requireStudentAccess(req.user, studentId, prisma);

    // Guard against the batch itself containing overlapping sessions. The
    // frontend hits /check-conflicts against existing DB rows, but an admin
    // picking two overlapping days-of-the-week for the same time slot would
    // generate internal collisions that checkConflicts doesn't see.
    const sortedSessions = sessions
      .map((s) => ({
        startMs: new Date(s.startTime).getTime(),
        endMs: new Date(s.endTime).getTime(),
        raw: s,
      }))
      .sort((a, b) => a.startMs - b.startMs);
    for (let i = 1; i < sortedSessions.length; i++) {
      const prev = sortedSessions[i - 1];
      const curr = sortedSessions[i];
      if (curr.startMs < prev.endMs) {
        return res.status(400).json({
          error: t('schedule.intraBatchOverlap', lang) || 'The selected days/time produce overlapping sessions. Choose a different time or drop one of the days.',
          conflictAt: new Date(curr.startMs).toISOString(),
        });
      }
    }

    // Get global meeting link
    const meetingLinkSetting = await prisma.siteSetting.findUnique({ where: { key: 'meetingLink' } });
    const meetingLink = meetingLinkSetting?.value || null;

    // One series ID per batch call. Later the admin can cancel "this and
    // all future occurrences" by matching this ID.
    const seriesId = randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let merged = 0;
      let skipped = 0;

      for (const session of sessions) {
        // The resolution map is keyed by startMs-endMs. We used ISO strings
        // before, but any client that serializes with a non-UTC offset would
        // produce a string the backend doesn't recognize. numbers are
        // canonical and survive any serializer.
        const key = `${new Date(session.startTime).getTime()}-${new Date(session.endTime).getTime()}`;
        const resolution = resolutions[key] || 'create';

        if (resolution === 'skip') {
          skipped += 1;
          continue;
        }

        if (resolution === 'merge') {
          // Find an existing class at the exact same slot and attach the
          // student to it instead of creating a parallel session. We
          // intentionally constrain merge candidates to the user's own
          // creations (teacher merges into teacher's existing class;
          // sheikh merges into any class he created) rather than the
          // broader scope filter, so teachers don't silently merge a new
          // student into another teacher's class.
          const existing = await tx.classSession.findFirst({
            where: {
              createdByAdminId: req.user.id,
              cancelled: false,
              startTime: new Date(session.startTime),
              endTime: new Date(session.endTime),
            },
            select: { id: true },
          });

          if (existing) {
            // `upsert` via unique index. if the student was somehow already
            // in this class we silently succeed instead of throwing on the
            // unique constraint.
            await tx.classAssignment.upsert({
              where: {
                classSessionId_studentId: {
                  classSessionId: existing.id,
                  studentId,
                },
              },
              create: { classSessionId: existing.id, studentId },
              update: {},
            });
            merged += 1;
            continue;
          }
          // No matching slot anymore. fall through to create instead.
        }

        // 'create' and 'force' both land here: make a fresh ClassSession.
        const classSession = await tx.classSession.create({
          data: {
            title,
            titleAr: titleAr || null,
            subject: subject || null,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
            meetingLink,
            recurrence: 'weekly',
            timezone,
            seriesId,
            createdByAdminId: req.user.id,
          },
        });
        await tx.classAssignment.create({
          data: {
            classSessionId: classSession.id,
            studentId,
          },
        });
        created += 1;
      }

      return { created, merged, skipped };
    });

    auditLog('CLASSES_BATCH_CREATED', {
      ...result,
      studentId,
      adminId: req.user.id,
    });

    res.status(201).json({
      message: t('schedule.created', lang),
      ...result,
      // Keep `count` for backward compatibility with any older client that reads it.
      count: result.created + result.merged,
    });
  } catch (error) {
    next(error);
  }
});

// Detect conflicts *before* actually creating anything. The frontend calls
// this first, shows a resolution modal, then POSTs to /classes/batch with a
// `resolutions` map.
router.post('/classes/check-conflicts', validate(checkConflictsSchema), async (req, res, next) => {
  try {
    const { studentId, sessions } = req.body;
    // Refuse if the teacher isn't allowed to schedule for this student;
    // sheikh bypasses.
    await requireStudentAccess(req.user, studentId, prisma);
    const conflicts = await findConflicts(sessions, studentId, req.user);
    res.json({ conflicts });
  } catch (error) {
    next(error);
  }
});

// --- Announcements (sheikh-only) ---
// Site-wide announcements are sheikh-controlled. Teachers don't decide
// what every student sees on their dashboard.

router.get('/announcements', requireAdmin, async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements', requireAdmin, validate(announcementSchema), async (req, res, next) => {
  try {
    const announcement = await prisma.announcement.create({ data: req.body });
    auditLog('ANNOUNCEMENT_CREATED', { announcementId: announcement.id, adminId: req.user.id });
    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.put('/announcements/:id', requireAdmin, validate(announcementSchema), async (req, res, next) => {
  try {
    const announcement = await prisma.announcement.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.delete('/announcements/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Message Student ---
router.post('/students/:id/message', validate(messageStudentSchema), async (req, res, next) => {
  try {
    const lang = getLang(req);
    // Teachers can email their own assigned students; sheikh anyone.
    await requireStudentAccess(req.user, req.params.id, prisma);
    const student = await prisma.user.findFirst({
      where: { id: req.params.id },
      select: { email: true, firstName: true },
    });

    if (!student) {
      return res.status(404).json({ error: t('student.notFound', lang) });
    }

    await sendEmail({
      to: student.email,
      subject: req.body.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F4D3A;">Message from Daris</h2>
          <p>Dear ${student.firstName},</p>
          <div style="background: #f5f1e8; padding: 16px; border-radius: 6px; margin: 16px 0;">
            ${req.body.message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    });

    auditLog('STUDENT_MESSAGED', { studentId: req.params.id, adminId: req.user.id });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Availability Management (sheikh-only edits; read accessible to teachers) ---
// The slots table is currently a single shared schedule (sheikh's). Until we
// model per-teacher availability separately, only the sheikh edits these.
// Teachers can READ the schedule via /availability/open-slots so their
// scheduling form knows when slots are free.

router.get('/availability', requireAdmin, async (req, res, next) => {
  try {
    const [slots, overrides] = await Promise.all([
      prisma.availabilitySlot.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }, { startMin: 'asc' }] }),
      prisma.availabilityOverride.findMany({ orderBy: { date: 'asc' } }),
    ]);
    res.json({ slots, overrides });
  } catch (error) {
    next(error);
  }
});

// Replace all availability slots (full save). Sheikh-only.
router.put('/availability/slots', requireAdmin, validate(availabilitySlotsSchema), async (req, res, next) => {
  try {
    const { slots } = req.body;

    // Delete all existing slots and re-create
    await prisma.availabilitySlot.deleteMany();

    if (slots.length > 0) {
      await prisma.availabilitySlot.createMany({
        data: slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startHour: s.startHour,
          startMin: s.startMin || 0,
          endHour: s.endHour,
          endMin: s.endMin || 0,
        })),
      });
    }

    auditLog('AVAILABILITY_UPDATED', { adminId: req.user.id, slotCount: slots.length });

    const updated = await prisma.availabilitySlot.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }] });
    res.json({ slots: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/availability/overrides', requireAdmin, validate(availabilityOverrideSchema), async (req, res, next) => {
  try {
    const { date, available, startHour, startMin, endHour, endMin, reason } = req.body;

    const override = await prisma.availabilityOverride.upsert({
      where: { date: new Date(date) },
      create: { date: new Date(date), available, startHour, startMin, endHour, endMin, reason },
      update: { available, startHour, startMin, endHour, endMin, reason },
    });

    auditLog('AVAILABILITY_OVERRIDE_SET', { adminId: req.user.id, date, available });

    res.json({ override });
  } catch (error) {
    next(error);
  }
});

router.delete('/availability/overrides/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.availabilityOverride.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// --- Get available booking slots for a specific week ---
router.get('/availability/open-slots', async (req, res, next) => {
  try {
    const { weekStart } = req.query; // ISO date string for Monday of the week
    const start = weekStart ? new Date(weekStart) : getMonday(new Date());
    const end = new Date(start.getTime() + 7 * 86400000);

    // Get recurring availability
    const slots = await prisma.availabilitySlot.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }] });

    // Get overrides for this week
    const overrides = await prisma.availabilityOverride.findMany({
      where: { date: { gte: start, lt: end } },
    });

    // Get booked classes for this week
    const bookedClasses = await prisma.classSession.findMany({
      where: {
        startTime: { gte: start, lt: end },
        cancelled: false,
      },
      select: { startTime: true, endTime: true },
    });

    // Build open 1-hour slots
    const openSlots = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + d * 86400000);
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      // Check for override on this date
      const override = overrides.find((o) => o.date.toISOString().split('T')[0] === dateStr);

      let daySlots = [];
      if (override) {
        if (!override.available) continue; // Day off
        if (override.startHour != null && override.endHour != null) {
          daySlots = [{ startHour: override.startHour, startMin: override.startMin || 0, endHour: override.endHour, endMin: override.endMin || 0 }];
        }
      } else {
        daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
      }

      // Generate 1-hour slots within each availability window
      for (const slot of daySlots) {
        const slotStartMin = slot.startHour * 60 + (slot.startMin || 0);
        const slotEndMin = slot.endHour * 60 + (slot.endMin || 0);

        for (let min = slotStartMin; min + 60 <= slotEndMin; min += 60) {
          const hour = Math.floor(min / 60);
          const minute = min % 60;
          const slotStart = new Date(date);
          slotStart.setUTCHours(hour, minute, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + 3600000);

          // Check if this slot overlaps with any booked class
          const isBooked = bookedClasses.some((cls) => {
            return slotStart < new Date(cls.endTime) && slotEnd > new Date(cls.startTime);
          });

          if (!isBooked && slotStart > new Date()) {
            openSlots.push({
              date: dateStr,
              dayOfWeek,
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
            });
          }
        }
      }
    }

    res.json({ openSlots });
  } catch (error) {
    next(error);
  }
});

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// --- Admin List (sheikh-only) ---
router.get('/admins', requireAdmin, async (req, res, next) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin', deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ admins });
  } catch (error) {
    next(error);
  }
});

// --- Audit Logs (sheikh-only) ---
router.get('/audit-logs', requireAdmin, validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// --- Class Logs (per-class per-student: what we covered, what's next) ---

// List all class logs for a student, joined with the class they refer to.
router.get('/students/:id/class-logs', async (req, res, next) => {
  try {
    await requireStudentAccess(req.user, req.params.id, prisma);
    const logs = await prisma.classLog.findMany({
      where: { studentId: req.params.id },
      include: {
        classSession: {
          select: { id: true, title: true, titleAr: true, startTime: true, endTime: true, cancelled: true },
        },
      },
      orderBy: { classSession: { startTime: 'desc' } },
    });
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

// Upsert a single class log. One per (classSessionId, studentId).
router.put(
  '/class-logs/:classSessionId/:studentId',
  validate(classLogSchema),
  async (req, res, next) => {
    try {
      const { classSessionId, studentId } = req.params;
      const { summary, homework, nextSteps, adminNotes, visibility } = req.body;

      // The teacher writing this log must actually have access to both
      // the class AND the student. Sheikh bypasses both checks.
      await requireClassAccess(req.user, classSessionId, prisma);
      await requireStudentAccess(req.user, studentId, prisma);

      // Sanity: the class and the student must actually be linked.
      const assignment = await prisma.classAssignment.findUnique({
        where: { classSessionId_studentId: { classSessionId, studentId } },
      });
      if (!assignment) {
        return res.status(404).json({ error: t('schedule.studentNotAssigned', getLang(req)) });
      }

      const log = await prisma.classLog.upsert({
        where: { classSessionId_studentId: { classSessionId, studentId } },
        create: {
          classSessionId,
          studentId,
          authorId: req.user.id,
          summary,
          homework,
          nextSteps,
          adminNotes,
          visibility,
        },
        update: {
          summary,
          homework,
          nextSteps,
          adminNotes,
          visibility,
          authorId: req.user.id,
        },
      });

      auditLog('CLASS_LOG_UPDATED', {
        classLogId: log.id,
        classSessionId,
        studentId,
        adminId: req.user.id,
      });

      res.json({ log });
    } catch (error) {
      next(error);
    }
  }
);

// --- Payments ---

router.get('/students/:id/payments', async (req, res, next) => {
  try {
    await requireStudentAccess(req.user, req.params.id, prisma);
    const payments = await prisma.payment.findMany({
      where: { studentId: req.params.id },
      orderBy: { paidAt: 'desc' },
    });
    // Running total by currency (can't just sum. student may have paid in EGP + USD).
    const totals = payments.reduce((acc, p) => {
      acc[p.currency] = (acc[p.currency] || 0) + p.amount;
      return acc;
    }, {});
    res.json({ payments, totals });
  } catch (error) {
    next(error);
  }
});

router.post('/students/:id/payments', validate(paymentSchema), async (req, res, next) => {
  try {
    await requireStudentAccess(req.user, req.params.id, prisma);
    const { amount, currency, period, paidAt, notes } = req.body;

    // Make sure the student actually exists (avoids orphan payments).
    const student = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!student) {
      return res.status(404).json({ error: t('student.notFound', getLang(req)) });
    }

    const payment = await prisma.payment.create({
      data: {
        studentId: req.params.id,
        authorId: req.user.id,
        amount,
        currency,
        period,
        paidAt: new Date(paidAt),
        notes: notes || null,
      },
    });

    auditLog('PAYMENT_CREATED', {
      paymentId: payment.id,
      studentId: req.params.id,
      amount,
      currency,
      adminId: req.user.id,
    });

    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
});

router.put('/payments/:id', validate(paymentUpdateSchema), async (req, res, next) => {
  try {
    // Look up the payment's studentId so we can scope-check before update.
    const existing = await prisma.payment.findUnique({
      where: { id: req.params.id },
      select: { studentId: true },
    });
    if (!existing) return res.status(404).json({ error: t('payment.notFound', getLang(req)) });
    await requireStudentAccess(req.user, existing.studentId, prisma);

    const updates = { ...req.body };
    if (updates.paidAt) updates.paidAt = new Date(updates.paidAt);

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: updates,
    });

    auditLog('PAYMENT_UPDATED', {
      paymentId: payment.id,
      studentId: payment.studentId,
      adminId: req.user.id,
    });

    res.json({ payment });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: t('payment.notFound', getLang(req)) });
    }
    next(error);
  }
});

router.delete('/payments/:id', async (req, res, next) => {
  try {
    const existing = await prisma.payment.findUnique({
      where: { id: req.params.id },
      select: { studentId: true },
    });
    if (!existing) return res.status(404).json({ error: t('payment.notFound', getLang(req)) });
    await requireStudentAccess(req.user, existing.studentId, prisma);

    const payment = await prisma.payment.delete({ where: { id: req.params.id } });
    auditLog('PAYMENT_DELETED', {
      paymentId: req.params.id,
      studentId: payment.studentId,
      adminId: req.user.id,
    });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: t('payment.notFound', getLang(req)) });
    }
    next(error);
  }
});

// --- CSV Exports ---

function formatMoney(minorUnits) {
  return (minorUnits / 100).toFixed(2);
}

// Per-student bundle. one CSV with two sections (class logs + payments).
router.get('/students/:id/export.csv', async (req, res, next) => {
  try {
    await requireStudentAccess(req.user, req.params.id, prisma);
    const student = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (!student) return res.status(404).json({ error: t('student.notFound', getLang(req)) });

    const [logs, payments] = await Promise.all([
      prisma.classLog.findMany({
        where: { studentId: student.id },
        include: {
          classSession: { select: { title: true, startTime: true } },
        },
        orderBy: { classSession: { startTime: 'desc' } },
      }),
      prisma.payment.findMany({
        where: { studentId: student.id },
        orderBy: { paidAt: 'desc' },
      }),
    ]);

    const logsCsv = toCsv(logs, [
      { label: 'Date', get: (r) => new Date(r.classSession.startTime).toISOString() },
      { label: 'Class', get: (r) => r.classSession.title },
      { label: 'Summary', key: 'summary' },
      { label: 'Next Steps', key: 'nextSteps' },
    ]);

    const paymentsCsv = toCsv(payments, [
      { label: 'Date', get: (r) => new Date(r.paidAt).toISOString() },
      { label: 'Period', key: 'period' },
      { label: 'Amount', get: (r) => formatMoney(r.amount) },
      { label: 'Currency', key: 'currency' },
      { label: 'Notes', key: 'notes' },
    ]);

    // Stitched together with labeled section headers so a single download
    // gives the admin everything they need for one student in one file.
    const combined =
      `Student,${student.firstName} ${student.lastName},${student.email}\n\n` +
      `# Class Logs\n${logsCsv}\n` +
      `# Payments\n${paymentsCsv}`;

    const filename = `daris-${student.firstName}-${student.lastName}.csv`.replace(/\s+/g, '-');
    sendCsv(res, filename, combined);
  } catch (error) {
    next(error);
  }
});

// All payments across all students. for tax/reconciliation. Sheikh-only;
// teachers don't see other teachers' students' payments.
router.get('/export/payments.csv', requireAdmin, async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
    const csv = toCsv(payments, [
      { label: 'Date', get: (r) => new Date(r.paidAt).toISOString() },
      { label: 'Student', get: (r) => `${r.student.firstName} ${r.student.lastName}` },
      { label: 'Email', get: (r) => r.student.email },
      { label: 'Period', key: 'period' },
      { label: 'Amount', get: (r) => formatMoney(r.amount) },
      { label: 'Currency', key: 'currency' },
      { label: 'Notes', key: 'notes' },
    ]);
    sendCsv(res, 'daris-payments.csv', csv);
  } catch (error) {
    next(error);
  }
});

// All class logs across all students. Sheikh-only.
router.get('/export/class-logs.csv', requireAdmin, async (req, res, next) => {
  try {
    const logs = await prisma.classLog.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        classSession: { select: { title: true, startTime: true } },
      },
      orderBy: { classSession: { startTime: 'desc' } },
    });
    const csv = toCsv(logs, [
      { label: 'Date', get: (r) => new Date(r.classSession.startTime).toISOString() },
      { label: 'Class', get: (r) => r.classSession.title },
      { label: 'Student', get: (r) => `${r.student.firstName} ${r.student.lastName}` },
      { label: 'Email', get: (r) => r.student.email },
      { label: 'Summary', key: 'summary' },
      { label: 'Next Steps', key: 'nextSteps' },
    ]);
    sendCsv(res, 'daris-class-logs.csv', csv);
  } catch (error) {
    next(error);
  }
});

export default router;
