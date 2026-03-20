import winston from 'winston';
import { env, isProd } from '../config/env.js';

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

// Audit logger for security events
export function auditLog(action, details = {}) {
  logger.info(`AUDIT: ${action}`, { audit: true, ...details });
}
