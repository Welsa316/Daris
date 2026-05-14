-- Messaging: one Conversation per student, anchored on the student.
-- Participants are derived live from TeacherStudent + the sheikh, so
-- there is no participants table. Sheikh always reads + writes; the
-- student's assigned teachers read + write; the student reads + writes.

CREATE TABLE "conversations" (
  "id"               UUID         NOT NULL,
  "student_id"       UUID         NOT NULL,
  "last_message_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversations_student_id_key" ON "conversations"("student_id");
CREATE INDEX "conversations_last_message_at_idx" ON "conversations"("last_message_at");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "messages" (
  "id"              UUID         NOT NULL,
  "conversation_id" UUID         NOT NULL,
  "sender_id"       UUID         NOT NULL,
  "body"            TEXT         NOT NULL,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey"
  FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "conversation_reads" (
  "id"              UUID         NOT NULL,
  "conversation_id" UUID         NOT NULL,
  "user_id"         UUID         NOT NULL,
  "last_read_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversation_reads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversation_reads_conversation_id_user_id_key"
  ON "conversation_reads"("conversation_id", "user_id");
CREATE INDEX "conversation_reads_user_id_idx" ON "conversation_reads"("user_id");

ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
