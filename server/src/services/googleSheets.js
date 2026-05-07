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
  // Lesson Notes columns (4): التاريخ | الموضوع | الجلسة القادمة | مدفوع
  // Payments columns (6):     التاريخ | المبلغ | العملة | الفترة | طريقة الدفع | ملاحظات
  // Profile Notes:            single free-form column for general notes.
  //
  // The 'Paid?' column on Lesson Notes is a real Sheets checkbox
  // (data-validation rule set up in the batchUpdate after create).
  const createBody = {
    properties: { title: studentName, locale: 'ar' },
    sheets: [
      {
        properties: {
          title: 'ملاحظات الحصص',
          index: 0,
          rightToLeft: true,
          gridProperties: { rowCount: 200, columnCount: 4 },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'التاريخ' } },
                  { userEnteredValue: { stringValue: 'الموضوع' } },
                  { userEnteredValue: { stringValue: 'الجلسة القادمة' } },
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
          gridProperties: { rowCount: 200, columnCount: 6 },
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
                  { userEnteredValue: { stringValue: 'الفترة' } },
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

  // Column widths + a Sheets-native checkbox in the "مدفوع" column on
  // the lesson notes sheet. lessonSheetId is the first tab; column
  // index 3 is "مدفوع". setDataValidation with a BOOLEAN condition
  // makes the cells render as actual checkboxes (Insert > Checkbox
  // equivalent). showCustomUi:true paints the checkbox UI.
  const lessonSheetId = sheetIds[0];
  if (lessonSheetId !== undefined) {
    // 4 columns: التاريخ (date), الموضوع (topic — widest), الجلسة القادمة, مدفوع (checkbox)
    const widths = [120, 360, 260, 90];
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
    // Checkbox validation on column 3 (مدفوع), rows 1..199 (header
    // stays at row 0 untouched).
    formatRequests.push({
      setDataValidation: {
        range: {
          sheetId: lessonSheetId,
          startRowIndex: 1,
          endRowIndex: 200,
          startColumnIndex: 3,
          endColumnIndex: 4,
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
          startColumnIndex: 3,
          endColumnIndex: 4,
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: 'CENTER' },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    });
  }

  // Payments tab gets reasonable column widths too. Money columns
  // narrower than free-form notes.
  const paymentsSheetId = sheetIds[1];
  if (paymentsSheetId !== undefined) {
    // 6 columns: التاريخ | المبلغ | العملة | الفترة | طريقة الدفع | ملاحظات
    const widths = [120, 110, 90, 140, 160, 280];
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
