import { Router } from 'express';
import { getStudentCount } from '../services/enrollmentService.js';
import { verifySmtpConnection } from '../services/emailService.js';

const router = Router();

// --- Student Count (cached, public) ---
let cachedCount = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

router.get('/student-count', async (req, res, next) => {
  try {
    const now = Date.now();
    if (cachedCount !== null && now - cacheTimestamp < CACHE_TTL_MS) {
      return res.json({ count: cachedCount });
    }

    const count = await getStudentCount();
    cachedCount = count;
    cacheTimestamp = now;

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// --- Health Check ---
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// --- Email SMTP Health Check ---
router.get('/health/email', async (req, res) => {
  const result = await verifySmtpConnection();
  res.status(result.ok ? 200 : 503).json({
    smtp: result.ok ? 'connected' : 'disconnected',
    error: result.error || undefined,
    timestamp: new Date().toISOString(),
  });
});

export default router;
