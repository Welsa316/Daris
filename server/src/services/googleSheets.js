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

  // Step 1: create the spreadsheet with three Arabic-headered sheets.
  // The sheikh is the only editor; the school's working language is
  // Arabic, so headers + tab names are in Arabic and each sheet is
  // marked rightToLeft so the column order reads naturally for him.
  //
  // Lesson Notes columns (5): التاريخ | المادة | رقم الجلسة | الملاحظات | مدفوع
  // Payments columns (7):     التاريخ | المبلغ | العملة | المادة | الشهر | طريقة الدفع | ملاحظات
  // Profile Notes:            single free-form column for general notes.
  //
  // Two columns on Lesson Notes are derived by formulas applied in the
  // batchUpdate after create:
  //   - رقم الجلسة (Session #): counts prior-or-equal rows with the same
  //     subject in the same calendar month. Resets to 1 on the 1st of
  //     each month, per subject, mirroring the sheikh's monthly cycle.
  //   - مدفوع (Paid): TRUE iff a row exists on the Payments tab with the
  //     same subject + same month-start date. So one Payments-tab entry
  //     auto-checks all 4 Lesson Notes rows for that cycle. The cell has
  //     BOOLEAN data validation so the formula's TRUE/FALSE renders as
  //     a real checkbox.
  const createBody = {
    properties: { title: studentName, locale: 'ar' },
    sheets: [
      {
        properties: {
          title: 'ملاحظات الحصص',
          index: 0,
          rightToLeft: true,
          gridProperties: { rowCount: 200, columnCount: 5 },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'التاريخ' } },
                  { userEnteredValue: { stringValue: 'المادة' } },
                  { userEnteredValue: { stringValue: 'رقم الجلسة' } },
                  { userEnteredValue: { stringValue: 'الملاحظات' } },
                  { userEnteredValue: { stringValue: 'مدفوع' } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: {
          title: 'المدفوعات',
          index: 1,
          rightToLeft: true,
          gridProperties: { rowCount: 200, columnCount: 7 },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'التاريخ' } },
                  { userEnteredValue: { stringValue: 'المبلغ' } },
                  { userEnteredValue: { stringValue: 'العملة' } },
                  { userEnteredValue: { stringValue: 'المادة' } },
                  { userEnteredValue: { stringValue: 'الشهر' } },
                  { userEnteredValue: { stringValue: 'طريقة الدفع' } },
                  { userEnteredValue: { stringValue: 'ملاحظات' } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: {
          title: 'ملاحظات إضافية',
          index: 2,
          rightToLeft: true,
          gridProperties: { rowCount: 200, columnCount: 1 },
        },
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

  // Lesson Notes formatting: column widths, subject dropdown, prose
  // wrap, paid checkbox, and the per-row Session # / Paid formulas.
  // lessonSheetId is the first tab. Column indices, in order:
  //   0 التاريخ | 1 المادة | 2 رقم الجلسة | 3 الملاحظات | 4 مدفوع
  const lessonSheetId = sheetIds[0];
  if (lessonSheetId !== undefined) {
    // 5 columns sized for the sheikh's actual flow: tight date, narrow
    // subject pill, narrow session number, very wide prose column for
    // the texted-paragraph notes, narrow checkbox at the end.
    const widths = [110, 130, 90, 600, 90];
    widths.forEach((px, idx) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: {
            sheetId: lessonSheetId,
            dimension: 'COLUMNS',
            startIndex: idx,
            endIndex: idx + 1,
          },
          properties: { pixelSize: px },
          fields: 'pixelSize',
        },
      });
    });

    // Subject dropdown on column 1 (المادة), rows 1..199. Non-strict
    // so sheikh can type a custom subject if a fourth one ever shows
    // up (he'd just need to use the same custom text on the Payments
    // tab too for the Paid formula to match).
    formatRequests.push({
      setDataValidation: {
        range: {
          sheetId: lessonSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
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

    // Wrap + top-align on column 3 (الملاحظات) so paragraph notes
    // expand the row height instead of overflowing into adjacent
    // columns. Top-align keeps the date/subject on the same line as
    // the start of the prose.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: lessonSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 3,
          endColumnIndex: 4,
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

    // Checkbox validation on column 4 (مدفوع), rows 1..199. The cell
    // value comes from a formula (set below); BOOLEAN validation
    // makes the resulting TRUE/FALSE render as a real checkbox.
    formatRequests.push({
      setDataValidation: {
        range: {
          sheetId: lessonSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 4,
          endColumnIndex: 5,
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
          sheetId: lessonSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 4,
          endColumnIndex: 5,
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: 'CENTER' },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    });

    // Per-row Session # formula on column 2 (رقم الجلسة), rows 1..199.
    // Each row gets its own formula text with the row number baked in
    // (the Sheets API doesn't auto-adjust cell refs across a single
    // updateCells request). The formula counts every prior-or-equal
    // row in the same calendar month with the same subject — so the
    // first Quran session of May returns 1, the second returns 2, and
    // a Quran session in June restarts at 1.
    const sessionRows = [];
    for (let r = 0; r < 199; r++) {
      const rowNum = r + 2; // first data row is row 2
      const formula =
        `=IF(OR(ISBLANK(A${rowNum}),ISBLANK(B${rowNum})),"",` +
        `COUNTIFS($A$2:A${rowNum},">="&EOMONTH(A${rowNum},-1)+1,` +
        `$A$2:A${rowNum},"<="&EOMONTH(A${rowNum},0),` +
        `$B$2:B${rowNum},B${rowNum}))`;
      sessionRows.push({
        values: [{ userEnteredValue: { formulaValue: formula } }],
      });
    }
    formatRequests.push({
      updateCells: {
        range: {
          sheetId: lessonSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 2,
          endColumnIndex: 3,
        },
        rows: sessionRows,
        fields: 'userEnteredValue',
      },
    });

    // Per-row Paid formula on column 4 (مدفوع), rows 1..199. Reads
    // the Payments tab; returns TRUE iff a payment row exists with
    // the same subject (col D) and the same month-start date (col E,
    // truncated to the 1st via DATE(YEAR,MONTH,1)). One Payments
    // entry covers the whole monthly cycle, auto-checking all 4
    // Lesson Notes rows for that subject.
    const paidRows = [];
    for (let r = 0; r < 199; r++) {
      const rowNum = r + 2;
      const formula =
        `=IF(OR(ISBLANK(A${rowNum}),ISBLANK(B${rowNum})),FALSE,` +
        `COUNTIFS('المدفوعات'!$D$2:$D,B${rowNum},` +
        `'المدفوعات'!$E$2:$E,DATE(YEAR(A${rowNum}),MONTH(A${rowNum}),1))>0)`;
      paidRows.push({
        values: [{ userEnteredValue: { formulaValue: formula } }],
      });
    }
    formatRequests.push({
      updateCells: {
        range: {
          sheetId: lessonSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 4,
          endColumnIndex: 5,
        },
        rows: paidRows,
        fields: 'userEnteredValue',
      },
    });
  }

  // Payments tab: column widths, subject dropdown, and the month-only
  // display format on the الشهر column (sheikh enters any date in the
  // month, the cell renders as e.g. "May 2026").
  // Column indices, in order:
  //   0 التاريخ | 1 المبلغ | 2 العملة | 3 المادة | 4 الشهر |
  //   5 طريقة الدفع | 6 ملاحظات
  const paymentsSheetId = sheetIds[1];
  if (paymentsSheetId !== undefined) {
    const widths = [110, 100, 80, 130, 130, 140, 280];
    widths.forEach((px, idx) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: {
            sheetId: paymentsSheetId,
            dimension: 'COLUMNS',
            startIndex: idx,
            endIndex: idx + 1,
          },
          properties: { pixelSize: px },
          fields: 'pixelSize',
        },
      });
    });

    // Subject dropdown on column 3 (المادة), rows 1..199. Same options
    // as the Lesson Notes dropdown so the Paid match formula compares
    // identical strings on both sides.
    formatRequests.push({
      setDataValidation: {
        range: {
          sheetId: paymentsSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 3,
          endColumnIndex: 4,
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

    // Month-only display format on column 4 (الشهر), rows 1..199.
    // The underlying cell stores a real date so the Lesson Notes Paid
    // formula can match via DATE(YEAR,MONTH,1). The pattern hides the
    // day component — sheikh sees "May 2026" but enters any May date.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: paymentsSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 4,
          endColumnIndex: 5,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'DATE', pattern: 'mmmm yyyy' },
          },
        },
        fields: 'userEnteredFormat.numberFormat',
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
