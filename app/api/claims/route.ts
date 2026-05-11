import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Claim a business listing.
 * POST /api/claims { listing_id, user_email, business_name, message }
 * 
 * Flow:
 * 1. Validate input
 * 2. Check if already claimed
 * 3. Insert claim record (status: pending)
 * 4. Generate verification token
 * 5. Send verification email
 * 6. Return success
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
    // If not in Supabase, it's a static listing — still accept the claim

    if (isClaimed) {
      return NextResponse.json(
        { error: 'This listing has already been claimed' },
        { status: 409 }
      );
    }

    // Insert claim into Supabase
    let claimId: string | null = null;
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
      claimId = claim.id;
    } catch (dbError) {
      // If Supabase insert fails (e.g. FK constraint), log and continue
      console.log(`[CLAIM-MANUAL] Static listing claim: "${listingName}" (${listing_id}) by ${user_email}`);
    }

    // Generate verification token
    const token = randomUUID();
    
    try {
      await supabase
        .from('verification_tokens')
        .insert({
          token,
          email: user_email,
          claim_id: claimId,
          business_name: listingName,
          listing_id_static: listing ? null : listing_id,
        });
    } catch (tokenErr) {
      console.error('[CLAIM] Failed to store verification token:', tokenErr);
    }

    // Send verification email
    try {
      await sendVerificationEmail(user_email, token, listingName);
      console.log(`[CLAIM] ✉️ Verification email sent to ${user_email} for "${listingName}"`);
    } catch (emailErr) {
      console.error('[CLAIM] Failed to send verification email:', emailErr);
      // Still return success — claim is recorded, we can verify manually
    }

    console.log(`[CLAIM] #${claimId || 'manual'} for "${listingName}" by ${user_email}. Static ID: ${listing_id}. Message: ${message || 'N/A'}`);

    return NextResponse.json({
      success: true,
      claim_id: claimId || 'pending-manual',
      message: `Claim submitted! We've sent a verification email to ${user_email}. Click the link in the email to verify your business.`,
    });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
