/**
 * Send a one-shot reminder email using the real production template.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx \
 *     node server/scripts/send-test-reminder.js
 *
 * Optional overrides (env vars):
 *   TEST_TO        recipient email           default: darislearn@gmail.com
 *   TEST_LABEL     "24hr" | "30min"          default: 24hr
 *   TEST_LANG      "en" | "ar"               default: en
 *   TEST_NAME      first name in greeting    default: Sheikh
 *   TEST_TITLE     class title               default: "Quran lesson with Walid"
 *   TEST_LINK      meeting link              default: https://meet.google.com/test-link-xyz
 *   TEST_TZ        IANA timezone             default: Africa/Cairo
 *   EMAIL_FROM     from header               default: Daris <noreply@daris.education>
 *
 * Why we stub the env values below:
 *   server/src/config/env.js validates the full env on import (DATABASE_URL,
 *   JWT_*, etc) and process.exit(1)'s if anything is missing. This script
 *   only needs the email-sending plumbing, so we set placeholder values for
 *   the database / JWT vars BEFORE importing the email service. The Resend
 *   key is the only one that has to be real.
 */

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is required. Grab it from Railway > Variables and run:');
  console.error('  RESEND_API_KEY=re_xxx node server/scripts/send-test-reminder.js');
  process.exit(1);
}

// Stub the env vars the script does NOT use so env.js validation passes.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://placeholder/placeholder';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'x'.repeat(32);
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'y'.repeat(32);
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'Daris <noreply@daris.education>';

const { sendClassReminderStudent } = await import('../src/services/emailService.js');

const TO     = process.env.TEST_TO    || 'darislearn@gmail.com';
const LABEL  = process.env.TEST_LABEL || '24hr';
const LANG   = process.env.TEST_LANG  || 'en';
const NAME   = process.env.TEST_NAME  || (LANG === 'ar' ? 'الشيخ' : 'Sheikh');
const TITLE  = process.env.TEST_TITLE || 'Quran lesson with Walid';
const LINK   = process.env.TEST_LINK  || 'https://meet.google.com/test-link-xyz';
const TZ     = process.env.TEST_TZ    || 'Africa/Cairo';

if (LABEL !== '24hr' && LABEL !== '30min') {
  console.error(`TEST_LABEL must be "24hr" or "30min" (got "${LABEL}")`);
  process.exit(1);
}

// Schedule the mock class for tomorrow (for 24hr) or 30 min from now (for 30min).
const offsetMs = LABEL === '24hr' ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
const startTime = new Date(Date.now() + offsetMs);
const endTime   = new Date(startTime.getTime() + 60 * 60 * 1000); // 1-hour class

const mockStudent = {
  id: 'test-student',
  email: TO,
  firstName: NAME,
  preferredLanguage: LANG,
};

const mockClass = {
  id: 'test-class',
  title: TITLE,
  startTime,
  endTime,
  timezone: TZ,
  meetingLink: LINK,
};

console.log(`Sending ${LABEL} reminder...`);
console.log(`  to:       ${TO}`);
console.log(`  language: ${LANG}`);
console.log(`  greeting: "${NAME}"`);
console.log(`  class:    "${TITLE}"`);
console.log(`  start:    ${startTime.toISOString()}`);
console.log(`  tz:       ${TZ}`);
console.log(`  link:     ${LINK}`);
console.log();

try {
  await sendClassReminderStudent(mockStudent, mockClass, LABEL);
  console.log(`✓ Sent. Check ${TO} in a moment.`);
} catch (err) {
  console.error('✗ Failed:', err.message);
  process.exit(1);
}
