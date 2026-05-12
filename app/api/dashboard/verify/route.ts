import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/dashboard/verify?token=<token>
 * Verify a magic login link and redirect to dashboard.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/dashboard/login?error=missing_token', req.url));
  }

  try {
    // Look up token
    const { data: loginToken, error } = await supabase
      .from('login_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !loginToken) {
      return NextResponse.redirect(new URL('/dashboard/login?error=invalid', req.url));
    }

    // Check if used
    if (loginToken.used_at) {
      // Still redirect to dashboard if we have the info — link was already used but that's OK
      if (loginToken.listing_id && loginToken.email) {
        return NextResponse.redirect(
          new URL(`/dashboard?listing=${loginToken.listing_id}&email=${encodeURIComponent(loginToken.email)}`, req.url)
        );
      }
      return NextResponse.redirect(new URL('/dashboard/login?error=used', req.url));
    }

    // Check expiry
    const expiresAt = new Date(loginToken.expires_at);
    if (new Date() > expiresAt) {
      return NextResponse.redirect(new URL('/dashboard/login?error=expired', req.url));
    }

    // Mark as used
    await supabase
      .from('login_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', loginToken.id);

    console.log(`[LOGIN] ✅ Verified login for ${loginToken.email}`);

    // Redirect to dashboard with auth params
    return NextResponse.redirect(
      new URL(`/dashboard?listing=${loginToken.listing_id}&email=${encodeURIComponent(loginToken.email)}`, req.url)
    );
  } catch (err) {
    console.error('[LOGIN VERIFY] Error:', err);
    return NextResponse.redirect(new URL('/dashboard/login?error=server_error', req.url));
  }
}
