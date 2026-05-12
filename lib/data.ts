/**
 * Static data access layer — replaces Supabase for the MVP.
 * All functions mirror the interface in lib/supabase.ts so pages
 * can import from either file without changing call-sites.
 *
 * Claimed business profiles stored in Supabase `business_profiles`
 * are merged on top of static data so profile edits appear on
 * listing pages, search results, and city pages.
 */

import { CITIES } from '@/data/cities';
import { LISTINGS, REVIEWS } from '@/data/listings';
import { REAL_LISTINGS } from '@/data/real-listings';
import type { Listing, Review, City, ServiceType } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Merge sample listings with real scraped data
const ALL_LISTINGS: Listing[] = [...LISTINGS, ...REAL_LISTINGS];

// ── Supabase profile overlay ──────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Cache profiles for 60s to avoid hitting Supabase on every page load
let profileCache: Map<string, Record<string, unknown>> | null = null;
let profileCacheTime = 0;
const CACHE_TTL_MS = 60_000;

async function getBusinessProfiles(): Promise<Map<string, Record<string, unknown>>> {
  const now = Date.now();
  if (profileCache && now - profileCacheTime < CACHE_TTL_MS) {
    return profileCache;
  }

  if (!supabase) {
    return new Map();
  }

  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*');

    if (error || !data) {
      console.error('[DATA] Failed to load business profiles:', error?.message);
      return profileCache ?? new Map();
    }

    const map = new Map<string, Record<string, unknown>>();
    for (const p of data) {
      if (p.listing_id) {
        map.set(p.listing_id, p);
      }
    }
    profileCache = map;
    profileCacheTime = now;
    return map;
  } catch (err) {
    console.error('[DATA] Error fetching business profiles:', err);
    return profileCache ?? new Map();
  }
}

/**
 * Merge a Supabase business_profile on top of a static listing.
 * Profile fields override static fields when non-empty.
 */
function applyProfile(listing: Listing, profile: Record<string, unknown>): Listing {
  const merged = { ...listing };

  // Only override if the profile field is non-empty
  const str = (v: unknown) => typeof v === 'string' && v.trim() !== '' ? v as string : null;

  if (str(profile.business_name)) merged.business_name = str(profile.business_name)!;
  if (str(profile.phone)) merged.phone = str(profile.phone)!;
  if (str(profile.email)) merged.email = str(profile.email)!;
  if (str(profile.website)) merged.website = str(profile.website)!;
  if (str(profile.description)) merged.description = str(profile.description)!;
  if (str(profile.hours)) {
    // Store hours in description addendum or as-is (no dedicated field in Listing type)
    // We'll append it if description exists
  }
  if (str(profile.booking_url)) merged.website = merged.website || str(profile.booking_url)!;

  // Address fields
  if (str(profile.address)) merged.address = str(profile.address)!;
  if (str(profile.city)) merged.city = str(profile.city)!;
  if (str(profile.state_code)) merged.state_code = str(profile.state_code)!;

  // Services — override if profile has any
  if (Array.isArray(profile.services) && profile.services.length > 0) {
    merged.services = profile.services as ServiceType[];
  }

  // Mark as claimed since they have a profile
  merged.is_claimed = true;
  merged.updated_at = str(profile.updated_at) || merged.updated_at;

  return merged;
}

/**
 * Get all listings with Supabase profile overrides applied.
 */
async function getAllListingsWithProfiles(): Promise<Listing[]> {
  const profiles = await getBusinessProfiles();
  if (profiles.size === 0) return ALL_LISTINGS;

  return ALL_LISTINGS.map(listing => {
    const profile = profiles.get(listing.id);
    return profile ? applyProfile(listing, profile) : listing;
  });
}

// ── Listings ──────────────────────────────────────────────────────────────────

