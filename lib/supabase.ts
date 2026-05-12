import { createClient } from '@supabase/supabase-js';
import type { Listing, Review, City } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key (for server-side operations like webhooks)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// ── Listings ──────────────────────────────────────────────────────────────────

export async function getListingsByCity(
  city: string,
  stateCode: string,
  options?: {
    services?: string[];
    minRating?: number;
    priceRange?: string[];
    limit?: number;
    offset?: number;
  }
): Promise<Listing[]> {
  let query = supabase
    .from('listings')
    .select('*')
    .ilike('city', city.replace(/-/g, ' '))
    .eq('state_code', stateCode.toUpperCase())
    .order('is_featured', { ascending: false })
    .order('is_premium', { ascending: false })
    .order('rating', { ascending: false });

  if (options?.services?.length) {
    query = query.overlaps('services', options.services);
  }
  if (options?.minRating) {
    query = query.gte('rating', options.minRating);
  }
  if (options?.priceRange?.length) {
    query = query.in('price_range', options.priceRange);
  }

  const { data } = await query
    .limit(options?.limit ?? 50)
    .range(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 50) - 1);

  return data ?? [];
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .single();
  return data ?? null;
}

export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllListingSlugs(): Promise<
  { slug: string; city: string; state_code: string }[]
> {
  const { data } = await supabase
    .from('listings')
    .select('slug, city, state_code');
  return data ?? [];
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviewsByListing(listingId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function submitReview(review: {
  listing_id: string;
  author_name: string;
  rating: number;
  comment?: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reviews').insert(review);
  return { error: error?.message ?? null };
}

// ── Cities ────────────────────────────────────────────────────────────────────

export async function getCitiesByState(stateCode: string): Promise<City[]> {
  const { data } = await supabase
    .from('cities')
    .select('*')
    .eq('state_code', stateCode.toUpperCase())
    .order('population', { ascending: false });
  return data ?? [];
}

export async function getCityBySlug(slug: string, stateCode: string): Promise<City | null> {
  const { data } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .eq('state_code', stateCode.toUpperCase())
    .single();
  return data ?? null;
}

export async function getAllCities(): Promise<City[]> {
  const { data } = await supabase
    .from('cities')
    .select('*')
    .order('population', { ascending: false });
  return data ?? [];
}

// ── Claims ────────────────────────────────────────────────────────────────────

export async function submitClaim(claim: {
  listing_id: string;
  user_email: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('claims').insert(claim);
  return { error: error?.message ?? null };
}

// ── Search autocomplete ────────────────────────────────────────────────────────

export async function searchCities(query: string): Promise<City[]> {
  const { data } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', `${query}%`)
    .order('population', { ascending: false })
    .limit(8);
  return data ?? [];
}
