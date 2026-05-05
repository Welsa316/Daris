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
import { runGCalSyncTick, runGCalSweep } from './services/googleCalendarSyncJob.js';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import fs from 'node:fs';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import meetingRoutes from './routes/meeting.js';
import publicRoutes from './routes/public.js';
import teachersRoutes from './routes/teachers.js';
import googleCalendarRoutes from './routes/googleCalendar.js';
import { buildMetaHtml, pickLocaleFromHeader } from './seoMeta.js';

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
app.use('/api/admin/teachers', teachersRoutes);
app.use('/api/admin/google-calendar', googleCalendarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api', publicRoutes);

// --- Serve Vue frontend in production ---
const frontendDist = path.resolve(__dirname, '../../dist');

// Hashed assets (Vite emits /assets/<name>-<hash>.<ext>) are content-addressed,
// so cache them for a year. index.html changes on every deploy, so it must
// never be cached, otherwise a browser holding an old copy asks the server
// for asset filenames that no longer exist and the SPA fallback serves HTML
// in their place (MIME-type errors in the console).
//
// `index: false` is important: without it, express.static auto-serves
// dist/index.html for any directory-like request (including GET /), which
// would intercept `/` before our locale-aware 301 redirect below ever
// runs. With index disabled, `/` falls through to the BARE_MARKETING_PATHS
// handler, while asset files are still served as normal.
app.use(
  express.static(frontendDist, {
    index: false,
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

// Locale-aware 301 redirects for bare marketing paths. Old bookmarks and
// stale Google results that point at `/about` still work. they permanently
// redirect to `/en/about` (or `/ar/about` if the browser prefers Arabic).
// This is the single place where Accept-Language is consulted; once the
// user is on a locale-prefixed URL their locale is determined by the URL
// itself, not the header.
const BARE_MARKETING_PATHS = ['/', '/about', '/programs', '/faq', '/articles', '/contact'];
app.get(BARE_MARKETING_PATHS, (req, res) => {
  const locale = pickLocaleFromHeader(req.headers['accept-language']);
  const suffix = req.path === '/' ? '' : req.path;
  res.redirect(301, `/${locale}${suffix}`);
});

// Read index.html once at startup for SEO meta injection
let indexHtml = '';
try {
  indexHtml = fs.readFileSync(path.join(frontendDist, 'index.html'), 'utf-8');
} catch {
  // dist may not exist in dev. that's fine, fallback will 404
}

// Marker in dist/index.html that wraps the SSR-able meta tags. The SPA
// fallback below swaps this whole block out for route-specific meta on
// marketing routes so there are never duplicate <title>/OG tags in the
// response. Must exactly match the comments in public/../index.html.
const SSR_META_MARKER = /<!--\s*SSR-META-START[\s\S]*?SSR-META-END\s*-->/;

// SPA fallback with server-side SEO meta injection.
// For marketing routes (/en/*, /ar/*), replace the SSR-META marker block
// with route-specific <title>, <meta>, canonical, hreflang alternates,
// OG/Twitter, and JSON-LD so crawlers see full SEO content without
// needing JavaScript execution and without duplicate tags.
app.get(/^\/(?!api).*/, (req, res, next) => {
  // Always fresh. never let the browser or a CDN cache this response.
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (!indexHtml) {
    return res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next();
    });
  }

  const metaHtml = buildMetaHtml(req.path);

  if (metaHtml) {
    // Marketing route: replace the marker block with route-specific meta.
    // The regex is indentation-agnostic; `metaHtml.trim()` avoids doubling
    // the leading whitespace that buildMetaHtml already includes.
    const injected = indexHtml.replace(SSR_META_MARKER, metaHtml.trim());
    res.type('html').send(injected);
  } else {
    // Non-marketing route (auth, dashboard). Keep the minimal static
    // fallback from index.html. These paths are disallow'd in robots.txt
    // so they don't need per-route meta anyway.
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

// --- Class reminders (every 5 min. sends 30-min and 24-h notices) ---
setInterval(() => {
  runClassReminderTick().catch((err) =>
    logger.error('Class reminder tick failed', { error: err.message })
  );
}, 5 * 60 * 1000);
// Also run once on boot so restarts don't create a 5-min gap.
runClassReminderTick().catch((err) =>
  logger.error('Initial class reminder tick failed', { error: err.message })
);

// --- Google Calendar sync (every 60s). Drains GoogleCalendarSyncOp
// rows that need to be reflected on the admin's calendar (events
// created, updated, or cancelled by the dashboard). Atomic-claim
// based so a Railway rolling deploy never double-fires an op. ---
setInterval(() => {
  runGCalSyncTick().catch((err) =>
    logger.error('GCal sync tick failed', { error: err.message })
  );
}, 60 * 1000);
runGCalSyncTick().catch((err) =>
  logger.error('Initial GCal sync tick failed', { error: err.message })
);

// --- Convergent sync sweep (every 5 min). Catches classes that
// missed their original create op (legacy data, deploy-timing race,
// or an op that exhausted its retry budget). Cheap: one COUNT per
// active connection per tick, plus a few writes only when something
// is actually unsynced. Runs once on boot so deploys self-heal. ---
setInterval(() => {
  runGCalSweep().catch((err) =>
    logger.error('GCal sweep failed', { error: err.message })
  );
}, 5 * 60 * 1000);
runGCalSweep().catch((err) =>
  logger.error('Initial GCal sweep failed', { error: err.message })
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
