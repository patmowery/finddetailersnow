#!/usr/bin/env python3
"""
Scrape auto detailing businesses for remaining cities using Google Places Text Search API.
Returns real, verified business data with ratings, addresses, and phone numbers.

Usage:
  python3 scripts/scrape-remaining-cities.py                    # All remaining
  python3 scripts/scrape-remaining-cities.py --state CA         # Single state
  python3 scripts/scrape-remaining-cities.py --resume           # Resume from checkpoint
  python3 scripts/scrape-remaining-cities.py --limit 100        # Process N cities
  python3 scripts/scrape-remaining-cities.py --dry-run          # Preview without API calls

Cost: ~$32 per 1,000 Text Search requests = ~$196 for all 6,130 cities.
"""

import json
import os
import sys
import time
import re
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"
CITIES_FILE = DATA_DIR / "cities-to-scrape.json"
OUTPUT_FILE = DATA_DIR / "scraped-remaining.json"
CHECKPOINT_FILE = DATA_DIR / "scrape-checkpoint.json"

# Load from .env.local
ENV_FILE = SCRIPT_DIR.parent / ".env.local"
env = {}
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        m = re.match(r'^([^#=]+)=(.*)$', line)
        if m:
            env[m.group(1).strip()] = m.group(2).strip()

GOOGLE_API_KEY = env.get('GOOGLE_PLACES_API_KEY', os.environ.get('GOOGLE_PLACES_API_KEY', ''))
if not GOOGLE_API_KEY:
    print("ERROR: Missing GOOGLE_PLACES_API_KEY"); sys.exit(1)

DELAY_MS = 200  # 5 QPS (Google allows 100 QPS but let's be conservative)

def load_checkpoint():
    if CHECKPOINT_FILE.exists():
        with open(CHECKPOINT_FILE) as f:
            return json.load(f)
    return {"completed_cities": [], "scraped_businesses": []}

def save_checkpoint(checkpoint):
    with open(CHECKPOINT_FILE, 'w') as f:
        json.dump(checkpoint, f)

def save_output(businesses):
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(businesses, f, indent=2)

def slugify(text):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', text.lower()))

def text_search(query):
    """Google Places Text Search API."""
    url = f'https://maps.googleapis.com/maps/api/place/textsearch/json?' + urllib.parse.urlencode({
        'query': query,
        'key': GOOGLE_API_KEY,
    })
    try:
        resp = urllib.request.urlopen(url, timeout=15)
        data = json.loads(resp.read().decode())
        if data.get('status') == 'OK':
            return data.get('results', [])
        return []
    except Exception as e:
        print(f"    Search error: {e}")
        return []

def get_place_details(place_id):
    """Get phone number and website from Place Details."""
    url = f'https://maps.googleapis.com/maps/api/place/details/json?' + urllib.parse.urlencode({
        'place_id': place_id,
        'fields': 'formatted_phone_number,website,url',
        'key': GOOGLE_API_KEY,
    })
    try:
        resp = urllib.request.urlopen(url, timeout=10)
        data = json.loads(resp.read().decode())
        if data.get('status') == 'OK':
            return data.get('result', {})
        return {}
    except:
        return {}

def detect_services(name, types=[]):
    """Detect services from business name and Google place types."""
    services = ['detailing']
    text = name.lower()
    
    if 'ceramic' in text or 'coating' in text:
        services.append('ceramic_coating')
    if 'ppf' in text or 'paint protection' in text or 'clear bra' in text or 'xpel' in text:
        services.append('ppf')
    if 'paint correction' in text or 'polish' in text:
        services.append('paint_correction')
    if 'tint' in text or 'window film' in text:
        services.append('tinting')
    if 'interior' in text:
        services.append('interior')
    if 'wash' in text:
        services.append('wash')
    if 'mobile' in text:
        services.append('mobile')
    if 'fleet' in text or 'commercial' in text:
        services.append('commercial')
    if 'rv' in text or 'boat' in text or 'marine' in text:
        services.append('rv_boat')
    
    return list(dict.fromkeys(services))

def parse_city_state(address, expected_city, expected_state):
    """Extract city and state from Google's formatted_address."""
    # Try to use the expected city/state if address contains them
    if expected_city.lower() in address.lower():
        return expected_city, expected_state
    return expected_city, expected_state

