import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getListingBySlug, getReviewsByListing } from '@/lib/data';
import { getStateBySlug, buildCityUrl, formatPhone, absoluteUrl } from '@/lib/utils';
import ReviewStars from '@/components/ReviewStars';
import ServiceBadges from '@/components/ServiceBadges';
import { SERVICE_LABELS } from '@/types';

interface Props {
  params: Promise<{ state: string; city: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug).catch(() => null);
  if (!listing) return {};

  return {
    title: `${listing.business_name} – Auto Detailing in ${listing.city}, ${listing.state_code}`,
    description:
      listing.description ??
      `${listing.business_name} offers professional auto detailing services in ${listing.city}, ${listing.state_code}. Read reviews and contact them today.`,
    alternates: {
      canonical: absoluteUrl(`/${getStateBySlug(listing.state_code.toLowerCase())?.slug ?? listing.state_code.toLowerCase()}/${listing.city.toLowerCase().replace(/\s+/g, '-')}/${listing.slug}`),
    },
    openGraph: {
      title: listing.business_name,
      description: listing.description ?? undefined,
      images: listing.cover_image_url ? [{ url: listing.cover_image_url }] : [],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { state: stateSlug, city: citySlug, slug } = await params;
  const stateInfo = getStateBySlug(stateSlug);
  if (!stateInfo) notFound();

  const listing = await getListingBySlug(slug).catch(() => null);
  const reviews = listing ? await getReviewsByListing(listing.id).catch(() => []) : [];

  if (!listing) notFound();

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.business_name,
    description: listing.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressRegion: listing.state_code,
      postalCode: listing.zip,
      addressCountry: 'US',
    },
    telephone: listing.phone,
    email: listing.email,
    url: listing.website,
    image: listing.cover_image_url ?? listing.logo_url,
    aggregateRating:
      listing.review_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: listing.rating.toFixed(1),
            reviewCount: listing.review_count,
          }
        : undefined,
    geo:
      listing.lat && listing.lng
        ? { '@type': 'GeoCoordinates', latitude: listing.lat, longitude: listing.lng }
        : undefined,
  };

  const cityUrl = buildCityUrl(listing.city, listing.state_code);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#1e3a5f]">Home</Link>
          <span>/</span>
          <Link href={`/${stateSlug}`} className="hover:text-[#1e3a5f]">{stateInfo.name}</Link>
          <span>/</span>
          <Link href={cityUrl} className="hover:text-[#1e3a5f]">{listing.city}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{listing.business_name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover image */}
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7a] rounded-2xl overflow-hidden">
              {listing.cover_image_url && (
                <Image
                  src={listing.cover_image_url}
                  alt={listing.business_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              )}
              {listing.is_featured && (
                <span className="absolute top-4 right-4 bg-[#ff6b35] text-white text-sm font-bold px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>

            {/* Business header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {listing.logo_url && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <Image
                      src={listing.logo_url}
                      alt={`${listing.business_name} logo`}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {listing.business_name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <ReviewStars rating={listing.rating} count={listing.review_count} size="md" />
                    {listing.price_range && (
                      <span className="text-gray-500 font-medium">{listing.price_range}</span>
                    )}
                    {listing.years_in_business && (
                      <span className="text-sm text-gray-400">
                        {listing.years_in_business} yrs in business
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {listing.address && `${listing.address}, `}
                    {listing.city}, {listing.state_code} {listing.zip}
                  </p>
                </div>
              </div>

              {listing.is_claimed ? (
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Claimed & Verified
                </span>
              ) : (
                <Link
                  href={`/claim?listing=${listing.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#ff6b35] bg-orange-50 px-2.5 py-1 rounded-full font-medium hover:bg-orange-100 transition-colors"
                >
                  Is this your business? Claim it
                </Link>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Services */}
            {listing.services.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Services Offered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.services.map((svc) => (
                    <div key={svc} className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#ff6b35] flex-shrink-0" />
                      <span className="text-gray-700">{SERVICE_LABELS[svc]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Reviews ({reviews.length})
                </h2>
                {listing.review_count > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {listing.rating.toFixed(1)}
                    </span>
                    <ReviewStars rating={listing.rating} size="lg" />
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.author_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
                          <ReviewStars rating={review.rating} size="sm" />
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed pl-12">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {listing.phone && (
                  <a
                    href={`tel:${listing.phone}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-[#1e3a5f] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-[#1e3a5f] flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-[#1e3a5f] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="font-medium">{formatPhone(listing.phone)}</span>
                  </a>
                )}

                {listing.email && (
                  <a
                    href={`mailto:${listing.email}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-[#1e3a5f] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-[#1e3a5f] flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-[#1e3a5f] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium truncate">{listing.email}</span>
                  </a>
                )}

                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-[#1e3a5f] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-[#1e3a5f] flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-[#1e3a5f] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <span className="font-medium truncate">Visit Website</span>
                  </a>
                )}

                {listing.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${listing.address}, ${listing.city}, ${listing.state_code}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-[#1e3a5f] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-[#1e3a5f] flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-[#1e3a5f] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm">{listing.address}, {listing.city}</span>
                  </a>
                )}
              </div>

              {/* Services badges */}
              {listing.services.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <ServiceBadges services={listing.services} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
