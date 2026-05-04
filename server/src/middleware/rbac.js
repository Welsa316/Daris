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
 * calendar). The actual data scoping happens inside the route handler
 * via `scopingService.scopedStudentFilter` and `scopedClassFilter`.
 * Sheikh's filter is empty (sees everything); teachers' filter narrows
 * to their assigned students + own creations.
 */
export const requireAdminOrTeacher = requireRole('admin', 'teacher');

/**
 * Convenience middleware for enrolled students
 */
export const requireEnrolled = requireRole('enrolled_student');

/**
 * Convenience middleware for admin or enrolled students
 */
export const requireAuthenticated = requireRole('admin', 'teacher', 'enrolled_student', 'pending', 'pending_review');

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
