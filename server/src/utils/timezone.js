/**
 * Server-side timezone helpers. Same shape as the frontend's
 * useTimezone.js so the conversion math stays consistent across
 * client and server. Used by the series-reschedule endpoint, which
 * needs to recompute UTC times from a wall-clock + IANA zone for
 * every class in a series.
 *
 * Node.js ships with Intl tzdata so these work without any extra
 * dependency.
 */

/**
 * Offset (in minutes) of `tz` at `utcDate`. Positive means the zone is
 * ahead of UTC. Africa/Cairo returns 120 most of the year and 180
 * during EET summer time.
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
 * Convert wall-clock-in-tz to a real UTC Date. Round-tripping through
 * tzOffsetMinutes handles DST transitions automatically.
 */
export function zonedTimeToUtc({ year, month, day, hour = 0, minute = 0, second = 0 }, tz) {
  const approx = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMin = tzOffsetMinutes(approx, tz);
  return new Date(approx.getTime() - offsetMin * 60000);
}

/**
 * Get the date components (year/month/day) of a UTC instant rendered
 * in the given timezone. Used when reshuffling a series: we need to
 * know "what date was this class on in its old timezone" before
 * re-anchoring it in the new timezone.
 */
export function dateComponentsInTz(utcDate, tz) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dtf.formatToParts(utcDate).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}
