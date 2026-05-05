-- Backfill series_id on legacy class_sessions rows that were created via
-- the older POST /classes endpoint (single-class creation never set a
-- seriesId). The dashboard's drawer hides "Cancel series" when seriesId
-- is null, which left the user unable to cancel-series for any class
-- that had a student merged into it post-creation.
--
-- Each null row gets its own UUID — they're not "really" a series, but
-- treating them as a series-of-one means the button shows + clicking
-- it deletes the single class (functionally equivalent to Cancel).
--
-- Casting "id"::text gives us a deterministic, unique value per row
-- without needing pgcrypto or uuid-ossp extensions on the database.
UPDATE "class_sessions"
SET "series_id" = "id"::text
WHERE "series_id" IS NULL;
