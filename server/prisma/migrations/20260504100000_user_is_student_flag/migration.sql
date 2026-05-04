-- Add the is_student capability boolean. Default TRUE so every existing
-- enrolled student keeps showing up in the students list.
ALTER TABLE "users"
  ADD COLUMN "is_student" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "users_is_student_idx" ON "users"("is_student");

-- Pre-Phase-G "pure teachers" were migrated to role=enrolled_student +
-- is_teacher=true in the previous migration. They never had any
-- ClassAssignment rows as a student (the schedule form never picked
-- them as attendees), so we can detect them by that absence and
-- correctly mark them as is_student=false. Dual-role senior students
-- DO have ClassAssignment rows and stay is_student=true.
--
-- No table aliases below — keeps the SQL portable across psql / Prisma's
-- migration runner without ambiguity around `UPDATE table_name alias`.
UPDATE "users"
SET "is_student" = false
WHERE "is_teacher" = true
  AND "deleted_at" IS NULL
  AND "role" = 'enrolled_student'
  AND NOT EXISTS (
    SELECT 1
    FROM "class_assignments"
    WHERE "class_assignments"."student_id" = "users"."id"
  );
