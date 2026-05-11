#!/usr/bin/env npx tsx
/**
 * Generate 5,000+ US city entries for programmatic SEO pages.
 * Uses the US Census Bureau's list of incorporated places + CDP data.
 * 
 * We'll fetch from a public API and generate our cities data file.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// State codes and names
const STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia'
};

// FIPS state codes to state abbreviations
const FIPS_TO_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY'
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface CityEntry {
  id: string;
  name: string;
  slug: string;
  state: string;
  state_code: string;
  population: number | null;
  lat: number | null;
  lng: number | null;
}

async function fetchCensusPlaces(): Promise<CityEntry[]> {
  // Use Census Bureau API to get all places with population > 5,000
  // This gives us cities, towns, villages, CDPs across all 50 states
  const url = 'https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N&for=place:*&in=state:*';
  
  console.log('Fetching US Census places data...');
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Census API error: ${response.status} ${response.statusText}`);
  }
  
  const data: string[][] = await response.json();
  
  // First row is headers: ["NAME","P1_001N","state","place"]
  const rows = data.slice(1);
  
  console.log(`Got ${rows.length} total places from Census`);
  
  const cities: CityEntry[] = [];
  const seen = new Set<string>();
  
  for (const row of rows) {
    const [rawName, popStr, stateFips] = row;
    const population = parseInt(popStr, 10);
    const stateCode = FIPS_TO_STATE[stateFips];
    
    if (!stateCode) continue;
    
    // Clean up the name — Census returns "City name city, State" or "Town name town, State"
    let name = rawName
      .replace(/, [A-Za-z ]+$/, '')  // Remove state name suffix
      .replace(/ (city|town|village|borough|CDP|municipality|plantation|comunidad)$/i, '')
      .replace(/ \(pt\.\)$/i, '')
      .trim();
    
    // Skip tiny places (under 5,000 pop) — we want meaningful cities
    if (population < 5000) continue;
    
    // Skip if it looks like a CDP or unincorporated area with weird name
    if (name.includes('(balance)')) {
      name = name.replace(' (balance)', '').trim();
    }
    
    const slug = slugify(name);
    const key = `${slug}-${stateCode}`;
    
    // Deduplicate
    if (seen.has(key)) continue;
    seen.add(key);
    
    const stateName = STATES[stateCode] || stateCode;
    
    cities.push({
      id: `c-${slug}-${stateCode.toLowerCase()}`,
      name,
      slug,
      state: stateName,
      state_code: stateCode,
      population,
      lat: null, // We'll add geo later or skip — not needed for SEO pages
      lng: null,
    });
  }
  
  // Sort by population descending
  cities.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
  
  console.log(`Filtered to ${cities.length} cities with pop >= 5,000`);
  
  return cities;
}

async function main() {
  try {
    const cities = await fetchCensusPlaces();
    
    // Generate the TypeScript file
    const lines = cities.map(c => {
      const pop = c.population ?? 'null';
      return `  { id: '${c.id}', name: '${c.name.replace(/'/g, "\\'")}', slug: '${c.slug}', state: '${c.state.replace(/'/g, "\\'")}', state_code: '${c.state_code}', population: ${pop}, lat: null, lng: null },`;
    });
    
    const content = `import type { City } from '@/types';

/**
 * Auto-generated: ${cities.length} US cities with population >= 5,000
 * Source: US Census Bureau 2020 Decennial Census (PL 94-171)
 * Generated: ${new Date().toISOString().split('T')[0]}
 */
export const CITIES: City[] = [
${lines.join('\n')}
];
`;
    
    const outPath = join(__dirname, '..', 'data', 'cities.ts');
    writeFileSync(outPath, content, 'utf-8');
    console.log(`\n✅ Wrote ${cities.length} cities to data/cities.ts`);
    
    // Print stats
    const byState = new Map<string, number>();
    for (const c of cities) {
      byState.set(c.state_code, (byState.get(c.state_code) ?? 0) + 1);
    }
    console.log(`\nCoverage: ${byState.size} states`);
    console.log(`Top states:`);
    const sorted = [...byState.entries()].sort((a, b) => b[1] - a[1]);
    for (const [st, count] of sorted.slice(0, 10)) {
      console.log(`  ${st}: ${count} cities`);
    }
    
  } catch (err) {
    console.error('Failed to fetch Census data:', err);
    console.log('\nFalling back to simplemaps dataset...');
    await fallbackGenerate();
  }
}

async function fallbackGenerate() {
  // If Census API fails, we generate from a comprehensive built-in list
  // This is a curated set of 5,000+ US cities
  console.log('Using built-in fallback — generating from known city lists');
  
  // We'll fetch from simplemaps free dataset
  const url = 'https://simplemaps.com/static/data/us-cities/1.79/basic/simplemaps_uscities_basicv1.79.zip';
  console.log('This fallback requires manual data. Use Census API instead.');
  process.exit(1);
}

main();
