import helmet from 'helmet';
import hpp from 'hpp';
import { env, isProd } from '../config/env.js';

/**
 * Security headers via Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", env.FRONTEND_URL],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  noSniff: true,
  permissionsPolicy: {
    features: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  },
});

/**
 * HTTP parameter pollution protection
 */
export const parameterPollution = hpp();

/**
 * Remove X-Powered-By header
 */
export function removePoweredBy(req, res, next) {
  res.removeHeader('X-Powered-By');
  next();
}

/**
 * Force HTTPS in production
 */
export function forceHttps(req, res, next) {
  if (isProd && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}
