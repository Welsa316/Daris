import { Router } from 'express';
import { z } from 'zod';
import { getStudentCount } from '../services/enrollmentService.js';
import { verifyEmailConnection, sendContactFormEmail } from '../services/emailService.js';
import { contactFormLimiter } from '../middleware/rateLimiter.js';
import { logger, auditLog } from '../utils/logger.js';
import { t, getLang } from '../utils/i18n.js';

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

// --- Email Health Check (Resend API) ---
router.get('/health/email', async (req, res) => {
  const result = await verifyEmailConnection();
  res.status(result.ok ? 200 : 503).json({
    email: result.ok ? 'connected' : 'disconnected',
    domains: result.domains || undefined,
    error: result.error || undefined,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Public contact form. Posts visitor name + email + message; we relay
 * via Resend to env.CONTACT_INBOX with the visitor's address as
 * Reply-To. The honeypot field "company" is hidden in the rendered
 * form — real humans never fill it; bots usually do.
 *
 * Rate limited to 5/hr per IP (see contactFormLimiter). The endpoint
 * lives under /api which already has the generalLimiter (100/min)
 * stacked on top, so abusive scripts hit a wall fast.
 */
const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Invalid email').max(200),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  // Honeypot — must be empty. Bots filling generic form fields will
  // populate this and get a 200 back without anything actually sending.
  company: z.string().max(0).optional().or(z.literal('')),
  // Optional locale hint from the frontend so the inbox copy can show
  // which language the visitor was browsing in.
  lang: z.enum(['en', 'ar']).optional(),
});

router.post('/contact', contactFormLimiter, async (req, res) => {
  const lang = getLang(req);
  const parsed = contactFormSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: t('error.invalidInput', lang) });
  }

  const { name, email, message, company, lang: bodyLang } = parsed.data;

  // Silent honeypot drop. Bots get 200 OK so they don't retry; the
  // sheikh's inbox stays clean. We log so we can see drop volume.
  if (company && company.length > 0) {
    logger.warn('Contact form honeypot tripped', {
      ip: req.ip,
      hasName: Boolean(name),
      hasEmail: Boolean(email),
    });
    return res.json({ ok: true });
  }

  try {
    await sendContactFormEmail({
      name,
      email,
      message,
      lang: bodyLang || lang,
      source: 'website',
    });
    auditLog('CONTACT_FORM_SENT', {
      ip: req.ip,
      email: email.substring(0, 3) + '***',
      messageLength: message.length,
    });
    return res.json({ ok: true });
  } catch (err) {
    logger.error('Contact form send failed', {
      ip: req.ip,
      error: err.message,
    });
    return res.status(502).json({ error: t('error.contactFormFailed', lang) });
  }
});

export default router;
