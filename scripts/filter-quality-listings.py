#!/usr/bin/env python3
"""
Filter real-listings.ts to only include quality businesses verified by Google Places.
Removes listings without meaningful Google presence.

Criteria for inclusion:
  - Has a Google Place match (place_id not null)
  - Has at least 3 Google reviews
  - Has a rating of 3.5 or higher
  
Usage:
  python3 scripts/filter-quality-listings.py --dry-run    # Preview what would be removed
  python3 scripts/filter-quality-listings.py              # Actually filter
  python3 scripts/filter-quality-listings.py --min-reviews 5 --min-rating 4.0
"""

import json
import re
import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"
LISTINGS_FILE = DATA_DIR / "real-listings.ts"

# Load env
ENV_FILE = SCRIPT_DIR.parent / ".env.local"
env = {}
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        m = re.match(r'^([^#=]+)=(.*)$', line)
        if m:
            env[m.group(1).strip()] = m.group(2).strip()

def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    min_reviews = 3
    min_rating = 3.5
    
    for i, arg in enumerate(args):
        if arg == '--min-reviews' and i + 1 < len(args):
            min_reviews = int(args[i + 1])
        if arg == '--min-rating' and i + 1 < len(args):
            min_rating = float(args[i + 1])
    
    print(f"Quality filter: min {min_reviews} reviews, min {min_rating} rating")
    
    # Fetch Google Place data from Supabase
    import urllib.request
    supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL', '')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')
    
    # Fetch all place IDs with their ratings (paginate to get all)
    place_data = []
    offset = 0
    page_size = 1000
    while True:
        url = f"{supabase_url}/rest/v1/google_place_ids?select=listing_id,place_id,google_rating,google_review_count&offset={offset}&limit={page_size}"
        req = urllib.request.Request(url, headers={
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
        })
        resp = urllib.request.urlopen(req, timeout=30)
        page = json.loads(resp.read().decode())
        place_data.extend(page)
        if len(page) < page_size:
            break
        offset += page_size
    
    # Build quality set
    quality_ids = set()
    place_map = {}
    for p in place_data:
        place_map[p['listing_id']] = p
        rating = p.get('google_rating') or 0
        count = p.get('google_review_count') or 0
        if p.get('place_id') and rating >= min_rating and count >= min_reviews:
            quality_ids.add(p['listing_id'])
    
    print(f"Total listings with Place data: {len(place_data)}")
    print(f"Quality listings (verified): {len(quality_ids)}")
    
    # Parse current listings file
    with open(LISTINGS_FILE) as f:
        content = f.read()
    
    # Extract listing IDs
    listing_ids = re.findall(r"id: '([^']+)'", content)
    print(f"Current listings in file: {len(listing_ids)}")
    
    # Count what we'd keep vs remove
    # Include listings that either pass quality OR haven't been checked yet
    checked_ids = set(p['listing_id'] for p in place_data)
    
    keep = []
    remove = []
    unchecked = []
    
    for lid in listing_ids:
        if lid in quality_ids:
            keep.append(lid)
        elif lid in checked_ids:
            remove.append(lid)
        else:
            unchecked.append(lid)
    
    print(f"\n📊 Results:")
    print(f"  Keep (quality verified): {len(keep)}")
    print(f"  Remove (checked, below threshold): {len(remove)}")
    print(f"  Unchecked (not yet validated): {len(unchecked)}")
    
    if dry_run:
        print("\nDry run — no changes made.")
        # Show some examples of what would be removed
        print("\nExamples of listings to REMOVE:")
        for lid in remove[:10]:
            p = place_map.get(lid, {})
            print(f"  {lid}: rating={p.get('google_rating')}, reviews={p.get('google_review_count')}, place_id={bool(p.get('place_id'))}")
        return
    
    # Filter the file: keep only quality + unchecked listings
    keep_set = quality_ids | set(unchecked)
    
    # Parse the TS file and reconstruct with only kept listings
    # Split into individual listing blocks
    # Each listing starts with "  {" and ends with "  }," or "  }"
    blocks = re.split(r'(?=\n  \{)', content)
    
    header = blocks[0]  # Everything before the first listing
    listing_blocks = blocks[1:]
    
    kept_blocks = []
    for block in listing_blocks:
        id_match = re.search(r"id: '([^']+)'", block)
        if id_match and id_match.group(1) in keep_set:
            kept_blocks.append(block)
    
    # Reconstruct
    new_content = header + ''.join(kept_blocks)
    
    # Make sure it ends properly
    if not new_content.rstrip().endswith('];'):
        # Fix trailing
        new_content = new_content.rstrip().rstrip(',') + '\n];\n'
    
    with open(LISTINGS_FILE, 'w') as f:
        f.write(new_content)
    
    # Verify
    new_ids = re.findall(r"id: '([^']+)'", new_content)
    print(f"\n✅ Filtered: {len(listing_ids)} → {len(new_ids)} listings")
    print(f"Removed {len(listing_ids) - len(new_ids)} low-quality listings")

if __name__ == '__main__':
    main()
