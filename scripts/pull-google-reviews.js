#!/usr/bin/env node
/**
 * Pull Google Reviews for all listings in FindDetailersNow
 * 
 * Flow:
 * 1. Load all listings from real-listings.ts
 * 2. For each listing, find the Google Place ID (or use cached)
 * 3. Fetch reviews from Place Details API
 * 4. Store reviews + place metadata in Supabase
 * 
 * Usage:
 *   node scripts/pull-google-reviews.js              # Process all listings
 *   node scripts/pull-google-reviews.js --limit 50   # Process first 50
 *   node scripts/pull-google-reviews.js --skip 100   # Skip first 100
 *   node scripts/pull-google-reviews.js --id real-eastern-auto-works-cambridge-md  # Single listing
 * 
 * Env vars needed:
 *   GOOGLE_PLACES_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

// Load .env.local manually
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
}

const { createClient } = require('@supabase/supabase-js');

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_API_KEY) { console.error('Missing GOOGLE_PLACES_API_KEY'); process.exit(1); }
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing Supabase env vars'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Rate limiting: Google Places API allows 100 QPS but we'll be conservative
const DELAY_MS = 250; // 4 requests/sec
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Stats
let stats = { total: 0, found: 0, noMatch: 0, reviews: 0, errors: 0, skipped: 0, apiCalls: 0 };

/**
 * Find a Google Place ID for a business
 */
async function findPlaceId(listing) {
  const query = `${listing.business_name} ${listing.city} ${listing.state_code}`;
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?` +
    `input=${encodeURIComponent(query)}&inputtype=textquery` +
    `&fields=place_id,name,formatted_address,rating,user_ratings_total` +
    `&locationbias=point:${listing.lat || 0},${listing.lng || 0}` +
    `&key=${GOOGLE_API_KEY}`;

  stats.apiCalls++;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.candidates?.length) {
    return null;
  }

  const candidate = data.candidates[0];
  return {
    place_id: candidate.place_id,
    google_name: candidate.name,
    google_rating: candidate.rating || null,
    google_review_count: candidate.user_ratings_total || 0,
  };
}

/**
 * Fetch reviews for a Place ID
 */
async function fetchReviews(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?` +
    `place_id=${encodeURIComponent(placeId)}` +
    `&fields=reviews,rating,user_ratings_total` +
    `&key=${GOOGLE_API_KEY}`;

  stats.apiCalls++;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.result) {
    return { reviews: [], rating: null, count: 0 };
  }

  return {
    reviews: data.result.reviews || [],
    rating: data.result.rating || null,
    count: data.result.user_ratings_total || 0,
  };
}

/**
 * Process a single listing
 */
async function processListing(listing) {
  stats.total++;

  // Check if we already have a cached Place ID
  const { data: cached } = await supabase
    .from('google_place_ids')
    .select('place_id, last_fetched_at')
    .eq('listing_id', listing.id)
    .single();

  let placeId = cached?.place_id;

  // If no cached Place ID, look it up
  if (!placeId) {
    await sleep(DELAY_MS);
    const result = await findPlaceId(listing);
    if (!result) {
      stats.noMatch++;
      // Store null so we don't re-lookup
      await supabase.from('google_place_ids').upsert({
        listing_id: listing.id,
        place_id: null,
        google_name: null,
        google_rating: null,
        google_review_count: 0,
        last_fetched_at: new Date().toISOString(),
      }, { onConflict: 'listing_id' });
      return;
    }

    placeId = result.place_id;

    // Cache the Place ID
    await supabase.from('google_place_ids').upsert({
      listing_id: listing.id,
      place_id: result.place_id,
      google_name: result.google_name,
      google_rating: result.google_rating,
      google_review_count: result.google_review_count,
      last_fetched_at: new Date().toISOString(),
    }, { onConflict: 'listing_id' });
  }

  if (!placeId) {
    stats.noMatch++;
    return;
  }

  stats.found++;

  // Fetch reviews
  await sleep(DELAY_MS);
  const { reviews, rating, count } = await fetchReviews(placeId);

  // Update rating/count in place_ids cache
  if (rating !== null) {
    await supabase.from('google_place_ids').update({
      google_rating: rating,
      google_review_count: count,
      last_fetched_at: new Date().toISOString(),
    }).eq('listing_id', listing.id);
  }

  if (reviews.length === 0) return;

  // Upsert reviews into Supabase
  const reviewRows = reviews.map(r => ({
    listing_id: listing.id,
    place_id: placeId,
    author_name: r.author_name,
    author_url: r.author_url || null,
    profile_photo_url: r.profile_photo_url || null,
    rating: r.rating,
    text: r.text || null,
    relative_time: r.relative_time_description || null,
    review_time: r.time || null,
    language: r.language || 'en',
  }));

  const { error } = await supabase
    .from('google_reviews')
    .upsert(reviewRows, { onConflict: 'listing_id,author_name,review_time' });

  if (error) {
    console.error(`  ❌ Error saving reviews for ${listing.business_name}: ${error.message}`);
    stats.errors++;
  } else {
    stats.reviews += reviews.length;
  }
}

