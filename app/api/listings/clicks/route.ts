import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_CLICK_TYPES = ['phone', 'email', 'website', 'directions', 'booking'];

/**
 * POST /api/listings/clicks
 * Track a contact link click. Public — no auth required.
 * Body: { listing_id, click_type, referrer? }
 */
export async function POST(req: NextRequest) {
  try {
    const { listing_id, click_type, referrer } = await req.json();

    if (!listing_id || !click_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_CLICK_TYPES.includes(click_type)) {
      return NextResponse.json({ error: 'Invalid click_type' }, { status: 400 });
    }

    await supabase.from('listing_clicks').insert({
      listing_id,
      click_type,
      referrer: referrer || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never fail click tracking
    return NextResponse.json({ ok: true });
  }
}

/**
 * GET /api/listings/clicks?listing=<id>&email=<email>
 * Dashboard summary — requires auth.
 * Returns click counts by type for current month and last month.
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
    .select('id')
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
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  // This month's clicks
  const { data: thisMonth } = await supabase
    .from('listing_clicks')
    .select('click_type, created_at')
    .eq('listing_id', listingId)
    .gte('created_at', startOfMonth);

  // Last month's clicks
  const { data: lastMonth } = await supabase
    .from('listing_clicks')
    .select('click_type, created_at')
    .eq('listing_id', listingId)
    .gte('created_at', startOfLastMonth)
    .lte('created_at', endOfLastMonth);

  // Aggregate by type
  const aggregateByType = (rows: { click_type: string }[] | null) => {
    const counts: Record<string, number> = {
      phone: 0,
      email: 0,
      website: 0,
      directions: 0,
      booking: 0,
    };
    for (const row of rows ?? []) {
      if (row.click_type in counts) counts[row.click_type]++;
    }
    return counts;
  };

  const thisMonthCounts = aggregateByType(thisMonth);
  const lastMonthCounts = aggregateByType(lastMonth);

  const totalThisMonth = Object.values(thisMonthCounts).reduce((a, b) => a + b, 0);
  const totalLastMonth = Object.values(lastMonthCounts).reduce((a, b) => a + b, 0);

  // Daily clicks for the current month (for a simple chart)
  const dailyCounts: Record<string, number> = {};
  for (const row of thisMonth ?? []) {
    const day = row.created_at.slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
  }

  return NextResponse.json({
    thisMonth: thisMonthCounts,
    lastMonth: lastMonthCounts,
    totalThisMonth,
    totalLastMonth,
    daily: dailyCounts,
  });
}
