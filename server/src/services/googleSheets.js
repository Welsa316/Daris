/**
 * Google Drive + Sheets integration for the per-student notebook
 * feature. The sheikh writes lesson notes / payments / free-form
 * profile notes directly in the Sheet; Daris never reads it back —
 * we only create it once and store the URL.
 *
 * Calls go through the existing GoogleCalendarConnection (same OAuth
 * tokens, same access-token refresh path), so this file doesn't own
 * any auth state of its own. Native fetch — no `googleapis` SDK
 * dependency added. Matches the pattern in googleCalendar.js.
 */

import { prisma } from '../config/database.js';
import { logger, auditLog } from '../utils/logger.js';
import { getValidAccessToken, hasNotebookScopes } from './googleCalendar.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const SHEETS_API = 'https://sheets.googleapis.com/v4';

const STUDENTS_FOLDER_NAME = 'Daris Students';

// Subject options used for dropdown validation in both the Lesson Notes
// and Payments sheets. Sheikh teaches three; if a fourth ever appears
// the dropdown is non-strict so he can type a custom value, but the
// Paid auto-match formula only flips ✓ when Lesson Notes and Payments
// use the SAME subject text. Keep this list in sync with the class
// scheduler's subject options on the admin dashboard.
const SUBJECTS = ['قرآن', 'فقه', 'عربي'];

/**
 * Find or create the Daris Students folder at the root of the user's
 * Drive. Cached on the connection row so we don't search Drive every
 * time. Returns the folder id.
 */
async function ensureStudentsFolder(adminUserId) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: adminUserId },
    select: { id: true, scopes: true, lastErrorMessage: true },
  });
  if (!conn) {
    const err = new Error('Google not connected');
    err.code = 'no_connection';
    throw err;
  }
  if (!hasNotebookScopes(conn.scopes)) {
    const err = new Error(
      'Google connection is missing Drive/Sheets scopes. Disconnect and reconnect to grant them.'
    );
    err.code = 'needs_scope_upgrade';
    throw err;
  }

  const accessToken = await getValidAccessToken(adminUserId);

  // Search for an existing folder. drive.file scope only sees files
  // Daris itself created, so this won't pick up an unrelated folder
  // the sheikh might have called the same thing — only ones we made.
  const searchUrl =
    `${DRIVE_API}/files` +
    `?q=${encodeURIComponent(
      `name='${STUDENTS_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    )}&fields=files(id,name)`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!searchRes.ok) {
    const body = await searchRes.text().catch(() => '');
    throw new Error(`Drive folder search failed: ${searchRes.status} ${body}`);
  }
  const searchData = await searchRes.json();
  const existing = searchData.files?.[0];
  if (existing?.id) return existing.id;

  // Not found — create.
  const createRes = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: STUDENTS_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  if (!createRes.ok) {
    const body = await createRes.text().catch(() => '');
    throw new Error(`Drive folder create failed: ${createRes.status} ${body}`);
  }
  const folder = await createRes.json();
  return folder.id;
}

/**
 * Create a fresh notebook Sheet for a single student. Returns
 * { sheetId, sheetUrl }. Caller stores both on the student row.
 *
 * Two API hops:
 *   1. Sheets API spreadsheets.create — gives us the spreadsheetId
 *      with three pre-named tabs and bold/frozen header rows applied
 *      via batchUpdate.
 *   2. Drive API files.update — moves the spreadsheet from Drive root
 *      into the Daris Students folder.
 */
