#!/usr/bin/env python3
"""
Scrape auto detailing businesses from Brave Search for top US cities.
Uses Brave Search API (free tier: 2000 queries/month).
Focuses on top cities by population to maximize coverage.
"""

import json
import os
import re
import time
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

BRAVE_API_KEY = "BSALbLvS9Kru1JGn_F7PWEoZXovK5fq"
BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"

# Top cities by population — focus scraping here
# We'll do batches to stay within API limits
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "scraped-detailers-v2.json"

def slugify(text):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', text.lower()))

def brave_search(query, count=10):
    """Search Brave API and return results."""
    params = urllib.parse.urlencode({
        'q': query,
        'count': count,
        'country': 'US',
    })
    url = f"{BRAVE_ENDPOINT}?{params}"
    req = urllib.request.Request(url, headers={
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY,
    })
    
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        data = json.loads(resp.read().decode())
        return data.get('web', {}).get('results', [])
    except Exception as e:
        print(f"  Search error: {e}")
        return []

def extract_phone(text):
    """Extract US phone number from text."""
    patterns = [
        r'\((\d{3})\)\s*(\d{3})[- ](\d{4})',
        r'(\d{3})[- .](\d{3})[- .](\d{4})',
    ]
    for p in patterns:
        m = re.search(p, text)
        if m:
            groups = m.groups()
            if len(groups) == 3:
                return f"({groups[0]}) {groups[1]}-{groups[2]}"
    return None

