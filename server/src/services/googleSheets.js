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

// Subject options used for the Subject dropdown on the notebook tab.
// Non-strict so the sheikh can type a custom value if a fifth subject
// ever shows up. Keep this list in sync with the admin dashboard's
// SUBJECTS array (src/views/dashboard/AdminDashboard.vue) — the keys
// stored on each ClassSession (`quran` / `fiqh` / `arabic` / `tarbiya`)
// map to these Arabic display labels here.
const SUBJECTS = ['قرآن', 'فقه', 'لغة عربية', 'تربية إسلامية'];

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
  // Layout: ONE ROW PER SESSION, four rows per cycle.
  //
  // Previously the sheet collapsed a whole 4-session cycle into a
  // single row with four "session X" columns + a "for next session"
  // column. That broke down the moment the sheikh wrote a planning
  // note like "next time we'll finish Ta-Ha" — which "next" did it
  // mean? Session 2? Session 3? Now each session gets its own row, so
  // a note on row N is unambiguously about row N+1.
  //
  // Columns (6):
  //   0 التاريخ           (Date — when this session happened)
  //   1 المادة            (Subject — dropdown, repeated per row)
  //   2 #                 (Session number 1–4 within the cycle —
  //                        pre-filled by the template so the sheikh
  //                        doesn't have to count)
  //   3 ملاحظات الجلسة    (Notes for THIS session)
  //   4 للحصة القادمة     (For next session — planning notes that
  //                        apply to the next row down)
  //   5 مدفوع             (Paid checkbox — only on every 4th row,
  //                        i.e. the last session of each cycle)
  //
  // Cycle grouping: every 4 rows are visually one cycle. Alternating
  // background colour (cream / white) draws the eye to each block; a
  // thicker bottom border under every 4th row reinforces the seam.
  //
  // Pre-allocation: 25 cycles (rows 2..101 in 1-indexed Sheets terms;
  // 100 rows of data + 1 header row).
  const CYCLES = 25;
  const ROWS_PER_CYCLE = 4;
  const TOTAL_DATA_ROWS = CYCLES * ROWS_PER_CYCLE; // 100

  // Pre-build the session-number column so each cycle reads 1, 2, 3, 4.
  // The sheikh can still overwrite if a session is skipped, but the
  // default removes the most error-prone cell to fill in by hand.
  const sessionNumberRows = [];
  for (let i = 0; i < TOTAL_DATA_ROWS; i++) {
    const sessionNumber = (i % ROWS_PER_CYCLE) + 1;
    sessionNumberRows.push({
      values: [
        // Cols 0,1 left blank (date + subject — sheikh fills).
        { userEnteredValue: {} },
        { userEnteredValue: {} },
        { userEnteredValue: { numberValue: sessionNumber } },
        // Cols 3,4,5 left blank.
        { userEnteredValue: {} },
        { userEnteredValue: {} },
        { userEnteredValue: {} },
      ],
    });
  }

  const createBody = {
    properties: { title: studentName, locale: 'ar' },
    sheets: [
      {
        properties: {
          title: 'الدفتر',
          index: 0,
          rightToLeft: true,
          gridProperties: {
            rowCount: TOTAL_DATA_ROWS + 1,
            columnCount: 6,
            frozenRowCount: 1,
          },
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
                  { userEnteredValue: { stringValue: '#' } },
                  { userEnteredValue: { stringValue: 'ملاحظات الجلسة' } },
                  { userEnteredValue: { stringValue: 'للحصة القادمة' } },
                  { userEnteredValue: { stringValue: 'مدفوع' } },
                ],
              },
              // Pre-filled session numbers immediately after the header.
              ...sessionNumberRows,
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

  // One-row-per-session formatting. Column indices, in order:
  //   0 التاريخ | 1 المادة | 2 # | 3 ملاحظات الجلسة |
  //   4 للحصة القادمة | 5 مدفوع
  const notebookSheetId = sheetIds[0];
  if (notebookSheetId !== undefined) {
    // Date column slim, session-# column narrowest, the two prose
    // columns (notes + next-session planning) get the most width
    // because that's where the sheikh actually types.
    const widths = [130, 130, 50, 360, 300, 90];
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

    // Full date display format on column 0 (التاريخ), every data row.
    // Sheikh enters the session date and the cell renders as
    // "10 May 2026" so cross-month entries stay legible.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: TOTAL_DATA_ROWS + 1,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'DATE', pattern: 'd mmmm yyyy' },
          },
        },
        fields: 'userEnteredFormat.numberFormat',
      },
    });

    // Subject dropdown on column 1 (المادة). Non-strict so a future
    // fifth subject can be typed in directly. Applied per row so the
    // sheikh fills the subject on the first row of a cycle and can
    // repeat for sessions 2–4 (most cycles stay in one subject).
    formatRequests.push({
      setDataValidation: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: TOTAL_DATA_ROWS + 1,
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

    // Session-# column (col 2): center-aligned, no wrap — these are
    // single-digit numbers and shouldn't expand the row height.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: TOTAL_DATA_ROWS + 1,
          startColumnIndex: 2,
          endColumnIndex: 3,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            textFormat: { bold: true },
          },
        },
        fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)',
      },
    });

    // Wrap + top-align on the two prose columns (notes, next-session)
    // so paragraph notes expand the row height instead of overflowing.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: TOTAL_DATA_ROWS + 1,
          startColumnIndex: 3,
          endColumnIndex: 5,
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

    // Paid checkbox on column 5 — but ONLY on every 4th data row
    // (the last session of each cycle). A cycle is "paid" as a unit,
    // not per session, so showing the checkbox on sessions 1–3 would
    // just invite the wrong row to be ticked. Other rows in this
    // column stay plain cells.
    //
    // Data rows are 1..TOTAL_DATA_ROWS (0-indexed sheets terms with
    // row 0 = header). The 4th session of cycle c is at row index
    // 1 + (c*4 - 1) = 4*c. We push one BOOLEAN validation request per
    // cycle so the checkbox only appears where it makes sense.
    for (let cycle = 1; cycle <= CYCLES; cycle++) {
      const row4 = cycle * ROWS_PER_CYCLE; // 0-indexed row of last session
      formatRequests.push({
        setDataValidation: {
          range: {
            sheetId: notebookSheetId,
            startRowIndex: row4,
            endRowIndex: row4 + 1,
            startColumnIndex: 5,
            endColumnIndex: 6,
          },
          rule: {
            condition: { type: 'BOOLEAN' },
            showCustomUi: true,
            strict: false,
          },
        },
      });
    }

    // Center the checkbox column for tidiness.
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: notebookSheetId,
          startRowIndex: 1,
          endRowIndex: TOTAL_DATA_ROWS + 1,
          startColumnIndex: 5,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: 'CENTER' },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    });

    // Visual cycle grouping. Every cycle gets one background colour;
    // alternating between cream and white draws the eye to where one
    // cycle ends and the next begins. Then a thicker bottom border
    // under each 4th row reinforces the seam.
    // White first so cycle 1 contrasts with the cream header above
    // it — otherwise the freeze line + cycle 1 would be the same
    // tint and the seam between header and data would muddle.
    const CYCLE_TINTS = [
      { red: 1, green: 1, blue: 1 },              // plain white
      { red: 0.96, green: 0.94, blue: 0.88 },     // cream
    ];
    for (let cycle = 0; cycle < CYCLES; cycle++) {
      const startRow = 1 + cycle * ROWS_PER_CYCLE;
      const endRow = startRow + ROWS_PER_CYCLE;
      const tint = CYCLE_TINTS[cycle % CYCLE_TINTS.length];
      formatRequests.push({
        repeatCell: {
          range: {
            sheetId: notebookSheetId,
            startRowIndex: startRow,
            endRowIndex: endRow,
            startColumnIndex: 0,
            endColumnIndex: 6,
          },
          cell: {
            userEnteredFormat: { backgroundColor: tint },
          },
          fields: 'userEnteredFormat.backgroundColor',
        },
      });
      // Heavier bottom border on the last row of the cycle so the
      // separator is visible even when two cycles share a tint
      // (every 4-row block ends with a defined line, not just a
      // colour shift).
      formatRequests.push({
        updateBorders: {
          range: {
            sheetId: notebookSheetId,
            startRowIndex: endRow - 1,
            endRowIndex: endRow,
            startColumnIndex: 0,
            endColumnIndex: 6,
          },
          bottom: {
            style: 'SOLID_MEDIUM',
            color: { red: 0.65, green: 0.55, blue: 0.25 }, // gold-ish
          },
        },
      });
    }
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

  // Step 3: grant anyone-with-link Viewer access so the student can
  // open their own notebook from the student dashboard. The URL is
  // surfaced only to the student themselves (gated by Daris auth on
  // /api/student/dashboard), so anyone-with-link is effectively
  // "anyone the student chooses to share it with". Sheikh remains
  // owner; assigned teachers get edit access via the folder share
  // the sheikh sets up once. Non-fatal: if this fails, sheikh can
  // share manually.
  const shareRes = await fetch(
    `${DRIVE_API}/files/${spreadsheetId}/permissions?fields=id`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    }
  );
  if (!shareRes.ok) {
    const body = await shareRes.text().catch(() => '');
    logger.warn('Sheet anyone-link share failed (continuing)', {
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
