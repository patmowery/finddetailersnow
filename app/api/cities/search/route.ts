import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/data';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (q.length < 2) return NextResponse.json([]);

  const cities = await searchCities(q);
  return NextResponse.json(cities);
}
