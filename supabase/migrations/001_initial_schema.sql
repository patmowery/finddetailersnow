-- FindDetailersNow.com Initial Schema
-- Migration: 001_initial_schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- CITIES TABLE
-- ============================================================
CREATE TABLE cities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  state       TEXT NOT NULL,
  state_code  TEXT NOT NULL,
  population  INTEGER,
  lat         DECIMAL(10, 7),
  lng         DECIMAL(10, 7),
  UNIQUE (slug, state_code)
);

CREATE INDEX idx_cities_state_code ON cities (state_code);
CREATE INDEX idx_cities_slug ON cities (slug);

-- ============================================================
-- LISTINGS TABLE
-- ============================================================
CREATE TYPE service_type AS ENUM (
  'detailing',
  'ceramic_coating',
  'ppf',
  'paint_correction',
  'interior',
  'mobile'
);

CREATE TYPE price_range_type AS ENUM ('$', '$$', '$$$', '$$$$');

CREATE TABLE listings (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name      TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  phone              TEXT,
  email              TEXT,
  website            TEXT,
  description        TEXT,
  services           service_type[] NOT NULL DEFAULT '{}',
  address            TEXT,
  city               TEXT NOT NULL,
  state              TEXT NOT NULL,
  state_code         TEXT NOT NULL,
  zip                TEXT,
  lat                DECIMAL(10, 7),
  lng                DECIMAL(10, 7),
  logo_url           TEXT,
  cover_image_url    TEXT,
  is_claimed         BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium         BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured        BOOLEAN NOT NULL DEFAULT FALSE,
  rating             DECIMAL(3, 2) DEFAULT 0,
  review_count       INTEGER NOT NULL DEFAULT 0,
  price_range        price_range_type,
  years_in_business  INTEGER,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_state_code ON listings (state_code);
CREATE INDEX idx_listings_city_state ON listings (city, state_code);
CREATE INDEX idx_listings_slug ON listings (slug);
CREATE INDEX idx_listings_is_featured ON listings (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_listings_is_premium ON listings (is_premium) WHERE is_premium = TRUE;
CREATE INDEX idx_listings_rating ON listings (rating DESC);
CREATE INDEX idx_listings_services ON listings USING GIN (services);
CREATE INDEX idx_listings_search ON listings USING GIN (
  to_tsvector('english', business_name || ' ' || COALESCE(description, ''))
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_listing_id ON reviews (listing_id);
CREATE INDEX idx_reviews_rating ON reviews (rating);

-- ============================================================
-- CLAIMS TABLE
-- ============================================================
CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE claims (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_email   TEXT NOT NULL,
  status       claim_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claims_listing_id ON claims (listing_id);
CREATE INDEX idx_claims_status ON claims (status);
CREATE INDEX idx_claims_user_email ON claims (user_email);

-- ============================================================
-- TRIGGER: auto-update updated_at on listings
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: recalculate listing rating when review added/updated/deleted
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_listing_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_listing_id UUID;
BEGIN
  v_listing_id := COALESCE(NEW.listing_id, OLD.listing_id);
  UPDATE listings
  SET
    rating       = (SELECT COALESCE(AVG(rating::DECIMAL), 0) FROM reviews WHERE listing_id = v_listing_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE listing_id = v_listing_id)
  WHERE id = v_listing_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_refresh_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_listing_rating();