def extract_address_parts(text, city, state_code):
    """Try to extract address from search snippet."""
    # Common patterns: "123 Main St, City, ST 12345"
    pattern = rf'(\d+[\w\s]+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl|Pkwy|Hwy|Route|Rt)[\w\s]*),?\s*{re.escape(city)}'
    m = re.search(pattern, text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return None

def extract_zip(text):
    """Extract ZIP code."""
    m = re.search(r'\b(\d{5})(?:-\d{4})?\b', text)
    return m.group(1) if m else None

def parse_business_from_result(result, city, state, state_code):
    """Parse a search result into a business listing."""
    title = result.get('title', '')
    desc = result.get('description', '')
    url = result.get('url', '')
    combined = f"{title} {desc}"
    
    # Skip non-business results
    skip_domains = ['yelp.com', 'yellowpages.com', 'mapquest.com', 'bbb.org', 
                    'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com',
                    'angi.com', 'thumbtack.com', 'homeadvisor.com', 'bark.com',
                    'nextdoor.com', 'manta.com', 'finddetailersnow.com',
                    'groupon.com', 'google.com', 'apple.com']
    
    is_directory = any(d in url.lower() for d in skip_domains)
    
    # Clean up business name from title
    name = title.strip()
    # Remove common suffixes
    for suffix in [' | Auto Detailing', ' - Auto Detailing', ' | Mobile Detailing',
                   ' - Home', ' | Home', ' | Best', ' - Best', ' | Top',
                   f' | {city}', f' - {city}', f' | {state}', f' - {state}',
                   ' | Facebook', ' | Yelp', ' | Google', ' LLC', ' Inc']:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    name = name.strip(' -|')
    
    if not name or len(name) < 3 or len(name) > 80:
        return None
    
    phone = extract_phone(combined)
    address = extract_address_parts(combined, city, state_code)
    zip_code = extract_zip(combined)
    website = url if not is_directory else None
    
    slug = slugify(name)
    if not slug:
        return None
    
    return {
        'business_name': name,
        'slug': slug,
        'phone': phone,
        'email': None,
        'website': website,
        'description': desc[:200] if desc else None,
        'address': address,
        'city': city,
        'state': state,
        'state_code': state_code,
        'zip': zip_code,
        'source': 'brave_search',
        'source_url': url,
        'is_directory_result': is_directory,
    }

def scrape_city(city, state, state_code):
    """Scrape detailing businesses for a specific city."""
    businesses = []
    seen_slugs = set()
    
    queries = [
        f"auto detailing {city} {state_code}",
        f"car detailing service {city} {state_code}",
        f"ceramic coating {city} {state_code}",
    ]
    
    for query in queries:
        results = brave_search(query, count=10)
        
        for r in results:
            biz = parse_business_from_result(r, city, state, state_code)
            if biz and biz['slug'] not in seen_slugs:
                seen_slugs.add(biz['slug'])
                businesses.append(biz)
        
        time.sleep(0.5)  # Rate limit
    
    return businesses

def load_cities():
    """Load cities from our data file — top 500 by population."""
    cities_file = Path(__file__).parent.parent / "data" / "cities.ts"
    cities = []
    
    with open(cities_file, 'r') as f:
        for line in f:
            m = re.match(r"\s*\{ id: '([^']+)', name: '([^']+)', slug: '([^']+)', state: '([^']+)', state_code: '([^']+)', population: (\d+|null)", line)
            if m:
                pop = int(m.group(6)) if m.group(6) != 'null' else 0
                cities.append({
                    'name': m.group(2).replace("\\'", "'"),
                    'slug': m.group(3),
                    'state': m.group(4).replace("\\'", "'"),
                    'state_code': m.group(5),
                    'population': pop,
                })
    
    # Sort by population, take top 500
    cities.sort(key=lambda c: c['population'], reverse=True)
    return cities[:500]

def main():
    cities = load_cities()
    print(f"Loaded {len(cities)} cities to scrape")
    
    # Load existing results if resuming
    all_businesses = []
    processed_cities = set()
    
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, 'r') as f:
            existing = json.load(f)
            all_businesses = existing.get('businesses', [])
            processed_cities = set(existing.get('processed_cities', []))
            print(f"Resuming: {len(all_businesses)} businesses from {len(processed_cities)} cities already scraped")
    
    total_queries = 0
    MAX_QUERIES = 1500  # Stay under 2000/month limit with buffer
    
    for i, city in enumerate(cities):
        city_key = f"{city['name']}-{city['state_code']}"
        
        if city_key in processed_cities:
            continue
        
        if total_queries >= MAX_QUERIES:
            print(f"\nReached query limit ({MAX_QUERIES}). Stopping to preserve API quota.")
            break
        
        print(f"[{i+1}/{len(cities)}] Scraping {city['name']}, {city['state_code']} (pop: {city['population']:,})...")
        
        businesses = scrape_city(city['name'], city['state'], city['state_code'])
        
        # Filter — keep businesses that look like actual detailing businesses
        # (either have a non-directory website OR have a phone)
        quality = [b for b in businesses if b.get('phone') or (b.get('website') and not b.get('is_directory_result'))]
        
        all_businesses.extend(quality)
        processed_cities.add(city_key)
        total_queries += 3  # 3 queries per city
        
        print(f"  Found {len(quality)} businesses ({len(businesses)} raw)")
        
        # Save progress every 25 cities
        if len(processed_cities) % 25 == 0:
            save_results(all_businesses, processed_cities)
            print(f"  💾 Saved progress: {len(all_businesses)} total businesses")
    
    save_results(all_businesses, processed_cities)
    
    # Deduplicate by slug+city+state
    seen = set()
    deduped = []
    for b in all_businesses:
        key = f"{b['slug']}-{b['city']}-{b['state_code']}"
        if key not in seen:
            seen.add(key)
            deduped.append(b)
    
    print(f"\n✅ Done! {len(deduped)} unique businesses from {len(processed_cities)} cities")
    print(f"   Total API queries used: ~{total_queries}")
    
    save_results(deduped, list(processed_cities))

def save_results(businesses, processed_cities):
    """Save scraped data to JSON."""
    data = {
        'scraped_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'total_businesses': len(businesses),
        'total_cities': len(processed_cities) if isinstance(processed_cities, (list, set)) else 0,
        'processed_cities': list(processed_cities) if isinstance(processed_cities, set) else processed_cities,
        'businesses': businesses,
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    main()
