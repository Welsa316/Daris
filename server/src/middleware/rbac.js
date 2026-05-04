import { t, getLang } from '../utils/i18n.js';
import { auditLog } from '../utils/logger.js';

/**
 * Role-based access control middleware factory
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const lang = getLang(req);

    if (!req.user) {
      return res.status(401).json({ error: t('auth.unauthorized', lang) });
    }

    if (!allowedRoles.includes(req.user.role)) {
      auditLog('AUTHORIZATION_FAILURE', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.status(403).json({ error: t('auth.forbidden', lang) });
    }

    next();
  };
}

/**
 * Convenience middleware for admin-only routes (sheikh-level access).
 * Use this for endpoints only the sheikh should reach: managing teachers,
 * approving enrollments, settings, audit log, role changes.
 */
export const requireAdmin = requireRole('admin');

/**
 * Admin or scoped teacher. Use this for endpoints that BOTH the sheikh
 * and individual teachers should reach (students list, scheduling,
 * calendar). Teacher capability is now the `isTeacher` boolean on User,
 * not the deprecated `role='teacher'` enum value, so a senior student
 * with isTeacher=true ALSO passes this gate. Data scoping happens inside
 * the route handler via `scopingService.scopedStudentFilter` and
 * `scopedClassFilter`. Sheikh's filter is empty (sees everything);
 * teachers' filter narrows to their assigned students + own creations.
 *
 * Note: `verifyTokenVersion` must run before this middleware so the
 * `isTeacher` flag on req.user reflects the latest DB state. Routes
 * that mount this on a router where `authenticate` + `verifyTokenVersion`
 * have already been applied (the standard pattern in admin.js and
 * teachers.js) get the right value automatically.
 */
export function requireAdminOrTeacher(req, res, next) {
  const lang = getLang(req);

  if (!req.user) {
    return res.status(401).json({ error: t('auth.unauthorized', lang) });
  }

  const allowed = req.user.role === 'admin' || req.user.isTeacher === true;
  if (!allowed) {
    auditLog('AUTHORIZATION_FAILURE', {
      userId: req.user.id,
      role: req.user.role,
      isTeacher: req.user.isTeacher,
      requiredRoles: ['admin', 'isTeacher'],
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
    return res.status(403).json({ error: t('auth.forbidden', lang) });
  }
  next();
}

/**
 * Convenience middleware for enrolled students
 */
export const requireEnrolled = requireRole('enrolled_student');

/**
 * Convenience middleware for any authenticated, non-rejected user.
 * Includes ex-teachers (now role=enrolled_student + isTeacher=true) and
 * future dual-role accounts via the same enrolled_student bucket.
 */
export const requireAuthenticated = requireRole('admin', 'enrolled_student', 'pending', 'pending_review');

/**
 * IDOR protection: ensure the user can only access their own resources
 * Admins bypass this check
 */
export function requireOwnerOrAdmin(paramName = 'id') {
  return (req, res, next) => {
    const lang = getLang(req);

    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[paramName];
    if (resourceId !== req.user.id) {
      auditLog('IDOR_ATTEMPT', {
        userId: req.user.id,
        targetId: resourceId,
        path: req.originalUrl,
        ip: req.ip,
      });
      return res.status(403).json({ error: t('auth.forbidden', lang) });
    }

    next();
  };
}
