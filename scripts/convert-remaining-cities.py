#!/usr/bin/env python3
"""
Convert scraped-remaining.json into real-listings.ts format.
Filters for quality: 3+ reviews, 3.5+ rating.
Deduplicates against existing listings by slug.
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
REMAINING_FILE = DATA_DIR / "scraped-remaining.json"
LISTINGS_FILE = DATA_DIR / "real-listings.ts"

MIN_REVIEWS = 3
MIN_RATING = 3.5

# Fix truncated city names from scraper (apostrophes got mangled)
CITY_FIXES = {
    "Lee\\": "Lee's Summit",
    "Coeur d\\": "Coeur d'Alene",
    "D\\": "D'Iberville",
    "Land O\\": "Land O' Lakes",
    "O\\": "O'Fallon",
    "Thompson\\": "Thompson's Station",
    "Town \\": "Town 'n' Country",
    "Woodlawn CDP (Prince George\\": "Woodlawn",
}

def fix_city(city):
    """Fix truncated city names with mangled apostrophes."""
    if city in CITY_FIXES:
        return CITY_FIXES[city]
    # Remove trailing backslash if present
    if city and city.endswith('\\'):
        city = city.rstrip('\\')
    return city

def slugify(text):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', text.lower()))

def get_existing_slugs():
    """Extract all existing slugs from real-listings.ts"""
    content = LISTINGS_FILE.read_text()
    return set(re.findall(r"slug:\s*'([^']+)'", content))

def get_max_id():
    """Get the highest r-XXXX id number."""
    content = LISTINGS_FILE.read_text()
    ids = re.findall(r"id:\s*'r-(\d+)'", content)
    return max(int(i) for i in ids) if ids else 0

def escape_for_double_quotes(s):
    """Escape a string for use inside double quotes in TypeScript."""
    if not s:
        return ''
    # First remove any stray backslashes from bad scraping (e.g. Lee\ -> Lee)
    # These are artifacts, not real escapes in the data
    s = s.replace('\\', "'")
    # Now escape for TS double-quoted string
    return s.replace('"', '\\"').replace('\n', '\\n').replace('\r', '')

def format_listing(biz, id_num):
    """Format a business dict as a TypeScript listing object."""
    name = escape_for_double_quotes(biz.get('business_name', ''))
    slug = biz.get('slug', slugify(biz.get('business_name', '')))
    phone = biz.get('phone')
    website = biz.get('website')
    address = escape_for_double_quotes(biz.get('address', '')) if biz.get('address') else None
    desc = escape_for_double_quotes(biz.get('description', '')) if biz.get('description') else ''
    city = escape_for_double_quotes(fix_city(biz.get('city', '')))
    state = escape_for_double_quotes(biz.get('state', ''))
    state_code = biz.get('state_code', '')
    rating = biz.get('rating')
    review_count = biz.get('review_count', 0)
    lat = biz.get('lat')
    lng = biz.get('lng')
    services = biz.get('services', ['detailing'])

    svc_str = ', '.join(f"'{s}'" for s in services)
    
    lines = [
        f"  {{",
        f"    id: 'r-{id_num:04d}',",
        f'    business_name: "{name}",',
        f"    slug: '{slug}',",
        f"    phone: {json.dumps(phone)},",
        f"    email: null,",
        f"    website: {json.dumps(website)},",
        f'    description: "{desc}",',
        f"    services: [{svc_str}],",
        f"    address: {json.dumps(address)},",
        f'    city: "{city}",',
        f'    state: "{state}",',
        f"    state_code: '{state_code}',",
        f"    zip: null,",
        f"    lat: {lat if lat else 'null'},",
        f"    lng: {lng if lng else 'null'},",
        f"    logo_url: null,",
        f"    cover_image_url: null,",
        f"    is_claimed: false,",
        f"    is_premium: false,",
        f"    is_featured: false,",
        f"    rating: {rating if rating else 'null'},",
        f"    review_count: {review_count},",
        f"    price_range: '$$',",
        f"    years_in_business: null,",
        f"    created_at: '2026-01-01T00:00:00Z',",
        f"    updated_at: '2026-05-12T00:00:00Z',",
        f"  }},",
    ]
    return '\n'.join(lines)

def main():
    with open(REMAINING_FILE) as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} businesses from scraped-remaining.json")
    
    # Quality filter
    quality = [b for b in data 
               if b.get('review_count', 0) >= MIN_REVIEWS 
               and (b.get('rating') or 0) >= MIN_RATING]
    print(f"Quality filter ({MIN_REVIEWS}+ reviews, {MIN_RATING}+ rating): {len(quality)} pass")
    
    # Deduplicate against existing
    existing_slugs = get_existing_slugs()
    print(f"Existing slugs: {len(existing_slugs)}")
    
    new_listings = []
    seen_slugs = set()
    for biz in quality:
        slug = biz.get('slug', slugify(biz.get('business_name', '')))
        if slug in existing_slugs or slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        new_listings.append(biz)
    
    print(f"New unique listings to add: {len(new_listings)}")
    
    if not new_listings:
        print("No new listings to add!")
        return
    
    # Get current max ID
    max_id = get_max_id()
    print(f"Starting from ID: r-{max_id + 1:04d}")
    
    # Generate TS entries
    entries = []
    for i, biz in enumerate(new_listings):
        entries.append(format_listing(biz, max_id + 1 + i))
    
    # Read current file and insert before the closing ];
    content = LISTINGS_FILE.read_text()
    insert_point = content.rfind('];')
    if insert_point == -1:
        print("ERROR: Could not find closing ]; in real-listings.ts")
        return
    
    new_content = content[:insert_point] + '\n'.join(entries) + '\n' + content[insert_point:]
    LISTINGS_FILE.write_text(new_content)
    
    final_count = new_content.count("id: 'r-")
    print(f"\n✅ Added {len(new_listings)} new listings")
    print(f"📊 Total listings in real-listings.ts: {final_count}")
    
    # State breakdown of new listings
    states = {}
    for b in new_listings:
        sc = b.get('state_code', '??')
        states[sc] = states.get(sc, 0) + 1
    print(f"\nTop states added:")
    for sc, count in sorted(states.items(), key=lambda x: -x[1])[:15]:
        print(f"  {sc}: {count}")

if __name__ == '__main__':
    main()
