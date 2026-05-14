import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from './emailService.js';

/**
 * Email notifications for new chat messages. In-dashboard polling is fine
 * for users who are already on the dashboard, but teachers and sheikhs
 * who don't sit there all day need an out-of-band ping — otherwise a
 * student's message just sits unread until someone happens to log in.
 *
 * Recipient rules:
 *   - Student sends → notify every assigned teacher (which includes any
 *     sheikh assigned to them as a teacher). Sheikhs NOT assigned to
 *     this student are intentionally excluded — they observe the thread
 *     in-app for oversight but don't need an email for every message
 *     across the whole platform.
 *   - Teacher or sheikh sends → notify just the student. v1 keeps staff
 *     out of each other's inboxes; back-and-forth between a teacher and
 *     a sheikh doesn't need to page everyone.
 *
 * Debounce: at most one email per (recipient, conversation) per
 * NOTIFY_DEBOUNCE_MS. Implemented as an atomic "claim" against
 * `conversation_reads.last_notified_at` — a conditional updateMany that
 * succeeds iff the timestamp is null or older than the cutoff. Two
 * concurrent sends to the same recipient can both compute "eligible",
 * but only one will win the claim and send the email.
 *
 * Dispatch is fire-and-forget from the message POST handler; the API
 * response goes out before any email work happens, and every error is
 * caught so a Resend hiccup never reaches the client.
 */

const NOTIFY_DEBOUNCE_MS = 10 * 60 * 1000;
const PREVIEW_CHARS = 200;

export async function notifyNewMessage({ conversation, sender, body }) {
  try {
    const recipientIds = await pickRecipientIds(conversation, sender);
    if (recipientIds.length === 0) return;

    const recipients = await prisma.user.findMany({
      where: {
        id: { in: recipientIds },
        deletedAt: null,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredLanguage: true,
      },
    });
    if (recipients.length === 0) return;

    const senderName =
      `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Daris';

    await Promise.allSettled(
      recipients.map((recipient) =>
        notifyOne({ recipient, senderName, conversation, body }).catch((err) =>
          logger.error('messageNotification: send failed', {
            conversationId: conversation.id,
            recipientId: recipient.id,
            error: err.message,
          })
        )
      )
    );
  } catch (err) {
    logger.error('messageNotification: dispatch failed', {
      conversationId: conversation?.id,
      error: err.message,
    });
  }
}

async function pickRecipientIds(conversation, sender) {
  const senderIsStudent = sender.id === conversation.studentId;

  if (senderIsStudent) {
    // Only the assigned teachers (which can include a sheikh-as-teacher
    // row). A sheikh observing the platform for oversight doesn't get
    // an email for every student's message — that would be unusable.
    // They still see the message live in their Messages tab.
    const assigned = await prisma.teacherStudent.findMany({
      where: { studentId: conversation.studentId },
      select: { teacherId: true },
    });
    const ids = new Set(assigned.map((a) => a.teacherId));
    ids.delete(sender.id);
    return Array.from(ids);
  }

  // Staff (teacher or sheikh) sender → notify the student only. v1
  // intentionally doesn't fan out to other staff; that just creates inbox
  // noise for staff who are already watching the same thread.
  return [conversation.studentId];
}

async function notifyOne({ recipient, senderName, conversation, body }) {
  const claimed = await claimSlot(conversation.id, recipient.id);
  if (!claimed) return;

  const lang = recipient.preferredLanguage === 'en' ? 'en' : 'ar';
  // The recipient lands on the surface where their copy of this thread
  // actually lives. The student of a conversation reads it from the
  // StudentDashboard (/dashboard); everyone else (assigned teachers + the
  // sheikh) reads it from the Messages tab on /admin. A senior student
  // who is also a teacher still goes to /dashboard for their OWN thread
  // — they only see /admin for threads belonging to students they teach.
  const isStudentOfThread = recipient.id === conversation.studentId;
  const dashboardPath = isStudentOfThread ? '/dashboard' : '/admin';
  const dashboardUrl = env.FRONTEND_URL
    ? `${env.FRONTEND_URL}${dashboardPath}`
    : dashboardPath;

  const trimmed = body.trim();
  const preview =
    trimmed.length > PREVIEW_CHARS
      ? trimmed.slice(0, PREVIEW_CHARS).trimEnd() + '…'
      : trimmed;

  const subject =
    lang === 'ar'
      ? `دارس. رسالة جديدة من ${senderName}`
      : `Daris. New message from ${senderName}`;

  const heading =
    lang === 'ar'
      ? `رسالة جديدة من ${senderName}`
      : `New message from ${senderName}`;

  const ctaLabel = lang === 'ar' ? 'فتح المحادثة' : 'Open conversation';

  const trailer =
    lang === 'ar'
      ? 'يمكنك الرد من لوحة التحكم. لن نرسل رسالة أخرى لمدة عشر دقائق حتى لا نزعجك.'
      : "You can reply from your dashboard. We won't send another email about this thread for 10 minutes.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
      <h2 style="color: #1F4D3A;">${escapeHtml(heading)}</h2>
      <p style="background: #f5f1e8; padding: 12px 16px; border-radius: 6px; border-left: 3px solid #C8A951; white-space: pre-wrap; margin: 16px 0;">${escapeHtml(preview)}</p>
      <a href="${dashboardUrl}" style="display: inline-block; background: #1F4D3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        ${escapeHtml(ctaLabel)}
      </a>
      <p style="color: #999; font-size: 12px;">${escapeHtml(trailer)}</p>
    </div>
  `;

  try {
    await sendEmail({ to: recipient.email, subject, html });
    logger.info('messageNotification: sent', {
      conversationId: conversation.id,
      recipientId: recipient.id,
    });
  } catch (err) {
    // The slot is already claimed and we don't unclaim on failure. A
    // failed Resend call means this recipient won't get another email
    // for the debounce window — that's worse than retrying, but better
    // than the alternative (unclaim + duplicate emails on the next send
    // 30 seconds later). v1 prefers under-deliver to over-deliver.
    logger.error('messageNotification: email send failed', {
      conversationId: conversation.id,
      recipientId: recipient.id,
      error: err.message,
    });
  }
}

/**
 * Atomically claim the per-(conversation, recipient) notification slot.
 * Returns true iff this caller won the claim — i.e. the recipient was
 * either never notified about this conversation or was last notified
 * before the debounce cutoff.
 *
 * Step 1 ensures a ConversationRead row exists (lazy-created with
 * lastReadAt=epoch so creating a row from the notification path doesn't
 * accidentally mark unread messages as read for a recipient who hasn't
 * opened the thread yet).
 *
 * Step 2 is a conditional updateMany that flips last_notified_at to now
 * iff it's still null or older than the cutoff. updateMany returns the
 * affected row count, so count===1 means we won.
 */
async function claimSlot(conversationId, userId) {
  await prisma.conversationRead.upsert({
    where: { conversationId_userId: { conversationId, userId } },
    update: {},
    create: {
      conversationId,
      userId,
      lastReadAt: new Date(0),
    },
  });

  const cutoff = new Date(Date.now() - NOTIFY_DEBOUNCE_MS);
  const result = await prisma.conversationRead.updateMany({
    where: {
      conversationId,
      userId,
      OR: [{ lastNotifiedAt: null }, { lastNotifiedAt: { lt: cutoff } }],
    },
    data: { lastNotifiedAt: new Date() },
  });
  return result.count === 1;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
