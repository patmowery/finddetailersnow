import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Lightweight page view tracker.
 * POST /api/track { path, listing_id? }
 */
export async function POST(req: NextRequest) {
  try {
    const { path, listing_id } = await req.json();

    if (!path) {
      return NextResponse.json({ error: 'path required' }, { status: 400 });
    }

    // If tracking a listing page, update the listing's updated_at as a view signal
    if (listing_id) {
      await supabase
        .from('listings')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', listing_id);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail tracking
  }
}
