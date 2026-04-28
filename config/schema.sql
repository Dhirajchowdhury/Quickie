-- Quickie database schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- One config per user (upserted on upload)
CREATE TABLE IF NOT EXISTS configs (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  config     JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- All entity records stored as JSONB — no dynamic columns
CREATE TABLE IF NOT EXISTS records (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity     TEXT NOT NULL,
  data       JSONB NOT NULL,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_records_entity_user ON records(entity, user_id);
