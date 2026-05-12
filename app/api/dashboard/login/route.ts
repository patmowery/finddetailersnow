import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://finddetailersnow.com';

/**
 * POST /api/dashboard/login
 * Send a magic login link to a claimed business owner.
 * Body: { email: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if this email has any approved claims
    const { data: claims, error: claimsErr } = await supabase
      .from('claims')
      .select('id, listing_id, status')
      .eq('user_email', normalizedEmail)
      .like('status', 'approved%');

    if (claimsErr || !claims || claims.length === 0) {
      // Don't reveal if email exists or not — always say "sent" for security
      return NextResponse.json({ success: true });
    }

    // Use the first approved claim's listing
    const claim = claims[0];

    // Generate a login token (valid 1 hour)
    const token = crypto.randomUUID();
    const { error: insertErr } = await supabase
      .from('login_tokens')
      .insert({
        token,
        email: normalizedEmail,
        listing_id: claim.listing_id,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });

    if (insertErr) {
      console.error('[LOGIN] Token insert error:', insertErr);
      return NextResponse.json({ error: 'Failed to generate login link' }, { status: 500 });
    }

    // Send the magic link email
    const loginUrl = `${BASE_URL}/api/dashboard/verify?token=${token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Your Dashboard Login Link — FindDetailersNow',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #ff6b35; border-radius: 12px; padding: 12px; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">FDN</span>
            </div>
            <h1 style="color: #1e3a5f; font-size: 24px; margin: 0;">Dashboard Login</h1>
          </div>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Click the button below to log into your business dashboard. This link expires in 1 hour.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="display: inline-block; background: #ff6b35; color: white; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">
              Log Into Dashboard →
            </a>
          </div>
          <p style="color: #a0aec0; font-size: 13px; text-align: center;">
            If you didn't request this, just ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`[LOGIN] ✅ Magic link sent to ${normalizedEmail}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
