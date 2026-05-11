#!/usr/bin/env python3
"""
Scrape auto detailing businesses using xAI Grok Chat Completions API.
Uses grok-3-fast (no web search) for speed — gets business data from model knowledge.

Usage:
  XAI_API_KEY=... python3 scripts/scrape-detailers-grok.py [--count N] [--start N]
"""

import json
import sys
import os
import time
import urllib.request
import urllib.error
import re

XAI_API_KEY = os.environ.get("XAI_API_KEY", "")
API_URL = "https://api.x.ai/v1/chat/completions"
MODEL = "grok-3-fast"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "..", "data")
CITIES_FILE = os.path.join(DATA_DIR, "cities.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "scraped-detailers-grok.json")
ALREADY_SCRAPED_FILE = os.path.join(DATA_DIR, "scraped-detailers-v2.json")


def load_cities():
    with open(CITIES_FILE) as f:
        return json.load(f)


def load_already_scraped():
    scraped_cities = set()
    # From Brave scraper (v2)
    if os.path.exists(ALREADY_SCRAPED_FILE):
        with open(ALREADY_SCRAPED_FILE) as f:
            data = json.load(f)
        businesses = data if isinstance(data, list) else data.get("businesses", [])
        for item in businesses:
            if isinstance(item, dict):
                scraped_cities.add(f"{item.get('city','')},{item.get('state_code','')}")
    # From previous Grok runs
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE) as f:
            data = json.load(f)
        for item in data:
            if isinstance(item, dict):
                scraped_cities.add(f"{item.get('city','')},{item.get('state_code','')}")
    return scraped_cities


def search_detailers(city, state, state_code):
    prompt = (
        f'List 8 real auto detailing businesses in {city}, {state_code}.\n'
        f'Return ONLY a JSON array with each having:\n'
        f'- "business_name": string\n'
        f'- "phone": string or null\n'
        f'- "website": string URL or null\n'
        f'- "address": street address string or null\n'
        f'- "description": 1 sentence about their services\n'
        f'Only include REAL businesses you are confident actually exist.'
    )

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a business data extraction tool. Return ONLY valid JSON arrays. No markdown, no explanations, no extra text."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
    }

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {XAI_API_KEY}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            result = json.loads(resp.read())

        content = result["choices"][0]["message"]["content"]

        # Clean up response
        content = content.strip()
        if content.startswith("```"):
            content = re.sub(r"^```\w*\n?", "", content)
            content = re.sub(r"\n?```$", "", content)

        # Find JSON array
        match = re.search(r"\[.*\]", content, re.DOTALL)
        if match:
            content = match.group(0)

        businesses = json.loads(content)
        if not isinstance(businesses, list):
            return []

        # Tag each with city/state and generate slug
        for biz in businesses:
            biz["city"] = city
            biz["state"] = state
            biz["state_code"] = state_code
            # Generate slug
            name = biz.get("business_name", "")
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            biz["slug"] = slug

        return businesses

    except json.JSONDecodeError as e:
        print(f"  ⚠️ JSON parse error: {e}", file=sys.stderr)
        return []
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:200]
        print(f"  ❌ HTTP {e.code}: {body}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"  ❌ Error: {e}", file=sys.stderr)
        return []


def main():
    if not XAI_API_KEY:
        print("Error: XAI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    count = 100
    start = 0
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--count" and i + 1 < len(args):
            count = int(args[i + 1])
            i += 2
        elif args[i] == "--start" and i + 1 < len(args):
            start = int(args[i + 1])
            i += 2
        else:
            i += 1

    cities = load_cities()
    already_scraped = load_already_scraped()

    cities.sort(key=lambda c: c.get("population", 0), reverse=True)
    remaining = [c for c in cities if f"{c['name']},{c['state_code']}" not in already_scraped]

    print(f"Total cities: {len(cities)}")
    print(f"Already scraped: {len(already_scraped)}")
    print(f"Remaining: {len(remaining)}")
    print(f"Scraping {count} cities starting at index {start}")
    print()

    # Load existing grok results
    all_businesses = []
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE) as f:
            all_businesses = json.load(f)
        print(f"Loaded {len(all_businesses)} existing from prior grok runs")

    batch = remaining[start:start + count]
    total_new = 0
    errors = 0

    for i, city in enumerate(batch):
        name = city["name"]
        sc = city["state_code"]
        pop = city.get("population", 0)

        print(f"[{i+1}/{len(batch)}] {name}, {sc} (pop: {pop:,})...", end=" ", flush=True)

        businesses = search_detailers(name, city["state"], sc)

        if businesses:
            all_businesses.extend(businesses)
            total_new += len(businesses)
            print(f"✅ {len(businesses)} found (total: {len(all_businesses)})")
            errors = 0
        else:
            print("❌ 0 found")
            errors += 1
            if errors >= 5:
                print("\n⚠️ 5 consecutive errors — stopping.")
                break

        # Save after every 5 cities
        if (i + 1) % 5 == 0:
            with open(OUTPUT_FILE, "w") as f:
                json.dump(all_businesses, f)

        # Rate limit — 2 seconds between requests
        time.sleep(2)

    # Final save
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_businesses, f)

    print(f"\n{'='*50}")
    print(f"Done! {total_new} new businesses from {len(batch)} cities")
    print(f"Total in grok scrape file: {len(all_businesses)}")


if __name__ == "__main__":
    main()
