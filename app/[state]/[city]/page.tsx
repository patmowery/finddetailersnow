import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getListingsByCity, getCityBySlug, getCitiesByState } from '@/lib/data';
import { getStateBySlug, toTitleCase, buildCityUrl } from '@/lib/utils';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import type { ServiceType } from '@/types';

// Revalidate every 60 seconds so profile edits show up quickly
export const revalidate = 60;

interface Props {
  params: Promise<{ state: string; city: string }>;
  searchParams: Promise<{
    service?: string | string[];
    price?: string | string[];
    rating?: string;
  }>;
}

// Deterministic "random" based on city name — produces consistent values for SSG
function cityHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const YEAR = new Date().getFullYear();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const stateInfo = getStateBySlug(stateSlug);
  if (!stateInfo) return {};

  const cityName = toTitleCase(citySlug);

  return {
    title: `Best Auto Detailing in ${cityName}, ${stateInfo.code} (${YEAR})`,
    description: `Find the ${YEAR} best auto detailers in ${cityName}, ${stateInfo.name}. Compare ceramic coating, PPF, paint correction & mobile detailing pros. Read reviews, get quotes.`,
    alternates: {
      canonical: `https://finddetailersnow.com/${stateSlug}/${citySlug}`,
    },
    openGraph: {
      title: `Best Auto Detailing in ${cityName}, ${stateInfo.name} (${YEAR})`,
      description: `Top-rated auto detailing shops and mobile detailers in ${cityName}, ${stateInfo.name}. Compare prices, read reviews.`,
      type: 'website',
    },
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { state: stateSlug, city: citySlug } = await params;
  const sp = await searchParams;

  const stateInfo = getStateBySlug(stateSlug);
  if (!stateInfo) notFound();

  // Normalize filter params
  const services = sp.service
    ? Array.isArray(sp.service)
      ? sp.service
      : [sp.service]
    : [];
  const prices = sp.price
    ? Array.isArray(sp.price)
      ? sp.price
      : [sp.price]
    : [];
  const minRating = sp.rating ? parseFloat(sp.rating) : undefined;

  const cityName = toTitleCase(citySlug);

  const listings = await getListingsByCity(cityName, stateInfo.code, {
    services: services as ServiceType[],
    priceRange: prices,
    minRating,
  }).catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#1e3a5f]">Home</Link>
        <span>/</span>
        <Link href="/states" className="hover:text-[#1e3a5f]">States</Link>
        <span>/</span>
        <Link href={`/${stateSlug}`} className="hover:text-[#1e3a5f]">{stateInfo.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{cityName}</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Auto Detailing in {cityName}, {stateInfo.name}
        </h1>
        <p className="mt-2 text-gray-500">
          {listings.length > 0
            ? `${listings.length} detailing ${listings.length === 1 ? 'business' : 'businesses'} found`
            : 'No results found — try adjusting your filters'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Suspense>
            <FilterSidebar />
          </Suspense>
        </div>

        {/* Results */}
        <div className="flex-1">
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No detailers found</h3>
              <p className="text-gray-500 mb-4">
                We don&apos;t have any listings for {cityName} yet.
              </p>
              <Link
                href="/claim"
                className="inline-block bg-[#ff6b35] hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Add Your Business
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rich SEO content block — unique per city */}
      <CityContent cityName={cityName} stateInfo={stateInfo} stateSlug={stateSlug} listingCount={listings.length} />
    </div>
  );
}

/* ── Unique per-city SEO content ─────────────────────────────────────────── */

