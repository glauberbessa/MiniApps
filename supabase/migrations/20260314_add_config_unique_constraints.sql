-- Add composite unique constraints required for upsert operations
-- Without these, the onConflict: "userId,playlistId" / "userId,channelId"
-- in the API routes will fail with PostgreSQL error 42P10:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification"

-- PlaylistConfig: ensure one config per user per playlist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PlaylistConfig_userId_playlistId_key'
  ) THEN
    ALTER TABLE "PlaylistConfig"
      ADD CONSTRAINT "PlaylistConfig_userId_playlistId_key"
      UNIQUE ("userId", "playlistId");
  END IF;
END $$;

-- ChannelConfig: ensure one config per user per channel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ChannelConfig_userId_channelId_key'
  ) THEN
    ALTER TABLE "ChannelConfig"
      ADD CONSTRAINT "ChannelConfig_userId_channelId_key"
      UNIQUE ("userId", "channelId");
  END IF;
END $$;
