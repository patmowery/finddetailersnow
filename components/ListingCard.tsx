import Link from 'next/link';
import Image from 'next/image';
import { type Listing } from '@/types';
import ReviewStars from './ReviewStars';
import ServiceBadges from './ServiceBadges';
import { buildListingUrl, formatPhone } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const href = buildListingUrl(listing);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${listing.is_featured ? 'ring-2 ring-[#ff6b35]' : ''}`}>
      {/* Cover / placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7a]">
        {listing.cover_image_url && (
          <Image
            src={listing.cover_image_url}
            alt={listing.business_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        )}
        {listing.is_featured && (
          <span className="absolute top-2 right-2 bg-[#ff6b35] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {listing.is_premium && !listing.is_featured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            Premium
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          {listing.logo_url && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 -mt-8 border-2 border-white shadow">
              <Image
                src={listing.logo_url}
                alt={`${listing.business_name} logo`}
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <Link href={href}>
              <h3 className="font-semibold text-gray-900 hover:text-[#1e3a5f] truncate transition-colors">
                {listing.business_name}
              </h3>
            </Link>

            <div className="flex items-center gap-2 mt-1">
              <ReviewStars rating={listing.rating} count={listing.review_count} size="sm" />
              {listing.price_range && (
                <span className="text-sm text-gray-500 font-medium">{listing.price_range}</span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-1">
              {listing.city}, {listing.state_code}
            </p>
          </div>
        </div>

        {listing.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{listing.description}</p>
        )}

        <div className="mt-3">
          <ServiceBadges services={listing.services} max={3} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          {listing.phone && (
            <a
              href={`tel:${listing.phone}`}
              className="text-sm text-[#1e3a5f] font-medium hover:text-[#ff6b35] transition-colors"
            >
              {formatPhone(listing.phone)}
            </a>
          )}
          <Link
            href={href}
            className="ml-auto text-sm font-semibold text-[#ff6b35] hover:text-orange-600 transition-colors"
          >
            View Profile &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
