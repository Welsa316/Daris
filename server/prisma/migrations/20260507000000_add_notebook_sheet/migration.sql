-- Per-student Google Sheets notebook. Sheikh edits notes / payments /
-- lesson reports directly in the Sheet; Daris just stores the URL + ID.
-- Both columns nullable: lazy-created on first 'Create notebook' click
-- for a student so we don't burn API quota on students who never get
-- notes. No backfill.
ALTER TABLE "users"
  ADD COLUMN "notebook_sheet_id" TEXT,
  ADD COLUMN "notebook_sheet_url" TEXT;
