import winston from 'winston';
import { env, isProd } from '../config/env.js';
import { prisma } from '../config/database.js';

const sanitize = winston.format((info) => {
  // Remove sensitive fields from logs
  const sensitiveKeys = ['password', 'token', 'refreshToken', 'accessToken', 'secret', 'authorization'];
  if (info.meta && typeof info.meta === 'object') {
    for (const key of sensitiveKeys) {
      if (key in info.meta) {
        info.meta[key] = '[REDACTED]';
      }
    }
  }
  return info;
});

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    sanitize(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isProd
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...rest }) => {
            const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
            return `${timestamp} [${level}]: ${message}${extra}`;
          })
        )
  ),
  transports: [
    new winston.transports.Console(),
    ...(isProd
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880, maxFiles: 5 }),
          new winston.transports.File({ filename: 'logs/combined.log', maxsize: 5242880, maxFiles: 5 }),
        ]
      : []),
  ],
});

// Audit logger for security events. Writes both to the application log
// (for ops) and to the audit_logs table — the latter is what the admin
// dashboard's Activity tab and "recent actions" stat read, so without
// the DB row those surfaces would always be empty.
export function auditLog(action, details = {}) {
  logger.info(`AUDIT: ${action}`, { audit: true, ...details });

  // Fire-and-forget: a failed audit write must never break the request
  // that triggered the action. The actor is whichever id the caller
  // passed — admin actions carry adminId, account actions carry userId.
  prisma.auditLog
    .create({
      data: {
        action,
        userId: details.adminId || details.userId || null,
        ipAddress: details.ip || details.ipAddress || null,
        details: Object.keys(details).length > 0 ? JSON.stringify(details) : null,
      },
    })
    .catch((err) => logger.error('auditLog persistence failed', { action, error: err.message }));
}
