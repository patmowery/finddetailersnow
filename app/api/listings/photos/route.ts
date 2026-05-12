import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PHOTO_LIMITS: Record<string, number> = {
  free: 10,
  pro: 25,
  featured: 50,
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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
 * GET /api/listings/photos?listing=<id>
 * Public — returns all photos for a listing.
 */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listing');
  if (!listingId) {
    return NextResponse.json({ error: 'Missing listing' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('business_photos')
    .select('*')
    .eq('listing_id', listingId)
    .order('photo_type')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 });
  }

  return NextResponse.json({ photos: data ?? [] });
}

/**
 * POST /api/listings/photos
 * Upload a photo. Expects FormData: file, listing_id, email, photo_type, alt_text
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const listingId = formData.get('listing_id') as string;
    const email = formData.get('email') as string;
    const photoType = formData.get('photo_type') as string;
    const altText = (formData.get('alt_text') as string) || '';

    if (!file || !listingId || !email || !photoType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['cover', 'logo', 'gallery'].includes(photoType)) {
      return NextResponse.json({ error: 'Invalid photo_type' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 });
    }

    // Verify auth
    const claim = await verifyClaim(listingId, email);
    if (!claim) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tier = claim.tier || 'free';

    // For gallery photos, check the limit
    if (photoType === 'gallery') {
      const { count } = await supabase
        .from('business_photos')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId)
        .eq('photo_type', 'gallery');

      const limit = PHOTO_LIMITS[tier] ?? PHOTO_LIMITS.free;
      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: `Gallery limit reached for ${tier} tier (${limit} photos)` },
          { status: 400 }
        );
      }
    }

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop() ?? 'jpg';
    const timestamp = Date.now();
    const storagePath = `${listingId}/${photoType}/${timestamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('business-photos')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: photoType !== 'gallery', // overwrite cover/logo, append for gallery
      });

    if (uploadError) {
      console.error('[PHOTOS] Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed — storage error' }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('business-photos')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // For cover/logo, delete the previous one from DB (storage path was upserted above)
    if (photoType === 'cover' || photoType === 'logo') {
      const { data: existing } = await supabase
        .from('business_photos')
        .select('storage_path')
        .eq('listing_id', listingId)
        .eq('photo_type', photoType);

      if (existing && existing.length > 0) {
        const oldPaths = existing.map((r) => r.storage_path).filter(Boolean);
        if (oldPaths.length > 0) {
          await supabase.storage.from('business-photos').remove(oldPaths);
        }
        await supabase
          .from('business_photos')
          .delete()
          .eq('listing_id', listingId)
          .eq('photo_type', photoType);
      }
    }

    // Insert photo metadata
    const { data: photo, error: insertError } = await supabase
      .from('business_photos')
      .insert({
        listing_id: listingId,
        photo_type: photoType,
        url: publicUrl,
        storage_path: storagePath,
        alt_text: altText,
        sort_order: timestamp,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[PHOTOS] DB insert error:', insertError);
      return NextResponse.json({ error: 'Upload recorded but metadata save failed' }, { status: 500 });
    }

    return NextResponse.json({ photo });
  } catch (err) {
    console.error('[PHOTOS] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/photos
 * Body: { photo_id, listing_id, email }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { photo_id, listing_id, email } = await req.json();

    if (!photo_id || !listing_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const claim = await verifyClaim(listing_id, email);
    if (!claim) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get photo to find storage path
    const { data: photo } = await supabase
      .from('business_photos')
      .select('storage_path')
      .eq('id', photo_id)
      .eq('listing_id', listing_id)
      .single();

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Remove from storage
    if (photo.storage_path) {
      await supabase.storage.from('business-photos').remove([photo.storage_path]);
    }

    // Remove from DB
    await supabase
      .from('business_photos')
      .delete()
      .eq('id', photo_id)
      .eq('listing_id', listing_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PHOTOS] Delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