async function CityContent({
  cityName,
  stateInfo,
  stateSlug,
  listingCount,
}: {
  cityName: string;
  stateInfo: { name: string; code: string };
  stateSlug: string;
  listingCount: number;
}) {
  const h = cityHash(cityName + stateInfo.code);

  // Deterministic content variants
  const avgPrices = [
    { basic: '$80–$150', full: '$200–$400', ceramic: '$500–$1,500', ppf: '$1,200–$5,000' },
    { basic: '$60–$120', full: '$180–$350', ceramic: '$450–$1,200', ppf: '$1,000–$4,500' },
    { basic: '$100–$180', full: '$250–$500', ceramic: '$600–$2,000', ppf: '$1,500–$6,000' },
    { basic: '$70–$130', full: '$190–$380', ceramic: '$500–$1,400', ppf: '$1,100–$5,200' },
  ];
  const prices = avgPrices[h % avgPrices.length];

  const weatherTips = [
    `${cityName}'s hot summers mean UV damage is a real concern — ceramic coatings and PPF are especially popular here to protect against sun fade and oxidation.`,
    `With seasonal weather changes in ${cityName}, regular detailing helps protect your vehicle from pollen, road salt, and temperature swings that damage paint.`,
    `${cityName} drivers deal with everything from rain to intense sun. A quality ceramic coating provides year-round protection and makes maintenance washes easier.`,
    `The climate in ${cityName} can be tough on vehicles. Professional detailing removes contaminants and adds protective layers that extend your car's finish life.`,
  ];
  const weatherTip = weatherTips[h % weatherTips.length];

  const faqs = [
    {
      q: `How much does auto detailing cost in ${cityName}?`,
      a: `In ${cityName}, ${stateInfo.name}, basic exterior detailing typically costs ${prices.basic}, while a full interior and exterior detail runs ${prices.full}. Ceramic coating starts at ${prices.ceramic} and paint protection film (PPF) ranges from ${prices.ppf} depending on coverage.`,
    },
    {
      q: `How often should I get my car detailed in ${cityName}?`,
      a: `Most detailing professionals in ${cityName} recommend a full detail every 4–6 months, with maintenance washes in between. If you park outdoors or drive frequently, every 3 months is ideal. Ceramic coated vehicles can go longer between full details.`,
    },
    {
      q: `What's the difference between car washing and auto detailing?`,
      a: `A car wash is a surface-level clean. Auto detailing in ${cityName} includes thorough decontamination, clay bar treatment, polishing, interior deep cleaning, and protective coatings. It's a comprehensive restoration vs. a quick rinse.`,
    },
    {
      q: `Is ceramic coating worth it in ${cityName}, ${stateInfo.code}?`,
      a: `Yes — ceramic coating is one of the most popular services among ${cityName} car owners. It provides 2-5 years of protection against UV rays, bird droppings, tree sap, and minor scratches. The upfront cost (${prices.ceramic}) pays for itself in reduced maintenance and paint preservation.`,
    },
    {
      q: `Do mobile detailers in ${cityName} do as good a job as shops?`,
      a: `Many of the top-rated detailers in ${cityName} are mobile operators. They bring professional-grade equipment to your home or office. For services like ceramic coating and PPF that require controlled environments, a shop may be preferred.`,
    },
  ];

  // Nearby cities for internal linking
  const nearbyCities = await getCitiesByState(stateInfo.code);
  const otherCities = nearbyCities
    .filter((c) => c.name.toLowerCase() !== cityName.toLowerCase())
    .slice(0, 8);

  return (
    <>
      {/* Main SEO content */}
      <section className="mt-16 prose prose-gray max-w-none">
        <h2>Auto Detailing Services in {cityName}, {stateInfo.name}</h2>
        <p>
          Looking for professional auto detailing in {cityName}, {stateInfo.code}? FindDetailersNow
          is the #1 directory for finding top-rated auto detailing shops and mobile detailers
          serving the {cityName} area. Whether you need a basic wash and wax, full interior
          detail, ceramic coating, paint correction, or paint protection film (PPF), our directory
          helps you compare the best professionals and book with confidence.
        </p>

        <p>{weatherTip}</p>

        <h3>Detailing Services in {cityName}</h3>
        <ul>
          <li><strong>Full Auto Detailing</strong> — Complete interior and exterior packages including hand wash, clay bar, polish, and wax or sealant</li>
          <li><strong>Ceramic Coating</strong> — Professional-grade nano-ceramic protection (9H hardness) lasting 2-5+ years</li>
          <li><strong>Paint Protection Film (PPF)</strong> — Self-healing clear bra for front end, full body, or high-impact areas</li>
          <li><strong>Paint Correction</strong> — Multi-stage machine polishing to remove swirl marks, scratches, and oxidation</li>
          <li><strong>Mobile Detailing</strong> — Certified professionals come to your home or office in {cityName}</li>
          <li><strong>Interior Detailing</strong> — Deep extraction cleaning, leather conditioning, steam cleaning, and odor elimination</li>
        </ul>

        <h3>Average Detailing Prices in {cityName}, {stateInfo.code}</h3>
        <div className="not-prose">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Service</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Price Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2.5">Basic Exterior Detail</td><td className="px-4 py-2.5">{prices.basic}</td></tr>
                <tr><td className="px-4 py-2.5">Full Interior + Exterior</td><td className="px-4 py-2.5">{prices.full}</td></tr>
                <tr><td className="px-4 py-2.5">Ceramic Coating</td><td className="px-4 py-2.5">{prices.ceramic}</td></tr>
                <tr><td className="px-4 py-2.5">Paint Protection Film (PPF)</td><td className="px-4 py-2.5">{prices.ppf}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <h3>How to Choose an Auto Detailer in {cityName}</h3>
        <ol>
          <li><strong>Check reviews and ratings</strong> — Look for consistent 4.5+ star reviews from verified customers</li>
          <li><strong>Ask about products used</strong> — Top {cityName} detailers use professional-grade products (Gyeon, CQUARTZ, XPEL, SunTek)</li>
          <li><strong>Request before/after photos</strong> — Quality detailers document their work</li>
          <li><strong>Compare quotes</strong> — Get estimates from 2-3 detailers before committing</li>
          <li><strong>Verify insurance and certifications</strong> — Especially for ceramic coating and PPF installation</li>
        </ol>
      </section>

      {/* FAQ Schema + Visual */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About Auto Detailing in {cityName}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white border border-gray-200 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-gray-900 hover:text-[#1e3a5f]">
                {faq.q}
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-gray-600">{faq.a}</div>
            </details>
          ))}
        </div>

        {/* JSON-LD FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.a,
                },
              })),
            }),
          }}
        />
      </section>

      {/* Nearby Cities — internal linking for SEO */}
      {otherCities.length > 0 && (
        <section className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Auto Detailing in Other {stateInfo.name} Cities
          </h2>
          <div className="flex flex-wrap gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.id}
                href={buildCityUrl(c.name, c.state_code)}
                className="px-4 py-2 bg-gray-50 hover:bg-[#1e3a5f] hover:text-white text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
