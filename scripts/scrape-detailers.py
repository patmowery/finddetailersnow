#!/usr/bin/env python3
"""
Scrape real auto detailing businesses from public sources.
Uses Brave Search API to find detailers in major US cities.
Outputs JSON data for seeding the directory.
"""

import json
import time
import os
import sys
import urllib.request
import urllib.parse
import urllib.error

BRAVE_API_KEY = "BSALbLvS9Kru1JGn_F7PWEoZXovK5fq"

# Top 50 US cities by population
CITIES = [
    ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"), ("Houston", "TX"),
    ("Phoenix", "AZ"), ("Philadelphia", "PA"), ("San Antonio", "TX"), ("San Diego", "CA"),
    ("Dallas", "TX"), ("Jacksonville", "FL"), ("Austin", "TX"), ("Fort Worth", "TX"),
    ("Columbus", "OH"), ("Charlotte", "NC"), ("Indianapolis", "IN"), ("San Francisco", "CA"),
    ("Seattle", "WA"), ("Denver", "CO"), ("Nashville", "TN"), ("Oklahoma City", "OK"),
    ("Washington", "DC"), ("El Paso", "TX"), ("Las Vegas", "NV"), ("Portland", "OR"),
    ("Memphis", "TN"), ("Louisville", "KY"), ("Baltimore", "MD"), ("Milwaukee", "WI"),
    ("Albuquerque", "NM"), ("Tucson", "AZ"), ("Mesa", "AZ"), ("Atlanta", "GA"),
    ("Sacramento", "CA"), ("Kansas City", "MO"), ("Miami", "FL"), ("Raleigh", "NC"),
    ("Omaha", "NE"), ("Tampa", "FL"), ("Minneapolis", "MN"), ("Cleveland", "OH"),
    ("Virginia Beach", "VA"), ("New Orleans", "LA"), ("Honolulu", "HI"), ("Pittsburgh", "PA"),
    ("Cincinnati", "OH"), ("Orlando", "FL"), ("St. Louis", "MO"), ("Detroit", "MI"),
    ("Boise", "ID"), ("Salt Lake City", "UT")
]

SERVICES = [
    "Full Detail", "Interior Detail", "Exterior Detail", "Paint Correction",
    "Ceramic Coating", "Paint Protection Film", "Window Tinting", "Headlight Restoration",
    "Engine Detailing", "Wheel & Tire Detail", "Odor Removal", "Leather Conditioning",
    "Clay Bar Treatment", "Scratch Removal", "Mobile Detailing", "Fleet Detailing"
]

def brave_search(query, count=10):
    """Search Brave for auto detailing businesses."""
    url = "https://api.search.brave.com/res/v1/web/search"
    params = urllib.parse.urlencode({
        "q": query,
        "count": count,
        "search_lang": "en",
        "country": "US"
    })
    req = urllib.request.Request(
        f"{url}?{params}",
        headers={
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": BRAVE_API_KEY
        }
    )
    try:
        import gzip
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.headers.get('Content-Encoding') == 'gzip':
                data = gzip.decompress(resp.read())
            else:
                data = resp.read()
            return json.loads(data)
    except Exception as e:
        print(f"  Error searching: {e}", file=sys.stderr)
        return None

def extract_business_info(result, city, state):
    """Extract business info from a search result."""
    title = result.get("title", "")
    description = result.get("description", "")
    url = result.get("url", "")
    
    # Clean up business name - remove location suffixes and common noise
    name = title.split(" - ")[0].split(" | ")[0].split(" · ")[0].strip()
    # Remove "Yelp", "Google", etc
    for noise in ["Yelp", "Google Maps", "Facebook", "BBB", "Angi", "Thumbtack"]:
        name = name.replace(noise, "").strip(" -|·")
    
    if len(name) < 3 or len(name) > 80:
        return None
    
    return {
        "name": name,
        "description": description[:300] if description else "",
        "website": url if not any(x in url for x in ["yelp.com", "google.com", "facebook.com", "bbb.org", "angi.com"]) else "",
        "city": city,
        "state": state,
        "source_url": url
    }

def scrape_city(city, state, batch_num):
    """Scrape detailers for a single city."""
    businesses = []
    queries = [
        f"auto detailing {city} {state}",
        f"car detailing services {city} {state}",
        f"mobile detailing {city} {state}",
        f"ceramic coating {city} {state}",
        f"paint correction {city} {state}"
    ]
    
    seen_names = set()
    
    # Only do 2 queries per city to stay within rate limits
    for query in queries[:2]:
        result = brave_search(query, count=10)
        if not result or "web" not in result:
            continue
        
        for item in result["web"].get("results", []):
            biz = extract_business_info(item, city, state)
            if biz and biz["name"] not in seen_names:
                seen_names.add(biz["name"])
                businesses.append(biz)
        
        time.sleep(1.2)  # Rate limit - be nice to the API
    
    return businesses

def main():
    all_businesses = []
    total_cities = len(CITIES)
    
    print(f"Scraping detailers from {total_cities} cities...")
    print("=" * 60)
    
    for i, (city, state) in enumerate(CITIES):
        print(f"[{i+1}/{total_cities}] Searching {city}, {state}...", end=" ", flush=True)
        businesses = scrape_city(city, state, i)
        all_businesses.extend(businesses)
        print(f"Found {len(businesses)} businesses")
        
        # Progress save every 10 cities
        if (i + 1) % 10 == 0:
            print(f"  Progress: {len(all_businesses)} total businesses so far")
    
    # Deduplicate by name
    seen = set()
    unique = []
    for biz in all_businesses:
        key = biz["name"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(biz)
    
    print("=" * 60)
    print(f"Total unique businesses found: {len(unique)}")
    
    # Save results
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "scraped-detailers.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(unique, f, indent=2)
    
    print(f"Saved to {output_path}")
    
    # Also print summary by city
    print("\nBy city:")
    from collections import Counter
    city_counts = Counter(f"{b['city']}, {b['state']}" for b in unique)
    for city, count in city_counts.most_common(20):
        print(f"  {city}: {count}")

if __name__ == "__main__":
    main()
