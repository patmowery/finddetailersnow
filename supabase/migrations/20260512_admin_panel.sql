-- FindDetailersNow Admin Panel Migration
-- Migration: 20260512_admin_panel
-- New tables: business_photos, business_services, listing_clicks, review_responses
-- listing_id is TEXT throughout to support both UUID and static string listing IDs

-- ============================================================
-- BUSINESS PHOTOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.business_photos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id   TEXT NOT NULL,
  photo_type   TEXT NOT NULL CHECK (photo_type IN ('cover', 'logo', 'gallery')),
  url          TEXT NOT NULL,
  storage_path TEXT,           -- supabase storage path for deletion
  alt_text     TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_photos_listing ON public.business_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_business_photos_type ON public.business_photos(listing_id, photo_type);

-- ============================================================
-- BUSINESS SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.business_services (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id       TEXT NOT NULL,
  service_name     TEXT NOT NULL,
  description      TEXT,
  price_from       DECIMAL(10, 2),
  price_to         DECIMAL(10, 2),
  duration_minutes INTEGER,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_services_listing ON public.business_services(listing_id);
CREATE INDEX IF NOT EXISTS idx_business_services_sort ON public.business_services(listing_id, sort_order);

-- ============================================================
-- LISTING CLICKS TABLE (lead tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listing_clicks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  TEXT NOT NULL,
  click_type  TEXT NOT NULL CHECK (click_type IN ('phone', 'email', 'website', 'directions', 'booking')),
  referrer    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_clicks_listing ON public.listing_clicks(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_clicks_created ON public.listing_clicks(listing_id, created_at);
CREATE INDEX IF NOT EXISTS idx_listing_clicks_type ON public.listing_clicks(listing_id, click_type);

-- ============================================================
-- REVIEW RESPONSES TABLE (owner responses to reviews)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.review_responses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id     TEXT NOT NULL,
  review_id      TEXT NOT NULL,     -- TEXT to support both UUID and static review IDs
  response_text  TEXT NOT NULL,
  responded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(review_id)                 -- one response per review
);

CREATE INDEX IF NOT EXISTS idx_review_responses_listing ON public.review_responses(listing_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review ON public.review_responses(review_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

-- Public read on photos, services, and review responses
CREATE POLICY "Public read business_photos" ON public.business_photos
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public read business_services" ON public.business_services
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public read review_responses" ON public.review_responses
  FOR SELECT TO anon USING (true);

-- Anon can insert clicks (click tracking is public)
CREATE POLICY "Anon insert listing_clicks" ON public.listing_clicks
  FOR INSERT TO anon WITH CHECK (true);

-- Service role has full access to all tables
CREATE POLICY "Service role full access business_photos" ON public.business_photos
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access business_services" ON public.business_services
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access listing_clicks" ON public.listing_clicks
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access review_responses" ON public.review_responses
  FOR ALL TO service_role USING (true);

-- ============================================================
-- SUPABASE STORAGE BUCKET (run separately if needed)
-- The 'business-photos' bucket must be created via Supabase dashboard
-- or via the API. The SQL below documents the intended config:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('business-photos', 'business-photos', true)
-- ON CONFLICT (id) DO NOTHING;
-- ============================================================
