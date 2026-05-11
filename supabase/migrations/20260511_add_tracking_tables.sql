-- Page views tracking
CREATE TABLE IF NOT EXISTS public.page_views (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
    city_slug text,
    state_code text,
    path text NOT NULL,
    referrer text,
    user_agent text,
    ip_hash text,
    viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_listing ON public.page_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views(viewed_at);

-- Claim tokens for email verification
CREATE TABLE IF NOT EXISTS public.claim_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    email text NOT NULL,
    token text NOT NULL UNIQUE,
    verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_claim_tokens_token ON public.claim_tokens(token);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_listing ON public.claim_tokens(listing_id);

-- Business users (owners who have claimed)
CREATE TABLE IF NOT EXISTS public.business_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    email text NOT NULL,
    name text,
    phone text,
    role text DEFAULT 'owner',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(listing_id, email)
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;

-- Allow anon inserts for page views (tracking)
DROP POLICY IF EXISTS "Allow anon page view inserts" ON public.page_views;
CREATE POLICY "Allow anon page view inserts" ON public.page_views
    FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access page_views" ON public.page_views;
CREATE POLICY "Service role full access page_views" ON public.page_views
    FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access claim_tokens" ON public.claim_tokens;
CREATE POLICY "Service role full access claim_tokens" ON public.claim_tokens
    FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access business_users" ON public.business_users;
CREATE POLICY "Service role full access business_users" ON public.business_users
    FOR ALL TO service_role USING (true);
