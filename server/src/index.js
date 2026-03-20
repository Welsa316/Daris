import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, isProd } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { securityHeaders, parameterPollution, removePoweredBy, forceHttps } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { cleanExpiredSessions } from './services/tokenService.js';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import publicRoutes from './routes/public.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// --- Trust proxy (for rate limiting behind reverse proxy) ---
app.set('trust proxy', 1);

// --- Security middleware ---
app.use(removePoweredBy);
if (isProd) app.use(forceHttps);
app.use(securityHeaders);
app.use(parameterPollution);

// --- CORS (only needed if frontend is on a different domain) ---
if (env.FRONTEND_URL) {
  app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Accept-Language'],
  }));
}

// --- Body parsing ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// --- General rate limiting ---
app.use('/api', generalLimiter);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', publicRoutes);

// --- Serve Vue frontend in production ---
const frontendDist = path.resolve(__dirname, '../../dist');
app.use(express.static(frontendDist));

// SPA fallback: any non-API route serves index.html
app.get(/^\/(?!api).*/, (req, res, next) => {
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next(); // If dist doesn't exist, fall through to 404
  });
});

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Session cleanup (every hour) ---
setInterval(async () => {
  try {
    const cleaned = await cleanExpiredSessions();
    if (cleaned > 0) {
      logger.info(`Cleaned ${cleaned} expired sessions`);
    }
  } catch (error) {
    logger.error('Session cleanup failed', { error: error.message });
  }
}, 60 * 60 * 1000);

// --- Start server ---
async function start() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`Daris server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

start().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});

// --- Graceful shutdown ---
async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
