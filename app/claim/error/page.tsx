'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const messages: Record<string, { title: string; desc: string }> = {
    missing_token: {
      title: 'Missing Verification Link',
      desc: 'The verification link appears to be incomplete. Please check your email and try clicking the link again.',
    },
    invalid_token: {
      title: 'Invalid Verification Link',
      desc: 'This verification link is not valid. It may have already been used or the link is incorrect.',
    },
    expired: {
      title: 'Link Expired',
      desc: 'This verification link has expired (valid for 48 hours). Please submit a new claim to get a fresh verification email.',
    },
    server_error: {
      title: 'Something Went Wrong',
      desc: 'We ran into an issue verifying your claim. Please try again or contact us at hello@finddetailersnow.com.',
    },
  };

  const { title, desc } = messages[reason || ''] || messages.server_error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 mb-6">{desc}</p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
          <a
            href="mailto:hello@finddetailersnow.com"
            className="block w-full text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ClaimErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
