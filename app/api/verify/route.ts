import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendClaimApprovedEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/verify?token=<token>
 * Verifies a claim via email link click.
 * - Validates token exists and hasn't expired (48h)
 * - Marks claim as approved
 * - Marks listing as claimed (if in Supabase)
 * - Sends confirmation email
 * - Redirects to success page
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/claim/error?reason=missing_token', req.url));
  }

  try {
    // Look up the verification token
    const { data: verification, error: verifyError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (verifyError || !verification) {
      console.error('[VERIFY] Token not found:', token);
      return NextResponse.redirect(new URL('/claim/error?reason=invalid_token', req.url));
    }

    // Check if already used
    if (verification.used_at) {
      return NextResponse.redirect(new URL('/claim/success?already=true', req.url));
    }

    // Check expiry (48 hours)
    const createdAt = new Date(verification.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) {
      return NextResponse.redirect(new URL('/claim/error?reason=expired', req.url));
    }

    // Mark token as used
    await supabase
      .from('verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', verification.id);

    // Update the claim to approved
    if (verification.claim_id) {
      await supabase
        .from('claims')
        .update({ status: 'approved' })
        .eq('id', verification.claim_id);

      // If the claim has a valid listing_id, mark listing as claimed
      const { data: claim } = await supabase
        .from('claims')
        .select('listing_id')
        .eq('id', verification.claim_id)
        .single();

      if (claim?.listing_id) {
        await supabase
          .from('listings')
          .update({ is_claimed: true })
          .eq('id', claim.listing_id);
      }
    }

    // Send confirmation email
    try {
      await sendClaimApprovedEmail(
        verification.email,
        verification.business_name || 'Your Business'
      );
    } catch (emailErr) {
      console.error('[VERIFY] Failed to send confirmation email:', emailErr);
      // Don't fail the verification just because confirmation email failed
    }

    console.log(`[VERIFY] ✅ Claim verified: ${verification.email} for "${verification.business_name}"`);

    return NextResponse.redirect(new URL('/claim/success', req.url));
  } catch (err) {
    console.error('[VERIFY] Error:', err);
    return NextResponse.redirect(new URL('/claim/error?reason=server_error', req.url));
  }
}
