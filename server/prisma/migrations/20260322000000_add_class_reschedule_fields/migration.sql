-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN "rescheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "rescheduled_at" TIMESTAMP(3),
ADD COLUMN "original_start_time" TIMESTAMP(3),
ADD COLUMN "original_end_time" TIMESTAMP(3);
