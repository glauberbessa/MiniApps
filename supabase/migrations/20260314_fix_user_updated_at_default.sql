-- Fix: Add DEFAULT NOW() to "updatedAt" column on "User" table
-- This prevents NOT NULL constraint violations when the adapter insert
-- doesn't include updatedAt (e.g., due to PostgREST schema cache staleness).
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT NOW();
