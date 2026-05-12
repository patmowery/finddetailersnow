-- Google Reviews table
CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL,
  place_id TEXT,
  author_name TEXT NOT NULL,
  author_url TEXT,
  profile_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  relative_time TEXT,
  review_time BIGINT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, author_name, review_time)
);

CREATE INDEX IF NOT EXISTS idx_google_reviews_listing ON public.google_reviews(listing_id);

-- Google Place ID mapping table (cache so we don't re-lookup)
CREATE TABLE IF NOT EXISTS public.google_place_ids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL UNIQUE,
  place_id TEXT,
  google_name TEXT,
  google_rating NUMERIC(2,1),
  google_review_count INTEGER,
  last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_place_ids_listing ON public.google_place_ids(listing_id);

-- RLS policies
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_place_ids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full google_reviews" ON public.google_reviews FOR ALL TO service_role USING (true);
CREATE POLICY "Anon read google_reviews" ON public.google_reviews FOR SELECT TO anon USING (true);

CREATE POLICY "Service role full google_place_ids" ON public.google_place_ids FOR ALL TO service_role USING (true);
CREATE POLICY "Anon read google_place_ids" ON public.google_place_ids FOR SELECT TO anon USING (true);
