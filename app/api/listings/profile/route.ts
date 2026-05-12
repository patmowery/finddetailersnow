import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/listings/profile?listing=<id>&email=<email>
 * Load business profile for editing.
 * Verifies email matches an approved claim for this listing.
 */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listing');
  const email = req.nextUrl.searchParams.get('email');

  if (!listingId || !email) {
    return NextResponse.json({ error: 'Missing listing or email' }, { status: 400 });
  }

  // Verify this email has an approved claim for this listing
  // Status can be 'approved', 'approved_pro', 'approved_featured', etc.
  const { data: claim } = await supabase
    .from('claims')
    .select('*')
    .eq('listing_id', listingId)
    .eq('user_email', decodeURIComponent(email))
    .like('status', 'approved%')
    .single();

  if (!claim) {
    return NextResponse.json({ error: 'No approved claim found' }, { status: 403 });
  }

  // Check if we have a profile in Supabase business_profiles
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('listing_id', listingId)
    .single();

  if (profile) {
    return NextResponse.json({
      profile: {
        business_name: profile.business_name || '',
        phone: profile.phone || '',
        email: profile.email || claim.user_email || '',
        website: profile.website || '',
        address: profile.address || '',
        city: profile.city || '',
        state_code: profile.state_code || '',
        description: profile.description || '',
        services: profile.services || [],
        hours: profile.hours || '',
        booking_url: profile.booking_url || '',
      },
      tier: claim.tier || 'free',
    });
  }

  // No profile yet — return empty with claim info
  return NextResponse.json({
    profile: null,
    tier: claim.tier || 'free',
  });
}

/**
 * POST /api/listings/profile
 * Save/update business profile.
 */
export async function POST(req: NextRequest) {
  try {
    const { listingId, email, profile } = await req.json();

    if (!listingId || !email) {
      return NextResponse.json({ error: 'Missing listing ID or email' }, { status: 400 });
    }

    // Verify approved claim (status: approved, approved_pro, approved_featured)
    const { data: claim } = await supabase
      .from('claims')
      .select('id, tier')
      .eq('listing_id', listingId)
      .eq('user_email', email)
      .like('status', 'approved%')
      .single();

    if (!claim) {
      return NextResponse.json({ error: 'Unauthorized — no approved claim' }, { status: 403 });
    }

    // Upsert into business_profiles
    const profileData = {
      listing_id: listingId,
      claim_id: claim.id,
      email,
      business_name: profile.business_name || '',
      phone: profile.phone || '',
      website: profile.website || '',
      address: profile.address || '',
      city: profile.city || '',
      state_code: profile.state_code || '',
      description: profile.description || '',
      services: profile.services || [],
      hours: profile.hours || '',
      booking_url: profile.booking_url || '',
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from('business_profiles')
      .upsert(profileData, { onConflict: 'listing_id' });

    if (upsertErr) {
      console.error('[PROFILE] Upsert error:', upsertErr);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    console.log(`[PROFILE] ✅ Saved profile for ${profile.business_name} (${listingId})`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PROFILE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
