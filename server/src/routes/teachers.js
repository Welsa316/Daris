/**
 * Multi-teacher read endpoints.
 *
 * Two access tiers are exposed here, both READ-ONLY:
 *
 *   - Sheikh-only ("/teachers") full list with management metadata
 *     (emails, last-login, student rosters). Used by the Teachers tab.
 *
 *   - Admin-or-teacher ("/teachers/directory") read-only directory so
 *     teachers know who else is on the team.
 *
 * Promotion, demotion, and student-to-teacher assignment are intentionally
 * NOT exposed as HTTP routes. The site owner manages them out-of-band:
 *
 *   - Roles via `node server/scripts/set-user-role.js <email> <role>`
 *   - Assignments via `node server/scripts/assign-students-to-teacher.js`
 *   - Or directly via Prisma Studio / SQL
 *
 * The sheikh (admin role) can VIEW teachers and rosters but cannot mutate
 * either from the dashboard. This is a deliberate product choice: the
 * owner wants single-source control over who teaches and who they teach.
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
// student roster preview. Used by the (read-only) Teachers tab.
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
