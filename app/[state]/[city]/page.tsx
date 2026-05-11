import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getListingsByCity, getCityBySlug } from '@/lib/data';
import { getStateBySlug, toTitleCase, buildListingUrl } from '@/lib/utils';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import type { ServiceType } from '@/types';

interface Props {
  params: Promise<{ state: string; city: string }>;
  searchParams: Promise<{
    service?: string | string[];
    price?: string | string[];
    rating?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const stateInfo = getStateBySlug(stateSlug);
  if (!stateInfo) return {};

  const cityName = toTitleCase(citySlug);

  return {
    title: `Auto Detailing in ${cityName}, ${stateInfo.name} | FindDetailersNow`,
    description: `Find the best auto detailers, ceramic coating specialists, PPF installers, and mobile detailers in ${cityName}, ${stateInfo.name}. Compare reviews and contact directly.`,
    alternates: {
      canonical: `/${stateSlug}/${citySlug}`,
    },
    openGraph: {
      title: `Auto Detailing in ${cityName}, ${stateInfo.name}`,
      description: `Top-rated auto detailing shops and mobile detailers in ${cityName}, ${stateInfo.name}.`,
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

      {/* SEO text block */}
      <section className="mt-16 prose prose-gray max-w-none">
        <h2>Auto Detailing Services in {cityName}, {stateInfo.name}</h2>
        <p>
          Looking for professional auto detailing in {cityName}? FindDetailersNow connects you
          with the top-rated detailing shops and mobile detailers serving the {cityName} area.
          Whether you need a basic wash and wax, full interior detail, ceramic coating, or
          paint protection film (PPF) installation, our directory helps you find the right
          professional for the job.
        </p>
        <h3>Services Available in {cityName}</h3>
        <ul>
          <li><strong>Auto Detailing</strong> — Complete interior and exterior detailing packages</li>
          <li><strong>Ceramic Coating</strong> — Professional-grade nano-ceramic protection</li>
          <li><strong>Paint Protection Film (PPF)</strong> — Clear bra and full-body wraps</li>
          <li><strong>Paint Correction</strong> — Swirl mark and scratch removal</li>
          <li><strong>Mobile Detailing</strong> — We come to your home or office</li>
          <li><strong>Interior Detailing</strong> — Deep clean, steam, odor elimination</li>
        </ul>
      </section>
    </div>
  );
}
