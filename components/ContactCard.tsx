'use client';

import type { Listing } from '@/types';
import { formatPhone } from '@/lib/utils';
import ServiceBadges from '@/components/ServiceBadges';

interface ContactCardProps {
  listing: Listing;
}

function trackClick(listingId: string, type: string) {
  // Fire-and-forget — never block the user action
  fetch('/api/listings/clicks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listing_id: listingId,
      click_type: type,
      referrer: typeof window !== 'undefined' ? document.referrer : null,
    }),
  }).catch(() => {});
}

export default function ContactCard({ listing }: ContactCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-4">
      <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
      <div className="space-y-3">
        {listing.phone && (
          <a
            href={`tel:${listing.phone}`}
            onClick={() => trackClick(listing.id, 'phone')}
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
            onClick={() => trackClick(listing.id, 'email')}
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
            onClick={() => trackClick(listing.id, 'website')}
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
            onClick={() => trackClick(listing.id, 'directions')}
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

      {listing.services.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <ServiceBadges services={listing.services} />
        </div>
      )}
    </div>
  );
}
