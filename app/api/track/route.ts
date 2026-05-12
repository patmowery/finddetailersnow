import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Lightweight page view tracker.
 * POST /api/track { path, listing_id?, referrer? }
 */
export async function POST(req: NextRequest) {
  try {
    const { path, listing_id, referrer } = await req.json();

    if (!path) {
      return NextResponse.json({ error: 'path required' }, { status: 400 });
    }

    // Only store listing_id if it looks like a UUID (page_views.listing_id is uuid FK)
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const safeListingId = listing_id && UUID_RE.test(listing_id) ? listing_id : null;

    // Insert a page_view record
    await supabase.from('page_views').insert({
      path,
      listing_id: safeListingId,
      referrer: referrer || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail tracking
  }
}
