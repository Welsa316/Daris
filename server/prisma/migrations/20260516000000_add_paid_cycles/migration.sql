-- Notebook paid-cycle checkbox. One row = "cycle N of this student is
-- paid". A cycle is 4 consecutive classes; cycle_index is its 0-based
-- chronological position. No amount column — the sheikh charges a
-- different price per student, so this is a plain paid/not-paid flag.

CREATE TABLE "paid_cycles" (
  "id"           UUID         NOT NULL,
  "student_id"   UUID         NOT NULL,
  "cycle_index"  INTEGER      NOT NULL,
  "marked_by_id" UUID,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "paid_cycles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "paid_cycles_student_id_cycle_index_key"
  ON "paid_cycles"("student_id", "cycle_index");
CREATE INDEX "paid_cycles_student_id_idx" ON "paid_cycles"("student_id");

ALTER TABLE "paid_cycles" ADD CONSTRAINT "paid_cycles_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "paid_cycles" ADD CONSTRAINT "paid_cycles_marked_by_id_fkey"
  FOREIGN KEY ("marked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
