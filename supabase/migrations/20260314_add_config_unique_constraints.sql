-- Fix: Add missing DEFAULT values for PlaylistConfig and ChannelConfig tables
-- Without these defaults, INSERT operations via upsert fail because:
--   - id (NOT NULL, no default) → no UUID generated for new rows
--   - updatedAt (NOT NULL, no default) → null violation on insert

-- PlaylistConfig defaults
ALTER TABLE "PlaylistConfig" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "PlaylistConfig" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- ChannelConfig defaults
ALTER TABLE "ChannelConfig" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ChannelConfig" ALTER COLUMN "updatedAt" SET DEFAULT NOW();
