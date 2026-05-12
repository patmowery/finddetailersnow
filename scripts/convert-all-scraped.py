#!/usr/bin/env python3
"""
Convert ALL scraped business data (Brave + Grok) into real-listings.ts.
Deduplicates against existing listings, cleans names, assigns services.
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
BRAVE_FILE = DATA_DIR / "scraped-detailers-v2.json"
GROK_FILE = DATA_DIR / "scraped-detailers-grok.json"
LISTINGS_FILE = DATA_DIR / "real-listings.ts"

def slugify(text):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', text.lower()))

def clean_business_name(name):
    """Clean up scraped business names."""
    if not name:
        return ""
    
    # Remove common suffixes
    for suffix in [' - Home', ' | Home', ' - About', ' | About',
                   ' - Services', ' | Services', ' - Pricing',
                   ' - Updated May 2026', ' - Updated April 2026',
                   ' - Updated June 2026', ' - Updated March 2026',
                   ' | Yelp', ' | Google', ' | BBB', ' | Angi',
                   ' | Thumbtack', ' | MapQuest', ' - Facebook',
                   ' | Facebook', ' | LinkedIn', ' | Instagram',
                   ' | Groupon', ' | Better Business Bureau']:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    
    # Remove year patterns
    name = re.sub(r'\s*[-|–]\s*(Best|Top|#1|Number 1).*$', '', name)
    name = re.sub(r'\s*[-|–]\s*\d{4}.*$', '', name)
    name = re.sub(r'\s*[-|–]\s*Updated\s+\w+\s+\d{4}.*$', '', name)
    
    # Remove trailing pipes/dashes
    name = name.strip(' -|–—·')
    return name

def detect_services(name, desc="", website=""):
    """Detect services from business name and description."""
    services = ['detailing']
    text = f"{name} {desc} {website}".lower()
    
    if 'ceramic' in text or 'coating' in text:
        services.append('ceramic_coating')
    if 'ppf' in text or 'paint protection' in text or 'clear bra' in text or 'xpel' in text:
        services.append('ppf')
    if 'paint correction' in text or 'polishing' in text or 'buffing' in text:
        services.append('paint_correction')
    if 'tint' in text or 'window film' in text:
        services.append('tinting')
    if 'interior' in text or 'upholster' in text or 'leather' in text:
        services.append('interior')
    if 'wash' in text and 'car wash' in text:
        services.append('wash')
    if 'commercial' in text or 'fleet' in text:
        services.append('commercial')
    if 'rv' in text or 'boat' in text or 'marine' in text:
        services.append('rv_boat')
    if 'mobile' in text:
        services.append('mobile')
    
    return list(dict.fromkeys(services))  # Dedupe while preserving order

def clean_phone(phone):
    if not phone:
        return None
    digits = re.sub(r'[^\d]', '', str(phone))
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    if len(digits) == 11 and digits[0] == '1':
        digits = digits[1:]
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return None

def escape_ts(s):
    """Escape a string for TypeScript single-quoted string."""
    if s is None:
        return 'null'
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").replace("\r", "") + "'"

def main():
    # Load existing listings
    with open(LISTINGS_FILE) as f:
        content = f.read()
    
    existing_slugs = set()
    for m in re.finditer(r"slug: '([^']+)'", content):
        existing_slugs.add(m.group(1))
    
    # Also track by normalized name+city to catch near-dupes
    existing_keys = set()
    for m in re.finditer(r"slug: '([^']+)'", content):
        existing_keys.add(m.group(1))
    
    print(f"Existing listings: {len(existing_slugs)}")
    
    # Load all scraped data
    all_businesses = []
    
    # Brave data
    if BRAVE_FILE.exists():
        with open(BRAVE_FILE) as f:
            brave = json.load(f)
        items = brave if isinstance(brave, list) else brave.get('businesses', [])
        for b in items:
            b['_source'] = 'brave'
        all_businesses.extend(items)
        print(f"Loaded {len(items)} from Brave scraper")
    
    # Grok data
    if GROK_FILE.exists():
        with open(GROK_FILE) as f:
            grok = json.load(f)
        items = grok if isinstance(grok, list) else grok.get('businesses', [])
        for b in items:
            b['_source'] = 'grok'
        all_businesses.extend(items)
        print(f"Loaded {len(items)} from Grok scraper")
    
    print(f"Total scraped: {len(all_businesses)}")
    
    # Process and deduplicate
    new_listings = []
    seen_keys = set()
    skipped_reasons = {'existing': 0, 'duplicate': 0, 'bad_name': 0, 'no_city': 0}
    
    # Sort: prefer Brave (has more real data) over Grok
    all_businesses.sort(key=lambda b: 0 if b.get('_source') == 'brave' else 1)
    
    counter = len(existing_slugs)
    
    for biz in all_businesses:
        name = clean_business_name(biz.get('business_name', ''))
        city = biz.get('city', '').strip()
        state_code = biz.get('state_code', '').strip().upper()
        state = biz.get('state', '').strip()
        
        if not city or not state_code:
            skipped_reasons['no_city'] += 1
            continue
        
        if not name or len(name) < 3 or len(name) > 80:
            skipped_reasons['bad_name'] += 1
            continue
        
        # Skip directory-style names
        if any(x in name.lower() for x in ['best auto detailing in', 'top 10 ', 'top 5 ',
                                             'near me', 'yelp.com', 'google.com', 
                                             'yellowpages', 'mapquest']):
            skipped_reasons['bad_name'] += 1
            continue
        
        slug = slugify(name)
        dedup_key = f"{slug}|{city.lower()}|{state_code}"
        
        if slug in existing_slugs:
            skipped_reasons['existing'] += 1
            continue
        if dedup_key in seen_keys:
            skipped_reasons['duplicate'] += 1
            continue
        
        seen_keys.add(dedup_key)
        existing_slugs.add(slug)
        counter += 1
        
        phone = clean_phone(biz.get('phone'))
        website = biz.get('website') or biz.get('url')
        if website and not website.startswith('http'):
            website = 'https://' + website
        
        # Skip if website is just a directory
        if website and any(d in website for d in ['yelp.com', 'yellowpages.com', 'mapquest.com',
                                                    'bbb.org', 'facebook.com', 'angi.com',
                                                    'thumbtack.com', 'homeadvisor.com']):
            website = None
        
        description = biz.get('description', '') or ''
        if len(description) > 300:
            description = description[:297] + '...'
        
        services = detect_services(name, description, website or '')
        
        new_listings.append({
            'id': f'r-{counter:04d}',
            'business_name': name,
            'slug': slug,
            'phone': phone,
            'email': biz.get('email'),
            'website': website,
            'description': description,
            'services': services,
            'address': biz.get('address'),
            'city': city,
            'state': state,
            'state_code': state_code,
            'zip': biz.get('zip'),
            'lat': biz.get('lat'),
            'lng': biz.get('lng'),
        })
    
    print(f"\nNew listings to add: {len(new_listings)}")
    print(f"Skipped: {skipped_reasons}")
    
    if not new_listings:
        print("Nothing to add!")
        return
    
    # Generate TypeScript entries
    ts_entries = []
    for l in new_listings:
        services_str = ', '.join(f"'{s}'" for s in l['services'])
        entry = f"""  {{
    id: {escape_ts(l['id'])},
    business_name: {escape_ts(l['business_name'])},
    slug: {escape_ts(l['slug'])},
    phone: {escape_ts(l['phone'])},
    email: {escape_ts(l['email'])},
    website: {escape_ts(l['website'])},
    description: {escape_ts(l['description'])},
    services: [{services_str}],
    address: {escape_ts(l['address'])},
    city: {escape_ts(l['city'])},
    state: {escape_ts(l['state'])},
    state_code: {escape_ts(l['state_code'])},
    zip: {escape_ts(l['zip'])},
    lat: {l['lat'] if l['lat'] else 'null'},
    lng: {l['lng'] if l['lng'] else 'null'},
    logo_url: null,
    cover_image_url: null,
    is_claimed: false,
    is_premium: false,
    is_featured: false,
    rating: 0,
    review_count: 0,
    price_range: '$$',
    years_in_business: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }},"""
        ts_entries.append(entry)
    
    # Insert before the closing ];
    insert_point = content.rfind('];')
    if insert_point == -1:
        print("ERROR: Could not find end of array in real-listings.ts")
        return
    
    new_content = content[:insert_point] + '\n'.join(ts_entries) + '\n' + content[insert_point:]
    
    with open(LISTINGS_FILE, 'w') as f:
        f.write(new_content)
    
    print(f"\n✅ Added {len(new_listings)} new listings to real-listings.ts")
    print(f"Total listings now: {len(existing_slugs)}")
    
    # Stats by state
    by_state = {}
    for l in new_listings:
        by_state[l['state_code']] = by_state.get(l['state_code'], 0) + 1
    
    print(f"\nNew listings by state (top 15):")
    for st, count in sorted(by_state.items(), key=lambda x: -x[1])[:15]:
        print(f"  {st}: {count}")

    # Cities covered
    new_cities = set(f"{l['city']}|{l['state_code']}" for l in new_listings)
    print(f"\nNew cities covered: {len(new_cities)}")

if __name__ == '__main__':
    main()
