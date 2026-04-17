/**
 * Minimal RFC-4180-ish CSV serializer. No extra deps.
 *
 *   const csv = toCsv(rows, [
 *     { label: 'Date',   key: 'paidAt' },
 *     { label: 'Amount', get: (r) => (r.amount / 100).toFixed(2) },
 *   ]);
 *
 * Values are coerced to string, double-quoted, and internal quotes doubled.
 * Undefined/null become empty strings. Dates use ISO 8601.
 */
export function toCsv(rows, columns) {
  const escape = (v) => {
    if (v === null || v === undefined) return '""';
    let s;
    if (v instanceof Date) s = v.toISOString();
    else s = String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const read = (row, col) => {
    if (typeof col.get === 'function') return col.get(row);
    return row[col.key];
  };

  const header = columns.map((c) => escape(c.label)).join(',');
  const body = rows
    .map((r) => columns.map((c) => escape(read(r, c))).join(','))
    .join('\n');

  // UTF-8 BOM so Excel on Windows opens Arabic correctly without gibberish.
  return '\uFEFF' + header + '\n' + body + (rows.length ? '\n' : '');
}

/**
 * Set the response headers for a CSV download and send the body.
 */
export function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename.replace(/"/g, '')}"`
  );
  res.send(csv);
}
