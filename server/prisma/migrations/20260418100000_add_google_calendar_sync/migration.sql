-- Google Calendar integration + mixed-subject classes.
-- See ~/.claude/plans/starry-dazzling-fox.md "Google Calendar integration +
-- mixed-subject classes (detailed plan)" for context.

-- Step 1: ClassSession gets columns for the mixed-subject schema + the
-- Google Calendar sync state. All nullable so existing rows remain valid
-- and legacy classes keep rendering with a single subject colour.
ALTER TABLE "class_sessions"
  ADD COLUMN "subject_secondary"     TEXT,
  ADD COLUMN "subject_switch_min"    INTEGER,
  ADD COLUMN "google_event_id"       TEXT,
  ADD COLUMN "google_event_synced_at" TIMESTAMP(3);

-- Step 2: Per-admin Google OAuth connection. One row per admin who has
-- connected their Google Calendar. Refresh + access tokens are stored
-- encrypted (AES-256-GCM via TOKEN_ENCRYPTION_KEY) and only written via
-- the server; they are never returned by any API endpoint.
CREATE TABLE "google_calendar_connections" (
  "id"                         UUID          NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                    UUID          NOT NULL,
  "google_account_email"       TEXT          NOT NULL,
  "google_calendar_id"         TEXT          NOT NULL DEFAULT 'primary',
  "encrypted_refresh_token"    TEXT,
  "encrypted_access_token"     TEXT,
  "access_token_expires_at"    TIMESTAMP(3),
  "status"                     TEXT          NOT NULL DEFAULT 'active',
  "scopes"                     TEXT          NOT NULL DEFAULT '',
  "invite_students"            BOOLEAN       NOT NULL DEFAULT FALSE,
  "connected_at"               TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_synced_at"             TIMESTAMP(3),
  "last_error_at"              TIMESTAMP(3),
  "last_error_message"         TEXT,
  "created_at"                 TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"                 TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "google_calendar_connections_pkey" PRIMARY KEY ("id")
);

-- Admin can only have one connection at a time. Reconnecting updates in
-- place rather than creating a second row.
CREATE UNIQUE INDEX "google_calendar_connections_user_id_key"
  ON "google_calendar_connections" ("user_id");

ALTER TABLE "google_calendar_connections"
  ADD CONSTRAINT "google_calendar_connections_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 3: Queued sync operations. A row is written for every class
-- scheduled / rescheduled / cancelled via the admin UI. The background
-- job drains pending rows with exponential-backoff retry. Max 5 attempts
-- before an op is surfaced to the admin as a persistent error banner.
CREATE TABLE "google_calendar_sync_ops" (
  "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
  "class_session_id" UUID          NOT NULL,
  "op"               TEXT          NOT NULL,
  "attempt_count"    INTEGER       NOT NULL DEFAULT 0,
  "last_attempt_at"  TIMESTAMP(3),
  "next_attempt_at"  TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "error_message"    TEXT,
  "resolved"         BOOLEAN       NOT NULL DEFAULT FALSE,
  "created_at"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "google_calendar_sync_ops_pkey" PRIMARY KEY ("id")
);

-- The job's main query filters on (resolved, next_attempt_at). Index it.
CREATE INDEX "google_calendar_sync_ops_resolved_next_attempt_at_idx"
  ON "google_calendar_sync_ops" ("resolved", "next_attempt_at");
CREATE INDEX "google_calendar_sync_ops_class_session_id_idx"
  ON "google_calendar_sync_ops" ("class_session_id");

ALTER TABLE "google_calendar_sync_ops"
  ADD CONSTRAINT "google_calendar_sync_ops_class_session_id_fkey"
  FOREIGN KEY ("class_session_id") REFERENCES "class_sessions" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
