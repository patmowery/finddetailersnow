/**
 * Static data access layer — replaces Supabase for the MVP.
 * All functions mirror the interface in lib/supabase.ts so pages
 * can import from either file without changing call-sites.
 */

import { CITIES } from '@/data/cities';
import { LISTINGS, REVIEWS } from '@/data/listings';
import type { Listing, Review, City, ServiceType } from '@/types';

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

  let results = LISTINGS.filter(
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
  return LISTINGS.find((l) => l.slug === slug) ?? null;
}

export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  return LISTINGS.filter((l) => l.is_featured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export async function getAllListingSlugs(): Promise<
  { slug: string; city: string; state_code: string }[]
> {
  return LISTINGS.map((l) => ({
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
    (a, b) => (b.population ?? 0) - (a.population ?? 0)
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
  return LISTINGS.filter((l) =>
    l.business_name.toLowerCase().includes(q)
  )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
}
