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
 * GET /api/listings/services?listing=<id>
 * Public — returns all services for a listing.
 */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listing');
  if (!listingId) {
    return NextResponse.json({ error: 'Missing listing' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('business_services')
    .select('*')
    .eq('listing_id', listingId)
    .order('sort_order')
    .order('created_at');

  if (error) {
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }

  return NextResponse.json({ services: data ?? [] });
}

/**
 * POST /api/listings/services
 * Create or update a service.
 * Body: { listing_id, email, service } where service has:
 *   id? (if updating), service_name, description?, price_from?, price_to?,
 *   duration_minutes?, sort_order?
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing_id, email, service } = body;

    if (!listing_id || !email || !service?.service_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const claim = await verifyClaim(listing_id, email);
    if (!claim) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const serviceData = {
      listing_id,
      service_name: service.service_name.trim(),
      description: service.description?.trim() || null,
      price_from: service.price_from != null ? Number(service.price_from) : null,
      price_to: service.price_to != null ? Number(service.price_to) : null,
      duration_minutes: service.duration_minutes != null ? Number(service.duration_minutes) : null,
      sort_order: service.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (service.id) {
      // Update existing
      const { data, error } = await supabase
        .from('business_services')
        .update(serviceData)
        .eq('id', service.id)
        .eq('listing_id', listing_id)
        .select()
        .single();

      if (error) {
        console.error('[SERVICES] Update error:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('business_services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        console.error('[SERVICES] Insert error:', error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({ service: result });
  } catch (err) {
    console.error('[SERVICES] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/services
 * Body: { service_id, listing_id, email }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { service_id, listing_id, email } = await req.json();

    if (!service_id || !listing_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const claim = await verifyClaim(listing_id, email);
    if (!claim) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('business_services')
      .delete()
      .eq('id', service_id)
      .eq('listing_id', listing_id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SERVICES] Delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
