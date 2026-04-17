-- Round 3 schema additions: balance tracking, lesson report template,
-- and series grouping for per-occurrence-vs-series actions.

-- Users get optional "expected per month" so the student list can render a
-- balance pill. Null means no expectation set (no pill renders).
ALTER TABLE "users"
  ADD COLUMN "expected_monthly_amount"   INTEGER,
  ADD COLUMN "expected_monthly_currency" TEXT;

-- Class sessions get a seriesId so cancel/reschedule routes can distinguish
-- "this occurrence" from "this and following".
ALTER TABLE "class_sessions"
  ADD COLUMN "series_id" UUID;

CREATE INDEX "class_sessions_series_id_idx" ON "class_sessions"("series_id");

-- ClassLog → Lesson Report. Keep existing columns (summary, next_steps) for
-- backward compatibility, add homework + admin_notes + visibility. All new
-- text columns default to empty so existing rows remain valid.
ALTER TABLE "class_logs"
  ADD COLUMN "homework"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN "admin_notes" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "visibility"  TEXT NOT NULL DEFAULT 'private';
