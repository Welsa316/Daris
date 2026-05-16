import { isProd } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { t, getLang } from '../utils/i18n.js';

/**
 * Global error handler. catches all unhandled errors
 * In production: returns generic error message
 * In development: includes error details
 */
export function errorHandler(err, req, res, _next) {
  const lang = getLang(req);

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: t('register.emailExists', lang) });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: t('error.notFound', lang) });
  }

  // Accept either `statusCode` or `status` — service-layer guards
  // (e.g. requireStudentAccess) set `status`, so without this an
  // intended 403/401 would fall through to a 500.
  const statusCode = err.statusCode || err.status || 500;
  const response = {
    error: isProd ? t('error.generic', lang) : err.message,
  };

  if (!isProd) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req, res) {
  const lang = getLang(req);
  res.status(404).json({ error: t('error.notFound', lang) });
}
