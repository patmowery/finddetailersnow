'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const already = searchParams.get('already');
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';
  const upgradeParams = listingId ? `?listing=${listingId}&email=${encodeURIComponent(email)}` : '';

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      {already ? (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Already Verified!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your business has already been verified. You&apos;re all set!
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">🎉 Business Verified!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your business is now verified on FindDetailersNow.com. 
            Customers can see your verified badge and trust your listing.
          </p>
        </>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-bold text-blue-900 mb-2">What you get:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span>✅</span>
            <span>Verified badge on your listing</span>
          </li>
          <li className="flex gap-2">
            <span>📍</span>
            <span>Your business shows up in city search results</span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>Basic analytics on listing views</span>
          </li>
        </ul>
        
        <hr className="my-4 border-blue-200" />
        
        <h3 className="font-bold text-blue-900 mb-2">Want more customers?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span>⭐</span>
            <span><strong>Pro ($29/mo)</strong> — Priority placement, customer reviews, photo gallery, click-to-call</span>
          </li>
          <li className="flex gap-2">
            <span>🏆</span>
            <span><strong>Featured ($79/mo)</strong> — Homepage spotlight, featured badge, top-of-city placement</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href={`/pricing${upgradeParams}`}
          className="px-6 py-3 bg-[#ff6b35] hover:bg-orange-500 text-white font-semibold rounded-xl transition-colors"
        >
          Upgrade Your Listing →
        </Link>
      </div>
    </div>
  );
}

export default function ClaimSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Loading...</h1>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
