import { env, isDev } from '../config/env.js';
import { logger } from '../utils/logger.js';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * Send a WhatsApp message via Meta Cloud API
 */
async function sendWhatsApp({ to, text }) {
  if (!env.WHATSAPP_ENABLED) return;

  // Normalize phone number: strip +, spaces, dashes
  const phone = to.replace(/[\s+\-()]/g, '');

  if (!phone) return;

  if (isDev && (!env.WHATSAPP_API_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID)) {
    logger.info(`WHATSAPP TO: ${phone} | MESSAGE: ${text}`);
    return;
  }

  try {
    const res = await fetch(
      `${GRAPH_API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: text },
        }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      logger.error('WhatsApp API error', { status: res.status, error });
      return;
    }

    logger.info(`WhatsApp sent to ${phone.substring(0, 5)}***`);
  } catch (error) {
    logger.error('Failed to send WhatsApp', { error: error.message });
  }
}

// --- Notification Templates ---

export async function sendNewEnrollmentWhatsApp(studentName, country, enrollmentMessage) {
  const msg = enrollmentMessage
    ? `📩 New enrollment request\n\nName: ${studentName}\nCountry: ${country || 'N/A'}\nMessage: ${enrollmentMessage}\n\nReview at: ${env.FRONTEND_URL}/admin/enrollments`
    : `📩 New enrollment request\n\nName: ${studentName}\nCountry: ${country || 'N/A'}\n\nReview at: ${env.FRONTEND_URL}/admin/enrollments`;

  await sendWhatsApp({ to: env.WHATSAPP_ADMIN_PHONE, text: msg });
}

export async function sendEnrollmentApprovedWhatsApp(phone, firstName, message, lang = 'en') {
  if (!phone) return;

  const text = lang === 'ar'
    ? `مرحباً ${firstName}! ✅\n\nتمت الموافقة على طلب تسجيلك في دارس. يمكنك الآن تسجيل الدخول.\n${message ? `\nرسالة: ${message}` : ''}\n\n${env.FRONTEND_URL}/login`
    : `Hi ${firstName}! ✅\n\nYour enrollment at Daris has been approved. You can now log in.\n${message ? `\nMessage: ${message}` : ''}\n\n${env.FRONTEND_URL}/login`;

  await sendWhatsApp({ to: phone, text });
}

export async function sendEnrollmentRejectedWhatsApp(phone, firstName, message, lang = 'en') {
  if (!phone) return;

  const text = lang === 'ar'
    ? `عزيزي ${firstName},\n\nنأسف لإبلاغك بأن طلب تسجيلك لم تتم الموافقة عليه في هذا الوقت.\n${message ? `\nالسبب: ${message}` : ''}\n\nيمكنك إعادة التقديم بعد 30 يوماً.`
    : `Dear ${firstName},\n\nWe regret to inform you that your enrollment was not approved at this time.\n${message ? `\nReason: ${message}` : ''}\n\nYou may re-apply after 30 days.`;

  await sendWhatsApp({ to: phone, text });
}
