import { NextRequest, NextResponse } from 'next/server';
import { submitClaim } from '@/lib/data';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listing_id, user_email } = body;

  if (!listing_id || !user_email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await submitClaim({ listing_id, user_email });
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
