-- Add preferred_language to users table. Default 'ar' because Daris is an
-- Arabic-first product; English speakers can flip it on their profile.
ALTER TABLE "users"
  ADD COLUMN "preferred_language" TEXT NOT NULL DEFAULT 'ar';
