import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LISTINGS } from '@/data/listings';
import { REAL_LISTINGS } from '@/data/real-listings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/listings/analytics?listing=<id>&email=<email>
 * Dashboard analytics: views, clicks, city rank, profile completeness.
 */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listing');
  const email = req.nextUrl.searchParams.get('email');

  if (!listingId || !email) {
    return NextResponse.json({ error: 'Missing listing or email' }, { status: 400 });
  }

  // Verify auth
  const { data: claim } = await supabase
    .from('claims')
    .select('id, tier')
    .eq('listing_id', listingId)
    .eq('user_email', decodeURIComponent(email))
    .like('status', 'approved%')
    .single();

  if (!claim) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  // Page views this month
  const { count: viewsThisMonth } = await supabase
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('viewed_at', startOfMonth);

  // Page views last month
  const { count: viewsLastMonth } = await supabase
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('viewed_at', startOfLastMonth)
    .lt('viewed_at', startOfMonth);

  // Clicks this month
  const { count: clicksThisMonth } = await supabase
    .from('listing_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('created_at', startOfMonth);

  // Clicks last month
  const { count: clicksLastMonth } = await supabase
    .from('listing_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('created_at', startOfLastMonth)
    .lt('created_at', startOfMonth);

  // Profile completeness — check business_profiles
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('listing_id', listingId)
    .single();

  let completeness = 0;
  if (profile) {
    const fields = [
      profile.business_name,
      profile.phone,
      profile.email,
      profile.website,
      profile.address,
      profile.description,
      profile.hours,
    ];
    const filledFields = fields.filter((f) => f && String(f).trim() !== '').length;
    completeness = Math.round((filledFields / fields.length) * 100);
  }

  // City rank — find this listing's position among listings in its city
  // Use static listings as fallback since Supabase may not have all listings
  const ALL_LISTINGS = [...LISTINGS, ...REAL_LISTINGS];
  const listing = ALL_LISTINGS.find((l) => l.id === listingId);

  let cityRank: number | null = null;
  let cityTotal: number | null = null;

  if (listing) {
    const cityListings = ALL_LISTINGS.filter(
      (l) =>
        l.city.toLowerCase() === listing.city.toLowerCase() &&
        l.state_code === listing.state_code
    ).sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if (a.is_premium !== b.is_premium) return a.is_premium ? -1 : 1;
      return b.rating - a.rating;
    });

    const rank = cityListings.findIndex((l) => l.id === listingId);
    if (rank !== -1) {
      cityRank = rank + 1;
      cityTotal = cityListings.length;
    }
  }

  const tier = claim.tier || 'free';

  return NextResponse.json({
    viewsThisMonth: viewsThisMonth ?? 0,
    viewsLastMonth: viewsLastMonth ?? 0,
    clicksThisMonth: clicksThisMonth ?? 0,
    clicksLastMonth: clicksLastMonth ?? 0,
    completeness,
    cityRank,
    cityTotal,
    tier,
  });
}