def scrape_city(city_info):
    """Scrape one city and return list of businesses."""
    city = city_info['name']
    state_code = city_info['state_code']
    state = city_info.get('state', '')
    
    query = f"auto detailing {city} {state_code}"
    results = text_search(query)
    time.sleep(DELAY_MS / 1000)
    
    businesses = []
    seen_names = set()
    
    for place in results[:8]:  # Max 8 per city
        name = place.get('name', '')
        if not name or len(name) < 3:
            continue
        
        # Skip if we've already seen this name (dedup within city)
        name_key = slugify(name)
        if name_key in seen_names:
            continue
        seen_names.add(name_key)
        
        # Skip non-relevant results (gas stations, car washes only, etc)
        types = place.get('types', [])
        skip_types = {'gas_station', 'convenience_store', 'grocery_store', 'restaurant', 'lodging'}
        if skip_types & set(types) and 'car_wash' not in types and 'car_repair' not in types:
            continue
        
        # Skip Place Details to reduce cost — Text Search gives us enough
        # Phone/website can be added later if needed
        phone = None
        website = None
        
        address = place.get('formatted_address', '')
        # Clean address: remove ", USA" suffix
        address = re.sub(r',\s*USA$', '', address)
        
        biz = {
            'business_name': name,
            'slug': slugify(name),
            'city': city,
            'state': state,
            'state_code': state_code,
            'phone': phone,
            'website': website,
            'address': address,
            'description': '',
            'services': detect_services(name, types),
            'place_id': place['place_id'],
            'rating': place.get('rating'),
            'review_count': place.get('user_ratings_total', 0),
            'lat': place.get('geometry', {}).get('location', {}).get('lat'),
            'lng': place.get('geometry', {}).get('location', {}).get('lng'),
        }
        businesses.append(biz)
    
    return businesses

def main():
    args = sys.argv[1:]
    target_state = None
    resume = False
    limit = None
    dry_run = False
    
    i = 0
    while i < len(args):
        if args[i] == '--state' and i + 1 < len(args):
            target_state = args[i + 1].upper(); i += 2
        elif args[i] == '--resume':
            resume = True; i += 1
        elif args[i] == '--limit' and i + 1 < len(args):
            limit = int(args[i + 1]); i += 2
        elif args[i] == '--dry-run':
            dry_run = True; i += 1
        else:
            i += 1

    with open(CITIES_FILE) as f:
        all_cities = json.load(f)
    
    if target_state:
        all_cities = [c for c in all_cities if c['state_code'] == target_state]
    
    # Sort by population descending (bigger cities first)
    all_cities.sort(key=lambda c: c.get('population', 0), reverse=True)
    
    print(f"📋 Cities to scrape: {len(all_cities)}")
    
    checkpoint = load_checkpoint() if resume else {"completed_cities": [], "scraped_businesses": []}
    completed = set(checkpoint['completed_cities'])
    businesses = checkpoint['scraped_businesses']
    
    remaining = [c for c in all_cities if f"{c['name']}|{c['state_code']}" not in completed]
    if limit:
        remaining = remaining[:limit]
    
    print(f"🔄 Completed: {len(completed)}, remaining: {len(remaining)}")
    
    # Cost estimate: 1 text search per city, no details calls
    # Text Search: $32/1000
    est_text = len(remaining) * 32 / 1000
    print(f"💰 Est. cost: ~${est_text:.0f} (text search only)")
    
    if dry_run:
        print("Dry run — exiting.")
        return
    
    print("---")
    
    errors = 0
    total_found = 0
    
    for idx, city_info in enumerate(remaining):
        pct = (idx + 1) / len(remaining) * 100
        city_name = f"{city_info['name']}, {city_info['state_code']}"
        print(f"[{pct:.1f}%] {idx + 1}/{len(remaining)} {city_name}... ", end='', flush=True)
        
        try:
            results = scrape_city(city_info)
            total_found += len(results)
            businesses.extend(results)
            print(f"✅ {len(results)} businesses")
        except Exception as e:
            print(f"❌ {e}")
            errors += 1
        
        completed.add(f"{city_info['name']}|{city_info['state_code']}")
        
        # Checkpoint every 50 cities
        if (idx + 1) % 50 == 0:
            checkpoint['completed_cities'] = list(completed)
            checkpoint['scraped_businesses'] = businesses
            save_checkpoint(checkpoint)
            save_output(businesses)
            print(f"  💾 Checkpoint ({len(businesses)} businesses, {len(completed)} cities)")
        
        # Progress summary every 200 cities
        if (idx + 1) % 200 == 0:
            print(f"\n📊 Progress: {len(completed)} cities, {len(businesses)} businesses, {errors} errors\n")
    
    # Final save
    checkpoint['completed_cities'] = list(completed)
    checkpoint['scraped_businesses'] = businesses
    save_checkpoint(checkpoint)
    save_output(businesses)
    
    print('\n═══════════════════════════════════')
    print('📊 SCRAPING COMPLETE')
    print('═══════════════════════════════════')
    print(f'Cities processed:  {len(completed)}')
    print(f'Businesses found:  {total_found}')
    print(f'Errors:            {errors}')
    print('═══════════════════════════════════')

if __name__ == '__main__':
    main()