export async function getListingsByCity(
  city: string,
  stateCode: string,
  options?: {
    services?: ServiceType[];
    minRating?: number;
    priceRange?: string[];
    limit?: number;
    offset?: number;
  }
): Promise<Listing[]> {
  const normalizedCity = city.replace(/-/g, ' ').toLowerCase();
  const normalizedState = stateCode.toUpperCase();

  const allListings = await getAllListingsWithProfiles();
  let results = allListings.filter(
    (l) =>
      l.city.toLowerCase() === normalizedCity &&
      l.state_code === normalizedState
  );

  if (options?.services?.length) {
    results = results.filter((l) =>
      options.services!.some((s) => l.services.includes(s))
    );
  }
  if (options?.minRating !== undefined) {
    results = results.filter((l) => l.rating >= options.minRating!);
  }
  if (options?.priceRange?.length) {
    results = results.filter(
      (l) => l.price_range && options.priceRange!.includes(l.price_range)
    );
  }

  // Sort: featured → premium → rating desc
  results.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    if (a.is_premium !== b.is_premium) return a.is_premium ? -1 : 1;
    return b.rating - a.rating;
  });

  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 50;
  return results.slice(offset, offset + limit);
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const allListings = await getAllListingsWithProfiles();
  return allListings.find((l) => l.slug === slug) ?? null;
}

export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  const allListings = await getAllListingsWithProfiles();
  return allListings.filter((l) => l.is_featured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export async function getAllListingSlugs(): Promise<
  { slug: string; city: string; state_code: string }[]
> {
  const allListings = await getAllListingsWithProfiles();
  return allListings.map((l) => ({
    slug: l.slug,
    city: l.city,
    state_code: l.state_code,
  }));
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviewsByListing(listingId: string): Promise<Review[]> {
  return REVIEWS.filter((r) => r.listing_id === listingId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function submitReview(_review: {
  listing_id: string;
  author_name: string;
  rating: number;
  comment?: string;
}): Promise<{ error: string | null }> {
  // Static MVP — no persistence
  return { error: null };
}

// ── Cities ────────────────────────────────────────────────────────────────────

export async function getCitiesByState(stateCode: string): Promise<City[]> {
  return CITIES.filter((c) => c.state_code === stateCode.toUpperCase()).sort(
    (a, b) => a.name.localeCompare(b.name)
  );
}

export async function getCityBySlug(slug: string, stateCode: string): Promise<City | null> {
  return (
    CITIES.find(
      (c) =>
        c.slug === slug && c.state_code === stateCode.toUpperCase()
    ) ?? null
  );
}

export async function getAllCities(): Promise<City[]> {
  return [...CITIES].sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
}

// ── Claims ────────────────────────────────────────────────────────────────────

export async function submitClaim(_claim: {
  listing_id: string;
  user_email: string;
}): Promise<{ error: string | null }> {
  // Static MVP — no persistence
  return { error: null };
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchCities(query: string): Promise<City[]> {
  const q = query.toLowerCase();
  return CITIES.filter((c) => c.name.toLowerCase().startsWith(q))
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, 8);
}

export async function searchListings(query: string): Promise<Listing[]> {
  const q = query.toLowerCase();
  const allListings = await getAllListingsWithProfiles();
  return allListings.filter((l) =>
    l.business_name.toLowerCase().includes(q)
  )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
}

// ── Business photos overlay ────────────────────────────────────────────────────

export interface BusinessPhoto {
  id: string;
  listing_id: string;
  photo_type: 'cover' | 'logo' | 'gallery';
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export async function getBusinessPhotos(listingId: string): Promise<BusinessPhoto[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('business_photos')
      .select('*')
      .eq('listing_id', listingId)
      .order('photo_type')
      .order('sort_order');
    if (error) return [];
    return (data ?? []) as BusinessPhoto[];
  } catch {
    return [];
  }
}

// ── Business services overlay ──────────────────────────────────────────────────

export interface BusinessService {
  id: string;
  listing_id: string;
  service_name: string;
  description: string | null;
  price_from: number | null;
  price_to: number | null;
  duration_minutes: number | null;
  sort_order: number;
}

export async function getBusinessServices(listingId: string): Promise<BusinessService[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('business_services')
      .select('*')
      .eq('listing_id', listingId)
      .order('sort_order')
      .order('created_at');
    if (error) return [];
    return (data ?? []) as BusinessService[];
  } catch {
    return [];
  }
}

// ── Review responses overlay ───────────────────────────────────────────────────

export interface ReviewResponse {
  id: string;
  listing_id: string;
  review_id: string;
  response_text: string;
  responded_at: string;
}

export async function getReviewResponses(listingId: string): Promise<ReviewResponse[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('review_responses')
      .select('*')
      .eq('listing_id', listingId);
    if (error) return [];
    return (data ?? []) as ReviewResponse[];
  } catch {
    return [];
  }
}
