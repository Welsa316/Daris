-- Add reminder timestamp columns to class_sessions
ALTER TABLE "class_sessions"
  ADD COLUMN "reminder_30_sent_at" TIMESTAMP(3),
  ADD COLUMN "reminder_24_sent_at" TIMESTAMP(3);

-- ClassLog: per (classSession, student) summary + nextSteps
CREATE TABLE "class_logs" (
  "id"                UUID          NOT NULL,
  "class_session_id"  UUID          NOT NULL,
  "student_id"        UUID          NOT NULL,
  "author_id"         UUID          NOT NULL,
  "summary"           TEXT          NOT NULL DEFAULT '',
  "next_steps"        TEXT          NOT NULL DEFAULT '',
  "created_at"        TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "class_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "class_logs_class_session_id_student_id_key"
  ON "class_logs"("class_session_id", "student_id");

CREATE INDEX "class_logs_student_id_created_at_idx"
  ON "class_logs"("student_id", "created_at");

ALTER TABLE "class_logs"
  ADD CONSTRAINT "class_logs_class_session_id_fkey"
    FOREIGN KEY ("class_session_id") REFERENCES "class_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_logs"
  ADD CONSTRAINT "class_logs_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_logs"
  ADD CONSTRAINT "class_logs_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Payments: ledger of money received per student
CREATE TABLE "payments" (
  "id"          UUID          NOT NULL,
  "student_id"  UUID          NOT NULL,
  "author_id"   UUID          NOT NULL,
  "amount"      INTEGER       NOT NULL,
  "currency"    TEXT          NOT NULL DEFAULT 'EGP',
  "period"      TEXT          NOT NULL,
  "paid_at"     TIMESTAMP(3)  NOT NULL,
  "notes"       TEXT,
  "created_at"  TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payments_student_id_paid_at_idx"
  ON "payments"("student_id", "paid_at");

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
