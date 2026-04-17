-- Add a subject column so the admin calendar can color-code classes.
-- Free-form string (nullable) rather than an enum so new subjects can be
-- added without a schema change. Existing rows are left null and render
-- with a neutral colour in the UI.
ALTER TABLE "class_sessions"
  ADD COLUMN "subject" TEXT;
