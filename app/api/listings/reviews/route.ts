import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyClaim(listingId: string, email: string) {
  const { data } = await supabase
    .from('claims')
    .select('id, tier')
    .eq('listing_id', listingId)
    .eq('user_email', email)
    .like('status', 'approved%')
    .single();
  return data;
}

/**
 * GET /api/listings/reviews?listing=<id>
 * Public — returns reviews with any owner responses attached.
 * Reviews come from Supabase (if any) and responses are always from DB.
 */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listing');
  if (!listingId) {
    return NextResponse.json({ error: 'Missing listing' }, { status: 400 });
  }

  // Fetch Supabase reviews for this listing
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  // Fetch owner responses for this listing
  const { data: responses } = await supabase
    .from('review_responses')
    .select('*')
    .eq('listing_id', listingId);

  const responseMap = new Map<string, { response_text: string; responded_at: string }>();
  for (const r of responses ?? []) {
    responseMap.set(r.review_id, {
      response_text: r.response_text,
      responded_at: r.responded_at,
    });
  }

  const reviewsWithResponses = (reviews ?? []).map((review) => ({
    ...review,
    owner_response: responseMap.get(review.id) ?? null,
  }));

  return NextResponse.json({ reviews: reviewsWithResponses, responses: responses ?? [] });
}

/**
 * POST /api/listings/reviews
 * Add or update an owner response to a review.
 * Body: { listing_id, email, review_id, response_text }
 */
export async function POST(req: NextRequest) {
  try {
    const { listing_id, email, review_id, response_text } = await req.json();

    if (!listing_id || !email || !review_id || !response_text?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const claim = await verifyClaim(listing_id, email);
    if (!claim) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('review_responses')
      .upsert(
        {
          listing_id,
          review_id,
          response_text: response_text.trim(),
          responded_at: new Date().toISOString(),
        },
        { onConflict: 'review_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[REVIEWS] Response upsert error:', error);
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
    }

    return NextResponse.json({ response: data });
  } catch (err) {
    console.error('[REVIEWS] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/reviews
 * Delete an owner response.
 * Body: { listing_id, email, review_id }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { listing_id, email, review_id } = await req.json();

    if (!listing_id || !email || !review_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const claim = await verifyClaim(listing_id, email);
    if (!claim) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await supabase
      .from('review_responses')
      .delete()
      .eq('review_id', review_id)
      .eq('listing_id', listing_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[REVIEWS] Delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
