-- Per-(recipient, conversation) email-notification timestamp. Null means
-- the recipient has never been emailed about a new message in this
-- conversation, so the next send triggers a notification. Subsequent
-- sends within 10 minutes are debounced: we refuse to send another
-- notification while last_notified_at is fresher than the cutoff.

ALTER TABLE "conversation_reads"
  ADD COLUMN "last_notified_at" TIMESTAMP(3);