/**
 * Load listings from the TypeScript data file
 */
function loadListings() {
  const realListingsPath = path.join(__dirname, '..', 'data', 'real-listings.ts');
  let content = fs.readFileSync(realListingsPath, 'utf-8');
  
  // Strip TypeScript imports/types and convert to valid JSON-ish JS
  content = content
    .replace(/^import.*$/gm, '')
    .replace(/^export\s+const\s+REAL_LISTINGS.*?=\s*/m, 'var REAL_LISTINGS = ')
    .replace(/:\s*Listing\[\]/g, '')
    .replace(/satisfies\s+\w+/g, '')
    .replace(/as\s+const/g, '');

  // Use Function constructor instead of eval to avoid scope issues
  try {
    const fn = new Function(content + '\nreturn REAL_LISTINGS;');
    return fn();
  } catch (e) {
    console.error('Error evaluating listings:', e.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let limit = Infinity;
  let skip = 0;
  let singleId = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[++i]);
    if (args[i] === '--skip' && args[i + 1]) skip = parseInt(args[++i]);
    if (args[i] === '--id' && args[i + 1]) singleId = args[++i];
  }

  console.log('🔍 Loading listings...');
  let listings = loadListings();
  console.log(`📋 Loaded ${listings.length} listings`);

  if (singleId) {
    listings = listings.filter(l => l.id === singleId);
    if (listings.length === 0) {
      console.error(`Listing not found: ${singleId}`);
      process.exit(1);
    }
  }

  listings = listings.slice(skip, skip + limit);
  console.log(`🚀 Processing ${listings.length} listings (skip=${skip}, limit=${limit})`);
  console.log(`💰 Estimated API calls: ~${listings.length * 2} (${listings.length} find + ${listings.length} details)`);
  console.log(`💵 Estimated cost: ~$${((listings.length * 2 / 1000) * 17).toFixed(2)} (after free tier)`);
  console.log('---');

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const pct = ((i + 1) / listings.length * 100).toFixed(1);
    process.stdout.write(`[${pct}%] ${i + 1}/${listings.length} ${listing.business_name} (${listing.city}, ${listing.state_code})... `);
    
    try {
      await processListing(listing);
      console.log('✅');
    } catch (err) {
      console.log(`❌ ${err.message}`);
      stats.errors++;
    }

    // Progress update every 100 listings
    if ((i + 1) % 100 === 0) {
      console.log(`\n📊 Progress: ${stats.found} found, ${stats.noMatch} no match, ${stats.reviews} reviews, ${stats.errors} errors, ${stats.apiCalls} API calls\n`);
    }
  }

  console.log('\n═══════════════════════════════════');
  console.log('📊 FINAL RESULTS');
  console.log('═══════════════════════════════════');
  console.log(`Total listings:    ${stats.total}`);
  console.log(`Places found:      ${stats.found}`);
  console.log(`No match:          ${stats.noMatch}`);
  console.log(`Reviews saved:     ${stats.reviews}`);
  console.log(`Errors:            ${stats.errors}`);
  console.log(`API calls made:    ${stats.apiCalls}`);
  console.log(`Est. cost:         $${((Math.max(0, stats.apiCalls - 5000) / 1000) * 17).toFixed(2)}`);
  console.log('═══════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
