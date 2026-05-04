-- Add the is_teacher capability boolean to users.
ALTER TABLE "users"
  ADD COLUMN "is_teacher" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "users_is_teacher_idx" ON "users"("is_teacher");

-- Migrate existing teachers: anyone with role='teacher' becomes
-- role='enrolled_student' + is_teacher=true. This unifies them with
-- the new model where teacher capability is a flag, not a separate
-- role. enrolled_at is backfilled if missing so the admin dashboard
-- treats them sensibly. The role enum value 'teacher' stays in the
-- enum (Postgres can't drop enum values cleanly); it's just no longer
-- in active use.
UPDATE "users"
SET
  "role" = 'enrolled_student',
  "is_teacher" = true,
  "enrolled_at" = COALESCE("enrolled_at", NOW())
WHERE "role" = 'teacher'
  AND "deleted_at" IS NULL;
