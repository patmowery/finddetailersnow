-- FindDetailersNow.com Row Level Security Policies
-- Migration: 002_rls_policies

-- Enable RLS on all tables
ALTER TABLE cities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CITIES: public read, no public write
-- ============================================================
CREATE POLICY "cities_public_read" ON cities
  FOR SELECT USING (TRUE);

-- ============================================================
-- LISTINGS: public read, no public write
-- ============================================================
CREATE POLICY "listings_public_read" ON listings
  FOR SELECT USING (TRUE);

-- ============================================================
-- REVIEWS: public read; anyone can insert
-- ============================================================
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "reviews_public_insert" ON reviews
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- CLAIMS: anyone can insert; only service role reads all
-- ============================================================
CREATE POLICY "claims_public_insert" ON claims
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "claims_service_read" ON claims
  FOR SELECT USING (auth.role() = 'service_role');
