import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Claim a business listing.
 * POST /api/claims { listing_id, user_email, business_name, message }
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

    // Check if listing exists
    const { data: listing } = await supabase
      .from('listings')
      .select('id, business_name, is_claimed')
      .eq('id', listing_id)
      .single();

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.is_claimed) {
      return NextResponse.json(
        { error: 'This listing has already been claimed' },
        { status: 409 }
      );
    }

    // Check for existing pending claim
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('id, status')
      .eq('listing_id', listing_id)
      .eq('status', 'pending')
      .single();

    if (existingClaim) {
      return NextResponse.json(
        { error: 'A claim is already pending for this listing' },
        { status: 409 }
      );
    }

    // Create claim record
    const { data: claim, error } = await supabase
      .from('claims')
      .insert({
        listing_id,
        user_email,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Claim insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create claim' },
        { status: 500 }
      );
    }

    // Log extra info for manual review
    console.log(`[CLAIM] New claim #${claim.id} for "${listing.business_name}" by ${user_email}. Name: ${business_name || 'N/A'}. Message: ${message || 'N/A'}`);

    return NextResponse.json({
      success: true,
      claim_id: claim.id,
      message: `Claim submitted for "${listing.business_name}"! We'll verify your ownership and contact you at ${user_email}.`,
    });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
