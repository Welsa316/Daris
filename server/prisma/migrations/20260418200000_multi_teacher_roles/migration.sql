-- Multi-teacher roles + scoped scheduling.
-- See ~/.claude/plans/starry-dazzling-fox.md "Multi-teacher roles + scoped
-- scheduling + calendar UX overhaul (detailed plan)" for context. This
-- migration is Phase A of that plan: schema only, no behaviour change yet.

-- Step 1: Add `teacher` to the UserRole enum. Postgres only allows enum
-- values to be appended in a single statement; rolling back this addition
-- requires a manual down migration we deliberately don't ship.
ALTER TYPE "UserRole" ADD VALUE 'teacher';

-- Step 2: TeacherStudent join table. Maps teacher users to student users.
-- The sheikh manages assignments via the upcoming Teachers tab. Composite
-- uniqueness on (teacher_id, student_id) prevents duplicate links.
CREATE TABLE "teacher_students" (
  "id"                    UUID         NOT NULL DEFAULT gen_random_uuid(),
  "teacher_id"            UUID         NOT NULL,
  "student_id"            UUID         NOT NULL,
  "assigned_by_admin_id"  UUID,
  "notes"                 TEXT,
  "assigned_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "teacher_students_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "teacher_students_teacher_id_student_id_key"
  ON "teacher_students" ("teacher_id", "student_id");

CREATE INDEX "teacher_students_teacher_id_idx"
  ON "teacher_students" ("teacher_id");
CREATE INDEX "teacher_students_student_id_idx"
  ON "teacher_students" ("student_id");

ALTER TABLE "teacher_students"
  ADD CONSTRAINT "teacher_students_teacher_id_fkey"
  FOREIGN KEY ("teacher_id") REFERENCES "users" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_students"
  ADD CONSTRAINT "teacher_students_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_students"
  ADD CONSTRAINT "teacher_students_assigned_by_admin_id_fkey"
  FOREIGN KEY ("assigned_by_admin_id") REFERENCES "users" ("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
