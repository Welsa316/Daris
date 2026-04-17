/**
 * Timezone helpers used by the schedule form.
 *
 * The admin might be physically anywhere, but the class is always meant to be
 * at "5:00 PM in some specific timezone" (usually Cairo). These helpers
 * convert a wall-clock time + target IANA timezone into the correct UTC
 * `Date`, handling DST transitions automatically via `Intl`.
 */

/**
 * What offset (in minutes) does `tz` apply at `utcDate`?
 *
 * Positive means the zone is ahead of UTC (+2 = "UTC+2"). For Africa/Cairo
 * this returns 120 most of the year and 180 during EET summer (if any).
 */
export function tzOffsetMinutes(utcDate, tz) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(utcDate).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  // What that same wall-clock moment would be in UTC milliseconds.
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return (asIfUtc - utcDate.getTime()) / 60000;
}

/**
 * Convert a wall-clock moment interpreted in `tz` into a real UTC `Date`.
 *
 *   zonedTimeToUtc({ year: 2026, month: 4, day: 20, hour: 17, minute: 0 }, 'Africa/Cairo')
 *   // → Date representing 20 Apr 2026 15:00 UTC  (17:00 Cairo)
 */
export function zonedTimeToUtc({ year, month, day, hour = 0, minute = 0, second = 0 }, tz) {
  // First pass: pretend the wall-clock time is already UTC, then correct
  // for the actual offset of the target zone at that instant. This round
  // trip handles DST because `tzOffsetMinutes` reads the real zoneinfo.
  const approx = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMin = tzOffsetMinutes(approx, tz);
  return new Date(approx.getTime() - offsetMin * 60000);
}

/**
 * Given a target day-of-week (0=Sunday … 6=Saturday) and an "HH:MM" string,
 * return the next UTC `Date` that matches that weekday at that wall-clock
 * time in the given timezone.
 */
export function nextWeekdayInTz(dayOfWeek, timeStr, tz) {
  const [hour, minute] = timeStr.split(':').map(Number);
  const now = new Date();

  // Figure out what "today" is in the target zone — don't use the admin's
  // local calendar, or the weekday math is wrong for users on the other
  // side of midnight from the class.
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  });
  const parts = dtf.formatToParts(now).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  const todayInTz = {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
  const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const currentWeekday = WEEKDAYS[parts.weekday];

  // Candidate: that weekday, at hour:minute in `tz`, this week. May be in
  // the past if the time has already gone by today.
  let daysUntil = dayOfWeek - currentWeekday;
  if (daysUntil < 0) daysUntil += 7;

  let candidate = zonedTimeToUtc(
    {
      year: todayInTz.year,
      month: todayInTz.month,
      day: todayInTz.day + daysUntil,
      hour,
      minute,
    },
    tz
  );

  // If we landed on "today" but the time is already past, bump a week.
  if (daysUntil === 0 && candidate <= now) {
    candidate = zonedTimeToUtc(
      {
        year: todayInTz.year,
        month: todayInTz.month,
        day: todayInTz.day + 7,
        hour,
        minute,
      },
      tz
    );
  }

  return candidate;
}

/**
 * The admin's best-guess timezone, used as the default in the schedule form.
 * Falls back to Africa/Cairo for Arabic UIs and UTC otherwise.
 */
export function guessDefaultTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Africa/Cairo';
  }
}

/**
 * Shortlist of timezones the schedule form offers. Designed around Daris's
 * Arabic-world student base so the sheikh rarely has to type into the custom
 * field. "Admin's device" is first for convenience.
 */
export const TZ_OPTIONS = [
  'Africa/Cairo',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Asia/Amman',
  'Asia/Beirut',
  'Asia/Kuwait',
  'Asia/Qatar',
  'Asia/Baghdad',
  'Africa/Casablanca',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
];

/**
 * Format a UTC date as a readable wall-clock string in the given tz + locale.
 */
export function formatInTz(date, tz, lang = 'en') {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
