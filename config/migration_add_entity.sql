-- Migration: ensure records table has entity column and proper index
-- Run this in your Supabase SQL editor

-- 1. Add entity column if it doesn't exist yet
ALTER TABLE records
  ADD COLUMN IF NOT EXISTS entity TEXT;

-- 2. Delete any old records that have no entity set (they're orphaned/unusable)
DELETE FROM records WHERE entity IS NULL OR entity = '';

-- 3. Now enforce NOT NULL
ALTER TABLE records
  ALTER COLUMN entity SET NOT NULL;

-- 4. Ensure the composite index exists for fast per-entity queries
CREATE INDEX IF NOT EXISTS idx_records_entity_user ON records(entity, user_id);
