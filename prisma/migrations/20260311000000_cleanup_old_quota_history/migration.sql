-- Migration: Clean up old QuotaHistory records
-- Remove QuotaHistory records older than 90 days to free up storage
-- Preserves recent quota usage data for analysis

DELETE FROM "QuotaHistory"
WHERE "createdAt" < NOW() - INTERVAL '90 days';