export async function createStudentNotebook(adminUserId, student) {
  const folderId = await ensureStudentsFolder(adminUserId);
  const accessToken = await getValidAccessToken(adminUserId);

  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';

  // Step 1: create the spreadsheet with a SINGLE Arabic-headered tab.
  // The sheikh is the only editor; the school's working language is
  // Arabic, so headers + tab name are in Arabic and the sheet is
  // marked rightToLeft so the column order reads naturally for him.
  //
  // One row per CYCLE (one subject in one month = one row). The four
  // session columns hold free-form notes for sessions 1 through 4 in
  // that cycle. The مدفوع checkbox is per-cycle and manually ticked
  // by the sheikh — one tick covers the whole cycle, no per-session
  // bookkeeping. Payments/Profile-notes tabs were dropped: a single
  // table is the entire surface.
  //
  // Columns (7):
  //   0 الشهر          (Month, displayed as "May 2026")
  //   1 المادة          (Subject — dropdown: قرآن / فقه / عربي)
  //   2 الجلسة الأولى  (Session 1 — date + free-form notes)
  //   3 الجلسة الثانية (Session 2)
  //   4 الجلسة الثالثة (Session 3)
  //   5 الجلسة الرابعة (Session 4)
  //   6 مدفوع           (Paid — manual checkbox per cycle)
  const createBody = {
    properties: { title: studentName, locale: 'ar' },
    sheets: [
      {
        properties: {
          title: 'الدفتر',
          index: 0,
          rightToLeft: true,
          gridProperties: { rowCount: 100, columnCount: 7, frozenRowCount: 1 },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'الشهر' } },
                  { userEnteredValue: { stringValue: 'المادة' } },
                  { userEnteredValue: { stringValue: 'الجلسة الأولى' } },
                  { userEnteredValue: { stringValue: 'الجلسة الثانية' } },
                  { userEnteredValue: { stringValue: 'الجلسة الثالثة' } },
                  { userEnteredValue: { stringValue: 'الجلسة الرابعة' } },
                  { userEnteredValue: { stringValue: 'مدفوع' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const createRes = await fetch(`${SHEETS_API}/spreadsheets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createBody),
  });
  if (!createRes.ok) {
    const body = await createRes.text().catch(() => '');
    throw new Error(`Sheets create failed: ${createRes.status} ${body}`);
  }
  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const sheetUrl = spreadsheet.spreadsheetUrl;

  // Step 1.5: format the header rows. Bold + freeze + reasonable column widths.
  // Done via batchUpdate so it's one extra round-trip instead of three.
  const sheetIds = (spreadsheet.sheets || []).map((s) => s.properties.sheetId);
  const formatRequests = [];
  for (const sheetId of sheetIds) {
    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            backgroundColor: { red: 0.96, green: 0.94, blue: 0.88 },
          },
        },
        fields: 'userEnteredFormat(textFormat,backgroundColor)',
      },
    });
    formatRequests.push({
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    });
  }

  // Single-tab formatting. One row per cycle (subject × month). Column
  // indices, in order:
  //   0 الشهر | 1 المادة | 2 الجلسة الأولى | 3 الجلسة الثانية |
  //   4 الجلسة الثالثة | 5 الجلسة الرابعة | 6 مدفوع
  const notebookSheetId = sheetIds[0];
  if (notebookSheetId !== undefined) {
    // Tight month + subject pills on the left, four equally-wide prose
    // columns for session notes, a narrow centered checkbox at the end.
    const widths = [120, 130, 280, 280, 280, 280, 90];
    widths.forEach((px, idx) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: {
            sheetId: notebookSheetId,
            dimension: 'COLUMNS',
            startIndex: idx,
            endIndex: idx + 1,
          },
          properties: { pixelSize: px },
          fields: 'pixelSize',
        },
      });
    });

    // Month-only display format on column 0 (الشهر), rows 1..99. Sheikh
    // can type any date in the cycle's month — the cell renders as
    // e.g. "May 2026" so he doesn't have to think about which day.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: 100,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'DATE', pattern: 'mmmm yyyy' },
          },
        },
        fields: 'userEnteredFormat.numberFormat',
      },
    });

    // Subject dropdown on column 1 (المادة), rows 1..99. Non-strict so
    // a future fourth subject can be typed in directly.
    formatRequests.push({
      setDataValidation: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: 100,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: SUBJECTS.map((s) => ({ userEnteredValue: s })),
          },
          showCustomUi: true,
          strict: false,
        },
      },
    });

    // Wrap + top-align on the four session columns (cols 2..5) so
    // paragraph notes expand the row height instead of overflowing.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: 100,
          startColumnIndex: 2,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: {
            wrapStrategy: 'WRAP',
            verticalAlignment: 'TOP',
          },
        },
        fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)',
      },
    });

    // Manual paid checkbox on column 6 (مدفوع), rows 1..99. BOOLEAN
    // data validation makes the cell render as a real checkbox the
    // sheikh can click; no formula, no auto-derive — one tick per
    // cycle is the entire payment-tracking surface.
    formatRequests.push({
      setDataValidation: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: 100,
          startColumnIndex: 6,
          endColumnIndex: 7,
        },
        rule: {
          condition: { type: 'BOOLEAN' },
          showCustomUi: true,
          strict: false,
        },
      },
    });

    // Center the checkbox column for tidiness.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: 100,
          startColumnIndex: 6,
          endColumnIndex: 7,
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: 'CENTER' },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    });
  }

  if (formatRequests.length > 0) {
    const fmtRes = await fetch(`${SHEETS_API}/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: formatRequests }),
    });
    if (!fmtRes.ok) {
      // Formatting failure is non-fatal — the sheet exists and works,
      // just looks plainer. Log and continue.
      const body = await fmtRes.text().catch(() => '');
      logger.warn('Sheet formatting failed (continuing)', {
        spreadsheetId,
        error: body.slice(0, 200),
      });
    }
  }

  // Step 2: move the spreadsheet into the Daris Students folder.
  // newly-created spreadsheets land at Drive root by default.
  const moveRes = await fetch(
    `${DRIVE_API}/files/${spreadsheetId}?addParents=${folderId}&removeParents=root&fields=id,parents`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!moveRes.ok) {
    const body = await moveRes.text().catch(() => '');
    // Move failure is also non-fatal — the sheet is at Drive root, still
    // usable, just not organized into the folder.
    logger.warn('Sheet folder-move failed (continuing)', {
      spreadsheetId,
      error: body.slice(0, 200),
    });
  }

  auditLog('NOTEBOOK_CREATED', {
    studentId: student.id,
    adminId: adminUserId,
    spreadsheetId,
  });

  return { sheetId: spreadsheetId, sheetUrl };
}
