/**
 * Multi-teacher management routes.
 *
 * Two access tiers are exposed here:
 *
 *   - Sheikh-only ("/teachers", "/teachers/:id/...") for managing teachers,
 *     assigning students, and changing roles. Mounted with `requireAdmin`.
 *
 *   - Admin-or-teacher ("/teachers/directory") read-only listing visible
 *     to teachers too so they can see who else is on the team. Mounted
 *     with the same global `requireAdminOrTeacher` middleware as the
 *     rest of the admin surface.
 *
 * Phase C scope: this file ships the backend half. The Sheikh's UI for
 * promoting + assigning lives in the AdminDashboard (Phase C frontend).
 * Teacher's own dashboard surfaces (My Classes, scoped Students tab,
 * teachers directory rendering) are Phase E.
 */

import { Router } from 'express';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../config/database.js';
import { auditLog } from '../utils/logger.js';
import { t, getLang } from '../utils/i18n.js';
import {
  teacherStudentsSchema,
  roleChangeSchema,
} from '../validators/adminSchemas.js';

const router = Router();

// All routes here require auth + at least teacher role. Sheikh-only routes
// add `requireAdmin` per-route.
router.use(authenticate, verifyTokenVersion, requireAdminOrTeacher);

// --- Read-only directory (admin or teacher) ---
//
// Returns every active teacher + every active sheikh-admin so the
// teachers directory in the dashboard has something to render. No PII
// beyond name + role + counts. Teachers don't get to see other
// teachers' students or schedules through this surface.
router.get('/directory', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'teacher'] },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        // Count assigned students. Admins generally don't have rows here;
        // they're scoped globally. Teachers may have many.
        _count: { select: { taughtStudents: true } },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });

    const directory = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      joinedAt: u.createdAt,
      studentCount: u._count.taughtStudents,
    }));

    res.json({ teachers: directory });
  } catch (error) {
    next(error);
  }
});

// --- Sheikh-only management ---

// Full teacher list with management metadata: emails, last-login, full
// student roster preview. Used by the Teachers tab.
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher', deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        lastLoginAt: true,
        taughtStudents: {
          select: {
            id: true,
            assignedAt: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ teachers });
  } catch (error) {
    next(error);
  }
});

// Replace-semantics: the body's studentIds list becomes the teacher's
// full assigned-students set. Diffs against the existing set and applies
// adds + removes atomically.
router.put(
  '/:id/students',
  requireAdmin,
  validate(teacherStudentsSchema),
  async (req, res, next) => {
    try {
      const lang = getLang(req);
      const teacherId = req.params.id;
      const { studentIds } = req.body;

      // Sanity: target must be a real teacher (not the sheikh, not a
      // suspended user). Prevents accidentally assigning students to the
      // wrong account via a misclick or stale dashboard state.
      const teacher = await prisma.user.findFirst({
        where: { id: teacherId, role: 'teacher', deletedAt: null },
        select: { id: true },
      });
      if (!teacher) {
        return res.status(404).json({ error: t('error.notFound', lang) });
      }

      // Verify every studentId actually exists and is enrolled. Refuses
      // to silently drop bogus ids on the floor.
      const existingStudents = await prisma.user.findMany({
        where: {
          id: { in: studentIds },
          role: 'enrolled_student',
          deletedAt: null,
        },
        select: { id: true },
      });
      if (existingStudents.length !== studentIds.length) {
        return res.status(400).json({
          error: 'One or more studentIds do not refer to an enrolled student',
        });
      }

      // Diff in a transaction so the assignments table never reflects a
      // half-applied state if a concurrent request changes things mid-flight.
      const desired = new Set(studentIds);
      const result = await prisma.$transaction(async (tx) => {
        const current = await tx.teacherStudent.findMany({
          where: { teacherId },
          select: { studentId: true },
        });
        const currentSet = new Set(current.map((r) => r.studentId));

        const toAdd = [...desired].filter((sid) => !currentSet.has(sid));
        const toRemove = [...currentSet].filter((sid) => !desired.has(sid));

        if (toRemove.length) {
          await tx.teacherStudent.deleteMany({
            where: { teacherId, studentId: { in: toRemove } },
          });
        }
        if (toAdd.length) {
          await tx.teacherStudent.createMany({
            data: toAdd.map((studentId) => ({
              teacherId,
              studentId,
              assignedByAdminId: req.user.id,
            })),
          });
        }

        return { added: toAdd.length, removed: toRemove.length, total: desired.size };
      });

      auditLog('TEACHER_STUDENTS_UPDATED', {
        teacherId,
        adminId: req.user.id,
        ...result,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Change a user's role. Used to promote (enrolled_student → teacher,
// teacher → admin) or demote (teacher → enrolled_student, etc.).
//
// Mirrors the logic in scripts/set-user-role.js with two additions:
//   - When demoting away from teacher, we cascade-delete their
//     TeacherStudent rows so orphaned assignments don't accumulate.
//   - The sheikh cannot demote themselves to a non-admin role (avoids
//     a single-admin lockout).
router.post(
  '/:id/role',
  requireAdmin,
  validate(roleChangeSchema),
  async (req, res, next) => {
    try {
      const lang = getLang(req);
      const targetId = req.params.id;
      const { role } = req.body;

      const target = await prisma.user.findFirst({
        where: { id: targetId, deletedAt: null },
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

      if (!target) {
        return res.status(404).json({ error: t('error.notFound', lang) });
      }

      if (target.role === role) {
        return res.json({
          message: 'No change',
          user: { id: target.id, role: target.role },
        });
      }

      // Lockout guard: refuse to demote the last remaining sheikh.
      if (target.role === 'admin' && role !== 'admin') {
        const otherAdmins = await prisma.user.count({
          where: {
            role: 'admin',
            deletedAt: null,
            id: { not: target.id },
          },
        });
        if (otherAdmins === 0) {
          return res.status(400).json({
            error: 'Cannot demote the only remaining admin. Promote another user to admin first.',
          });
        }
      }

      // Self-demotion guard: if the requester is the same person AND
      // they're moving themselves out of admin, refuse.
      if (target.id === req.user.id && role !== 'admin') {
        return res.status(400).json({
          error: 'You cannot change your own role away from admin. Have another admin do it.',
        });
      }

      // Promotion target requires verified email.
      if ((role === 'admin' || role === 'teacher') && !target.emailVerified) {
        return res.status(400).json({
          error: 'Cannot promote a user whose email has not been verified.',
        });
      }

      const wasTeacher = target.role === 'teacher';

      // Apply the role change in a transaction. If demoting away from
      // teacher, drop their TeacherStudent rows in the same transaction
      // so a stale teacherId can't be left dangling on student records.
      const updated = await prisma.$transaction(async (tx) => {
        if (wasTeacher && role !== 'teacher') {
          await tx.teacherStudent.deleteMany({ where: { teacherId: target.id } });
        }
        return tx.user.update({
          where: { id: target.id },
          data: {
            role,
            tokenVersion: { increment: 1 },
            ...(role !== 'suspended' && !target.enrolledAt
              ? { enrolledAt: new Date() }
              : {}),
          },
          select: { id: true, email: true, role: true, tokenVersion: true },
        });
      });

      auditLog(`ROLE_CHANGED:${target.role}_to_${role}`, {
        targetUserId: target.id,
        adminId: req.user.id,
      });

      res.json({
        message: 'Role updated',
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
