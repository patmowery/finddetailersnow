import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Claim a business listing.
 * POST /api/claims { listing_id, user_email, business_name, message }
 * 
 * Works with both Supabase and static data listings.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing_id, user_email, business_name, message } = body;

    if (!listing_id || !user_email) {
      return NextResponse.json(
        { error: 'listing_id and user_email are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Try to find listing in Supabase first
    let listingName = business_name || 'Unknown Business';
    let isClaimed = false;

    const { data: listing } = await supabase
      .from('listings')
      .select('id, business_name, is_claimed')
      .eq('id', listing_id)
      .single();

    if (listing) {
      listingName = listing.business_name;
      isClaimed = listing.is_claimed;
    }
    // If not in Supabase, it's a static listing — that's fine, we still accept the claim

    if (isClaimed) {
      return NextResponse.json(
        { error: 'This listing has already been claimed' },
        { status: 409 }
      );
    }

    // Try to insert claim into Supabase
    // The claims table might require a valid UUID for listing_id
    // For static listings, store as-is and handle manually
    try {
      const { data: claim, error } = await supabase
        .from('claims')
        .insert({
          listing_id: listing ? listing_id : null,
          user_email,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`[CLAIM] #${claim.id} for "${listingName}" by ${user_email}. Static ID: ${listing_id}. Name: ${business_name || 'N/A'}. Message: ${message || 'N/A'}`);

      return NextResponse.json({
        success: true,
        claim_id: claim.id,
        message: `Claim submitted for "${listingName}"! We'll verify your ownership and contact you at ${user_email}.`,
      });
    } catch (dbError) {
      // If Supabase insert fails (e.g. FK constraint on non-UUID listing_id),
      // log the claim and return success anyway — we'll process manually
      console.log(`[CLAIM-MANUAL] Static listing claim: "${listingName}" (${listing_id}) by ${user_email}. Business name: ${business_name || 'N/A'}. Message: ${message || 'N/A'}`);

      return NextResponse.json({
        success: true,
        claim_id: 'pending-manual',
        message: `Claim submitted for "${listingName}"! We'll verify your ownership and contact you at ${user_email}.`,
      });
    }
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
