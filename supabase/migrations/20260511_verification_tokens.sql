-- Verification tokens for email-based claim verification
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  claim_id UUID REFERENCES claims(id),
  business_name TEXT,
  listing_id_static TEXT, -- for static listings that aren't in Supabase yet
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);

-- Index for email lookup (for rate limiting / duplicate checking)
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens(email);

-- Auto-cleanup: tokens older than 7 days (optional, run as cron)
-- DELETE FROM verification_tokens WHERE created_at < now() - interval '7 days';
