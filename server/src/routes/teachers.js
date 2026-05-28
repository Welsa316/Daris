/**
 * Multi-teacher endpoints.
 *
 * Read tiers:
 *   - Sheikh-only ("/teachers") full list with management metadata
 *     (emails, last-login, student rosters). Used by the Teachers tab
 *     and as the source list for the schedule form's teacher picker.
 *   - Admin-or-teacher ("/teachers/directory") read-only directory so
 *     teachers know who else is on the team.
 *
 * Write tiers (sheikh-only):
 *   - POST /teachers/promote — flip isTeacher=true on one or more
 *     enrolled students.
 *   - POST /teachers/demote — flip isTeacher=false and cascade-delete
 *     this user's TeacherStudent rows so orphan assignments don't
 *     accumulate. The user keeps their student-side data (classes
 *     they attend); they just lose teacher capability.
 *   - PUT /students/:id/teachers — (in admin.js) replace the student's
 *     full taught-by set. Same idempotent diff semantics.
 *
 * Owner CLI scripts still work as a backup but the dashboard is now
 * the primary surface.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../config/database.js';
import { auditLog } from '../utils/logger.js';
import { t, getLang } from '../utils/i18n.js';

const router = Router();

// All routes here require auth + at least teacher capability (or sheikh).
// Sheikh-only routes add `requireAdmin` per-route.
router.use(authenticate, verifyTokenVersion, requireAdminOrTeacher);

// --- Read-only directory (admin or teacher) ---
//
// Returns every active teacher (isTeacher=true) + every active sheikh
// so the teachers directory has something to render. No PII beyond
// name + role.
//
// Aggregate `studentCount` is included ONLY for sheikh viewers. For
// non-admin (teacher) viewers it's omitted, because seeing how many
// students each other staff member is assigned to lets a teacher
// count back-of-the-envelope how many students they DON'T see —
// effectively leaking that other students exist. The Teachers tab
// is hidden from teachers in the dashboard anyway, but we strip the
// count here too so a direct API hit can't bypass the UI gate.
router.get('/directory', async (req, res, next) => {
  try {
    const isSheikh = req.user.role === 'admin';

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { isTeacher: true },
        ],
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        isTeacher: true,
        createdAt: true,
        ...(isSheikh ? { _count: { select: { taughtStudents: true } } } : {}),
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });

    const directory = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      // The frontend renders sheikh as "admin" and everyone else as
      // "teacher" regardless of their backing UserRole. Roles like
      // enrolled_student + isTeacher=true are still teachers in the
      // directory's eyes.
      role: u.role === 'admin' ? 'admin' : 'teacher',
      joinedAt: u.createdAt,
      ...(isSheikh ? { studentCount: u._count.taughtStudents } : {}),
    }));

    res.json({ teachers: directory });
  } catch (error) {
    next(error);
  }
});

// --- Sheikh-only read ---

// Full teacher list with management metadata: emails, last-login, full
// student roster preview. Used by the (sheikh-managed) Teachers tab
// AND by the schedule form's teacher picker. Admins (the sheikh) are
// included here too — they're the implicit default teacher when a
// student has no explicit TeacherStudent rows. Each row carries an
// `isOwner` flag the frontend uses to render an "Owner" badge.
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { isTeacher: true },
          { role: 'admin' },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isTeacher: true,
        isStudent: true,
        createdAt: true,
        lastLoginAt: true,
        preferredLanguage: true,
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

    // Tag each row with `isOwner` so the frontend can render the
    // Owner badge on admin rows + sort them to the top. Admins shouldn't
    // ever be treated as "regular" teachers (no demote button, no
    // promote candidacy) so the boolean is the cleanest plumbing.
    const annotated = teachers.map((t) => ({ ...t, isOwner: t.role === 'admin' }));
    annotated.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json({ teachers: annotated });
  } catch (error) {
    next(error);
  }
});

// --- Sheikh-only writes: preferred email language ---

const preferredLanguageSchema = z.object({
  preferredLanguage: z.enum(['ar', 'en']),
});

// Update a teacher's (or sheikh's) preferred email language. The
// student-side equivalent lives on the student profile route — this
// is for the rows the Teachers tab shows. Without it, a teacher who
// got the wrong default at signup had no way to change which language
// their reminder / notification emails arrived in.
router.put(
  '/:id/preferred-language',
  requireAdmin,
  validate(preferredLanguageSchema),
  async (req, res, next) => {
    try {
      const lang = getLang(req);
      const { id } = req.params;
      const { preferredLanguage } = req.body;

      // Only allow editing rows that actually appear in the Teachers
      // tab (teachers + the sheikh). Anything else and we'd be exposing
      // a generic "edit any user" surface that doesn't belong here.
      const target = await prisma.user.findFirst({
        where: {
          id,
          deletedAt: null,
          OR: [{ isTeacher: true }, { role: 'admin' }],
        },
        select: { id: true },
      });
      if (!target) {
        return res.status(404).json({ error: t('error.notFound', lang) });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { preferredLanguage },
        select: { id: true, preferredLanguage: true },
      });

      auditLog('TEACHER_LANGUAGE_UPDATED', {
        teacherId: id,
        preferredLanguage,
        adminId: req.user.id,
      });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
);

// --- Sheikh-only writes: promote / demote ---

// Body validators. Both endpoints take a list of user ids to flip,
// capped at 100 per call so a runaway selection in the UI doesn't
// fan out into a huge transaction. The promote endpoint also accepts
// `pureTeacher: true` to make the user invisible to the students list
// (typical for hired teachers who don't take classes themselves).
const promoteSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
  pureTeacher: z.boolean().optional().default(false),
});
const userIdsSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
});

// Promote: set isTeacher=true on the listed users. Refuses unverified
// emails (consistent with the legacy CLI's check) and bumps tokenVersion
// so existing JWTs are invalidated; the next request from each user
// re-reads role + isTeacher from the DB and reflects the new capability.
router.post(
  '/promote',
  requireAdmin,
  validate(promoteSchema),
  async (req, res, next) => {
    try {
      const { userIds, pureTeacher } = req.body;

      // Resolve the users we'll touch. Skip ones that are already
      // teachers (idempotent) and refuse unverified emails so the
      // sheikh can't accidentally promote someone who hasn't proven
      // ownership of their account.
      const targets = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          deletedAt: null,
          role: { in: ['enrolled_student', 'admin'] },
        },
        select: {
          id: true,
          email: true,
          role: true,
          isTeacher: true,
          isStudent: true,
          emailVerified: true,
        },
      });

      const unverified = targets.filter((u) => !u.emailVerified);
      if (unverified.length > 0) {
        return res.status(400).json({
          error: 'Refusing to promote: one or more users have unverified emails',
          unverifiedIds: unverified.map((u) => u.id),
        });
      }

      const toUpdate = targets
        .filter((u) => !u.isTeacher && u.role !== 'admin')
        .map((u) => u.id);

      if (toUpdate.length === 0) {
        return res.json({ updated: 0 });
      }

      // pureTeacher flag flips isStudent=false in the same write so the
      // user disappears from the students list. They keep ClassAssignment
      // rows if any exist (we don't yank them out from under historical
      // class records); the sheikh can later restore is_student=true via
      // the demote flow if needed.
      await prisma.user.updateMany({
        where: { id: { in: toUpdate } },
        data: {
          isTeacher: true,
          ...(pureTeacher ? { isStudent: false } : {}),
          tokenVersion: { increment: 1 },
        },
      });

      auditLog('TEACHERS_PROMOTED', {
        adminId: req.user.id,
        userIds: toUpdate,
        count: toUpdate.length,
        pureTeacher: !!pureTeacher,
      });

      res.json({ updated: toUpdate.length, pureTeacher: !!pureTeacher });
    } catch (error) {
      next(error);
    }
  }
);

// Demote: set isTeacher=false on the listed users. Cascade-deletes
// their TeacherStudent rows in the same transaction so a stale
// teacherId can't be left dangling on student records. Authored
// classes are preserved (createdByAdminId stays).
router.post(
  '/demote',
  requireAdmin,
  validate(userIdsSchema),
  async (req, res, next) => {
    try {
      const lang = getLang(req);
      const { userIds } = req.body;

      // Refuse to demote any sheikh from the same call (would never
      // happen via the UI but defense in depth against a hand-crafted
      // payload). A real "remove admin" goes through a different path
      // that has the lockout guard.
      const targets = await prisma.user.findMany({
        where: { id: { in: userIds }, deletedAt: null },
        select: { id: true, role: true, isTeacher: true, isStudent: true },
      });

      const sheikhs = targets.filter((u) => u.role === 'admin');
      if (sheikhs.length > 0) {
        return res.status(400).json({
          error: 'Cannot demote a sheikh via this endpoint. Use set-user-role.js for role changes.',
        });
      }

      const toUpdate = targets.filter((u) => u.isTeacher);
      const toUpdateIds = toUpdate.map((u) => u.id);

      if (toUpdateIds.length === 0) {
        return res.json({ updated: 0 });
      }

      // A pure teacher (isStudent=false + isTeacher=true) being demoted
      // would otherwise become invisible: not in students list, not in
      // teachers list, no way to find them again from the dashboard.
      // Auto-restore isStudent=true on demote so they're at least
      // findable. The sheikh can suspend them separately if needed.
      const restoreStudentIds = toUpdate
        .filter((u) => !u.isStudent)
        .map((u) => u.id);

      // Cascade in a transaction so the assignments table can never
      // briefly reference a user who no longer has teacher capability.
      const result = await prisma.$transaction(async (tx) => {
        const removedAssignments = await tx.teacherStudent.deleteMany({
          where: { teacherId: { in: toUpdateIds } },
        });
        await tx.user.updateMany({
          where: { id: { in: toUpdateIds } },
          data: { isTeacher: false, tokenVersion: { increment: 1 } },
        });
        if (restoreStudentIds.length > 0) {
          await tx.user.updateMany({
            where: { id: { in: restoreStudentIds } },
            data: { isStudent: true },
          });
        }
        return {
          updated: toUpdateIds.length,
          removedAssignments: removedAssignments.count,
          restoredAsStudents: restoreStudentIds.length,
        };
      });

      auditLog('TEACHERS_DEMOTED', {
        adminId: req.user.id,
        userIds: toUpdate,
        ...result,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
