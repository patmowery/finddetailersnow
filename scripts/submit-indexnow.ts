#!/usr/bin/env npx tsx
/**
 * Submit URLs to IndexNow (Bing, Yandex, DuckDuckGo, Seznam, Naver)
 * This notifies search engines about new/updated pages.
 * 
 * Usage: npx tsx scripts/submit-indexnow.ts [--all | --cities | --states | --blog]
 */

const SITE = 'https://finddetailersnow.com';
const INDEX_NOW_KEY = '31733df87061ae7f43d1eb94e214c797';
const INDEX_NOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

// We import data at runtime to get all city slugs
async function getUrls(mode: string): Promise<string[]> {
  const urls: string[] = [];
  
  if (mode === 'all' || mode === 'static') {
    urls.push(
      `${SITE}/`,
      `${SITE}/states`,
      `${SITE}/blog`,
      `${SITE}/pricing`,
      `${SITE}/claim`,
      `${SITE}/about`,
      `${SITE}/contact`,
    );
  }

  // Import cities data dynamically
  const { CITIES } = await import('../data/cities.js');
  const { US_STATES } = await import('../types/index.js');

  if (mode === 'all' || mode === 'states') {
    for (const state of US_STATES) {
      urls.push(`${SITE}/${state.slug}`);
    }
  }

  if (mode === 'all' || mode === 'cities') {
    const stateMap = new Map(US_STATES.map((s: any) => [s.code, s.slug]));
    for (const city of CITIES) {
      const stateSlug = stateMap.get(city.state_code) || city.state_code.toLowerCase();
      urls.push(`${SITE}/${stateSlug}/${city.slug}`);
    }
  }

  if (mode === 'all' || mode === 'blog') {
    const blogSlugs = [
      'ceramic-coating-vs-ppf',
      'how-often-detail-your-car',
      'paint-correction-guide',
      'mobile-detailing-vs-shop',
      'should-you-detail-a-new-car',
    ];
    for (const slug of blogSlugs) {
      urls.push(`${SITE}/blog/${slug}`);
    }
  }

  return urls;
}

async function submitBatch(urls: string[]): Promise<void> {
  // IndexNow accepts max 10,000 URLs per request
  const BATCH_SIZE = 10000;
  
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    
    const body = {
      host: 'finddetailersnow.com',
      key: INDEX_NOW_KEY,
      keyLocation: `${SITE}/${INDEX_NOW_KEY}.txt`,
      urlList: batch,
    };

    console.log(`Submitting batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} URLs...`);

    const response = await fetch(INDEX_NOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok || response.status === 202) {
      console.log(`  ✅ Accepted (${response.status})`);
    } else {
      const text = await response.text();
      console.error(`  ❌ Failed (${response.status}): ${text}`);
    }

    // Small delay between batches
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function main() {
  const mode = process.argv[2]?.replace('--', '') || 'all';
  console.log(`IndexNow submission — mode: ${mode}`);
  console.log(`Key: ${INDEX_NOW_KEY}`);
  console.log('');

  const urls = await getUrls(mode);
  console.log(`Total URLs to submit: ${urls.length}`);
  console.log(`Sample: ${urls.slice(0, 5).join(', ')}...`);
  console.log('');

  await submitBatch(urls);
  console.log('\nDone!');
}

main().catch(console.error);
