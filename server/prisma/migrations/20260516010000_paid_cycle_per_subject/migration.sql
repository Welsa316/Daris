-- The notebook's Paid checkbox moves from one-per-cycle to
-- one-per-(subject, cycle): a student can take Quran + Fiqh in a
-- single merged class but pay for each on its own schedule. Old
-- cycle-level rows can't say which subject they meant, so they're
-- cleared (the feature is a day old — only test ticks exist).

DELETE FROM "paid_cycles";

DROP INDEX "paid_cycles_student_id_cycle_index_key";

ALTER TABLE "paid_cycles" ADD COLUMN "subject" TEXT NOT NULL;

CREATE UNIQUE INDEX "paid_cycles_student_id_subject_cycle_index_key"
  ON "paid_cycles"("student_id", "subject", "cycle_index");
