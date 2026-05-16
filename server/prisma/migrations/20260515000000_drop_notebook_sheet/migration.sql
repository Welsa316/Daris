-- The per-student Google Sheets notebook has been replaced by the
-- on-site notebook page. These two columns only ever held pointers to
-- the Sheet (id + share URL); the spreadsheets themselves remain in
-- the sheikh's Google Drive untouched. No lesson data lived in these
-- columns, so dropping them loses nothing recoverable.

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "notebook_sheet_id",
  DROP COLUMN IF EXISTS "notebook_sheet_url";
