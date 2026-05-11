import type { MetadataRoute } from 'next';
import { getAllCities, getAllListingSlugs } from '@/lib/data';
import { US_STATES } from '@/types';
import { absoluteUrl, buildCityUrl, buildListingUrl } from '@/lib/utils';

export const revalidate = 3600;

/**
 * Next.js 14+ supports returning an array of sitemaps via generateSitemaps()
 * For now we use a single flat sitemap which Next.js will auto-split at 50K URLs.
 * With ~6,700 cities + 50 states + ~570 listings + static pages ≈ ~7,400 URLs total.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ──
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: absoluteUrl('/states'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl('/pricing'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/claim'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // ── State pages (50 states) ──
  const statePages: MetadataRoute.Sitemap = US_STATES.map((state) => ({
    url: absoluteUrl(`/${state.slug}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // ── City pages (6,695+) ──
  let cityPages: MetadataRoute.Sitemap = [];
  let listingPages: MetadataRoute.Sitemap = [];

  try {
    const [cities, slugs] = await Promise.all([getAllCities(), getAllListingSlugs()]);

    cityPages = cities.map((city) => ({
      url: absoluteUrl(buildCityUrl(city.name, city.state_code)),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    listingPages = slugs.map((l) => ({
      url: absoluteUrl(
        buildListingUrl({ state_code: l.state_code, city: l.city, slug: l.slug })
      ),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Silently skip if data not available at build time
  }

  // ── Blog posts ──
  const blogPosts: MetadataRoute.Sitemap = [
    'ceramic-coating-vs-ppf',
    'how-often-should-you-detail-your-car',
    'what-is-paint-correction',
    'mobile-detailing-vs-shop',
    'should-you-detail-a-new-car',
  ].map((slug) => ({
    url: absoluteUrl(`/blog/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...statePages, ...cityPages, ...listingPages, ...blogPosts];
}
