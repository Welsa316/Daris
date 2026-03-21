import nodemailer from 'nodemailer';
import { env, isDev } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter;

function getTransporter() {
  if (!transporter) {
    if (isDev && (!env.SMTP_USER || !env.SMTP_PASS)) {
      // In development without SMTP credentials, log emails to console
      logger.info('Email service: No SMTP credentials, emails will be logged to console');
      return null;
    }
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const transport = getTransporter();
  if (!transport) {
    // Dev fallback: log to console
    logger.info(`EMAIL TO: ${to} | SUBJECT: ${subject}`);
    logger.debug(`EMAIL BODY: ${html}`);
    return;
  }

  try {
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to.substring(0, 3)}***`);
  } catch (error) {
    logger.error('Failed to send email', { error: error.message });
    throw error;
  }
}

// --- Email Templates ---

export async function sendVerificationEmail(email, token, lang = 'en') {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  const subject = lang === 'ar'
    ? 'دارس — تأكيد البريد الإلكتروني'
    : 'Daris — Verify Your Email';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
      <h2 style="color: #1F4D3A;">${lang === 'ar' ? 'مرحباً بك في دارس' : 'Welcome to Daris'}</h2>
      <p>${lang === 'ar'
        ? 'يرجى التحقق من بريدك الإلكتروني بالضغط على الزر أدناه:'
        : 'Please verify your email address by clicking the button below:'}</p>
      <a href="${verifyUrl}" style="display: inline-block; background: #1F4D3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        ${lang === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Verify Email'}
      </a>
      <p style="color: #666; font-size: 14px;">${lang === 'ar'
        ? 'ينتهي هذا الرابط خلال ٢٤ ساعة.'
        : 'This link expires in 24 hours.'}</p>
      <p style="color: #999; font-size: 12px;">${lang === 'ar'
        ? 'إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد.'
        : 'If you did not create an account, please ignore this email.'}</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email, token, lang = 'en') {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const subject = lang === 'ar'
    ? 'دارس — إعادة تعيين كلمة المرور'
    : 'Daris — Password Reset';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
      <h2 style="color: #1F4D3A;">${lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset'}</h2>
      <p>${lang === 'ar'
        ? 'اضغط على الزر أدناه لإعادة تعيين كلمة المرور:'
        : 'Click the button below to reset your password:'}</p>
      <a href="${resetUrl}" style="display: inline-block; background: #1F4D3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        ${lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
      </a>
      <p style="color: #666; font-size: 14px;">${lang === 'ar'
        ? 'ينتهي هذا الرابط خلال ساعة واحدة. يمكن استخدامه مرة واحدة فقط.'
        : 'This link expires in 1 hour and can only be used once.'}</p>
      <p style="color: #999; font-size: 12px;">${lang === 'ar'
        ? 'إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.'
        : 'If you did not request a password reset, please ignore this email.'}</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendEnrollmentApprovedEmail(email, firstName, message, lang = 'en') {
  const loginUrl = `${env.FRONTEND_URL}/login`;

  const subject = lang === 'ar'
    ? 'دارس — تمت الموافقة على تسجيلك!'
    : 'Daris — Your Enrollment is Approved!';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
      <h2 style="color: #1F4D3A;">${lang === 'ar' ? `مرحباً ${firstName}!` : `Welcome, ${firstName}!`}</h2>
      <p>${lang === 'ar'
        ? 'تمت الموافقة على طلب تسجيلك في دارس. يمكنك الآن تسجيل الدخول والوصول إلى لوحة الطالب.'
        : 'Your enrollment request at Daris has been approved. You can now log in and access your student dashboard.'}</p>
      ${message ? `<p style="background: #f5f1e8; padding: 12px; border-radius: 6px; border-left: 3px solid #C8A951;">${message}</p>` : ''}
      <a href="${loginUrl}" style="display: inline-block; background: #1F4D3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        ${lang === 'ar' ? 'تسجيل الدخول' : 'Log In'}
      </a>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendEnrollmentRejectedEmail(email, firstName, message, lang = 'en') {
  const subject = lang === 'ar'
    ? 'دارس — تحديث طلب التسجيل'
    : 'Daris — Enrollment Update';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
      <h2 style="color: #1F4D3A;">${lang === 'ar' ? `عزيزي ${firstName}` : `Dear ${firstName}`}</h2>
      <p>${lang === 'ar'
        ? 'نأسف لإبلاغك بأن طلب تسجيلك لم تتم الموافقة عليه في هذا الوقت.'
        : 'We regret to inform you that your enrollment request was not approved at this time.'}</p>
      ${message ? `<p style="background: #f5f1e8; padding: 12px; border-radius: 6px; border-left: 3px solid #C8A951;">${message}</p>` : ''}
      <p style="color: #666; font-size: 14px;">${lang === 'ar'
        ? 'يمكنك إعادة التقديم بعد ٣٠ يوماً أو التواصل معنا مباشرة.'
        : 'You may re-apply after 30 days or contact us directly.'}</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendAccountLockedEmail(email, lang = 'en') {
  const subject = lang === 'ar'
    ? 'دارس — تنبيه أمني'
    : 'Daris — Security Alert';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
      <h2 style="color: #1F4D3A;">${lang === 'ar' ? 'تنبيه أمني' : 'Security Alert'}</h2>
      <p>${lang === 'ar'
        ? 'تم قفل حسابك مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة. سيتم فتح الحساب تلقائياً بعد ٣٠ دقيقة.'
        : 'Your account has been temporarily locked due to multiple failed login attempts. It will automatically unlock after 30 minutes.'}</p>
      <p style="color: #666; font-size: 14px;">${lang === 'ar'
        ? 'إذا لم تكن أنت من حاول تسجيل الدخول، يرجى تغيير كلمة المرور فوراً.'
        : 'If this was not you, please change your password immediately.'}</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendClassCancelledEmail(email, firstName, classTitle, classDate, lang = 'en') {
  const subject = lang === 'ar'
    ? 'دارس — إلغاء حصة'
    : 'Daris — Class Cancelled';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
      <h2 style="color: #1F4D3A;">${lang === 'ar' ? 'تم إلغاء الحصة' : 'Class Cancelled'}</h2>
      <p>${lang === 'ar'
        ? `عزيزي ${firstName}، تم إلغاء الحصة التالية:`
        : `Dear ${firstName}, the following class has been cancelled:`}</p>
      <p style="background: #f5f1e8; padding: 12px; border-radius: 6px;">
        <strong>${classTitle}</strong><br/>
        ${classDate}
      </p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendNewEnrollmentNotification(studentName) {
  if (!env.FORMSPREE_ENDPOINT) {
    logger.warn('FORMSPREE_ENDPOINT not set — skipping admin enrollment notification');
    return;
  }

  const reviewUrl = env.FRONTEND_URL ? `${env.FRONTEND_URL}/admin` : '';

  const response = await fetch(env.FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      subject: 'Daris — New Enrollment Request',
      message: `A new student has registered and is awaiting your review:\n\nStudent: ${studentName}${reviewUrl ? `\n\nReview: ${reviewUrl}` : ''}`,
      _subject: 'Daris — New Enrollment Request',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Formspree error ${response.status}: ${text}`);
  }

  logger.info('Formspree enrollment notification sent');
}
