'use client';

import { useEffect } from 'react';

interface Props {
  path: string;
  listingId?: string;
}

export default function PageViewTracker({ path, listingId }: Props) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        listing_id: listingId ?? null,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, [path, listingId]);

  return null;
}
