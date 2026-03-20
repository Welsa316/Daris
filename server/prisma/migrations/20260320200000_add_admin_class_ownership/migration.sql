-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN "created_by_admin_id" UUID;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "class_sessions_created_by_admin_id_idx" ON "class_sessions"("created_by_admin_id");

-- Backfill: assign all existing classes to the first admin
UPDATE "class_sessions" SET "created_by_admin_id" = (SELECT "id" FROM "users" WHERE "role" = 'admin' LIMIT 1) WHERE "created_by_admin_id" IS NULL;
