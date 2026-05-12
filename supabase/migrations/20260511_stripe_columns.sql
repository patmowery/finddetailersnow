-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ouigivoyigaouhsozahj/sql/new

-- Add Stripe/tier columns to claims
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMPTZ;

-- Add Stripe columns to business_users
ALTER TABLE business_users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Unique constraint for upsert on business_users
ALTER TABLE business_users 
ADD CONSTRAINT IF NOT EXISTS business_users_email_listing_id_key 
UNIQUE (email, listing_id);
