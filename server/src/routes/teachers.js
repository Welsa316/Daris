/**
 * Multi-teacher read endpoints.
 *
 *   - Sheikh-only ("/teachers") full list with management metadata
 *     (emails, last-login, student rosters). Used by the Teachers tab
 *     and as the source list for the schedule form's teacher picker.
 *   - Admin-or-teacher ("/teachers/directory") read-only directory so
 *     teachers know who else is on the team.
 *
 * Writes live elsewhere:
 *   - Sheikh assigns existing teachers to a student from the schedule
 *     form via `PUT /api/admin/students/:id/teachers` (in admin.js,
 *     near the rest of the student-centric endpoints).
 *   - Promote / demote a user is owner-only via the CLI scripts.
 *   - Bulk-assign by teacher email is owner-only via the CLI scripts.
 *
 * Why this split: who BECOMES a teacher is an owner decision (who is on
 * the staff). Once teachers exist, routing students to them is a sheikh
 * decision (day-to-day operations). Both writes go through the same
 * TeacherStudent table, just with different ergonomics and call sites.
 */

import { Router } from 'express';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/rbac.js';
import { prisma } from '../config/database.js';

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

// --- Sheikh-only read ---

// Full teacher list with management metadata: emails, last-login, full
// student roster preview. Used by the (read-only) Teachers tab AND by
// the schedule form's teacher picker.
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

export default router;
