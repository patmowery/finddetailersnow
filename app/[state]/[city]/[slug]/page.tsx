import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  getListingBySlug,
  getReviewsByListing,
  getBusinessPhotos,
  getBusinessServices,
  getReviewResponses,
} from '@/lib/data';
import { getStateBySlug, buildCityUrl, absoluteUrl } from '@/lib/utils';
import ReviewStars from '@/components/ReviewStars';
import ServiceBadges from '@/components/ServiceBadges';
import ContactCard from '@/components/ContactCard';
import PageViewTracker from '@/components/PageViewTracker';
import { SERVICE_LABELS } from '@/types';

// Revalidate every 60 seconds so profile edits show up quickly
export const revalidate = 60;

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

function formatPrice(from: number | null, to: number | null) {
  if (from == null && to == null) return null;
  if (from != null && to != null) return `$${from}–$${to}`;
  if (from != null) return `From $${from}`;
  return `Up to $${to}`;
}

function formatDuration(mins: number | null) {
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h} hr`;
}

export default async function ListingPage({ params }: Props) {
  const { state: stateSlug, city: citySlug, slug } = await params;
  const stateInfo = getStateBySlug(stateSlug);
  if (!stateInfo) notFound();

  const listing = await getListingBySlug(slug).catch(() => null);
  if (!listing) notFound();

  const [reviews, photos, services, reviewResponses] = await Promise.all([
    getReviewsByListing(listing.id).catch(() => []),
    getBusinessPhotos(listing.id).catch(() => []),
    getBusinessServices(listing.id).catch(() => []),
    getReviewResponses(listing.id).catch(() => []),
  ]);

  // Build response map for O(1) lookup
  const responseMap = new Map(reviewResponses.map((r) => [r.review_id, r]));

  // Photos
  const coverPhoto = photos.find((p) => p.photo_type === 'cover');
  const logoPhoto = photos.find((p) => p.photo_type === 'logo');
  const galleryPhotos = photos.filter((p) => p.photo_type === 'gallery');
  const effectiveCover = coverPhoto?.url ?? listing.cover_image_url;
  const effectiveLogo = logoPhoto?.url ?? listing.logo_url;

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
    image: effectiveCover ?? effectiveLogo,
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
  const currentPath = `/${stateSlug}/${citySlug}/${slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageViewTracker path={currentPath} listingId={listing.id} />

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
              {effectiveCover && (
                <Image
                  src={effectiveCover}
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
                {effectiveLogo && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <Image
                      src={effectiveLogo}
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

            {/* Gallery photos */}
            {galleryPhotos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Our Work</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={photo.url}
                        alt={photo.alt_text ?? `${listing.business_name} work photo`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services — detailed pricing if available, otherwise basic list */}
            {services.length > 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Services & Pricing</h2>
                <div className="divide-y divide-gray-50">
                  {services.map((svc) => {
                    const price = formatPrice(svc.price_from, svc.price_to);
                    const duration = formatDuration(svc.duration_minutes);
                    return (
                      <div key={svc.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{svc.service_name}</p>
                            {svc.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{svc.description}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {price && (
                              <p className="font-bold text-[#ff6b35] text-sm">{price}</p>
                            )}
                            {duration && (
                              <p className="text-xs text-gray-400">{duration}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : listing.services.length > 0 ? (
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
            ) : null}

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
                  {reviews.map((review) => {
                    const ownerResponse = responseMap.get(review.id);
                    return (
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
                        {/* Owner response */}
                        {ownerResponse && (
                          <div className="ml-12 mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-xs font-semibold text-[#1e3a5f] mb-1">
                              Response from the owner
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {ownerResponse.response_text}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(ownerResponse.responded_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <ContactCard listing={{ ...listing, logo_url: effectiveLogo, cover_image_url: effectiveCover }} />
          </div>
        </div>
      </div>
    </>
  );
}
