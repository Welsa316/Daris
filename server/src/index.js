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
import { runClassReminderTick } from './services/classReminderJob.js';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import fs from 'node:fs';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import meetingRoutes from './routes/meeting.js';
import publicRoutes from './routes/public.js';
import { buildMetaHtml } from './seoMeta.js';

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
app.use('/api/meeting', meetingRoutes);
app.use('/api', publicRoutes);

// --- Serve Vue frontend in production ---
const frontendDist = path.resolve(__dirname, '../../dist');

// Hashed assets (Vite emits /assets/<name>-<hash>.<ext>) are content-addressed
// — cache them for a year. index.html changes on every deploy, so it must
// never be cached, otherwise a browser holding an old copy asks the server
// for asset filenames that no longer exist and the SPA fallback serves HTML
// in their place (MIME-type errors in the console).
app.use(
  express.static(frontendDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Missing asset files (stale cached index.html asking for old hashes) must
// 404 instead of falling through to the SPA, otherwise the browser tries to
// parse HTML as CSS/JS and the entire page breaks.
app.get('/assets/*', (req, res) => {
  res.status(404).type('text/plain').send('Not Found');
});

// Read index.html once at startup for SEO meta injection
let indexHtml = '';
try {
  indexHtml = fs.readFileSync(path.join(frontendDist, 'index.html'), 'utf-8');
} catch {
  // dist may not exist in dev — that's fine, fallback will 404
}

// SPA fallback with server-side SEO meta injection.
// For marketing routes (/, /about, /programs, /contact), inject route-specific
// <title>, <meta>, and JSON-LD into the HTML so crawlers see full SEO content
// without needing JavaScript execution.
app.get(/^\/(?!api).*/, (req, res, next) => {
  // Always fresh — never let the browser or a CDN cache this response.
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (!indexHtml) {
    return res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next();
    });
  }

  const metaHtml = buildMetaHtml(req.path);

  if (metaHtml) {
    // Inject route-specific meta right before </head>
    const injected = indexHtml.replace('</head>', `${metaHtml}\n  </head>`);
    res.type('html').send(injected);
  } else {
    // Non-marketing routes (auth, dashboard) — serve default HTML
    res.type('html').send(indexHtml);
  }
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

// --- Class reminders (every 5 min — sends 30-min and 24-h notices) ---
setInterval(() => {
  runClassReminderTick().catch((err) =>
    logger.error('Class reminder tick failed', { error: err.message })
  );
}, 5 * 60 * 1000);
// Also run once on boot so restarts don't create a 5-min gap.
runClassReminderTick().catch((err) =>
  logger.error('Initial class reminder tick failed', { error: err.message })
);

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
