'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/forever',
    features: [
      'Basic listing in directory',
      'Contact info displayed',
      'Appear in city searches',
      'Customer reviews',
      'Up to 10 gallery photos',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    highlight: true,
    features: [
      'Everything in Free, plus:',
      'Priority placement in city',
      'Verified business badge',
      'Up to 25 gallery photos',
      'Service menu with pricing',
      'Direct booking URL',
      'Monthly view analytics',
    ],
  },
  {
    id: 'featured',
    name: 'Featured',
    price: '$79',
    period: '/month',
    features: [
      'Everything in Pro, plus:',
      'Homepage & state page spotlight',
      'Featured badge',
      'Up to 50 gallery photos',
      'Priority in all searches',
      'Lead form on listing',
      'Detailed analytics',
    ],
  },
];

function BillingContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';

  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId || !email) { setLoading(false); return; }
    fetch(`/api/listings/analytics?listing=${listingId}&email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => { if (d.tier) setTier(d.tier); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId, email]);

  const authQuery = listingId && email
    ? `?listing=${listingId}&email=${encodeURIComponent(email)}`
    : '';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Billing & Plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your subscription and upgrade your listing.
        </p>
      </div>

      {/* Current plan badge */}
      {!loading && tier && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              tier === 'featured' ? 'bg-yellow-100' : tier === 'pro' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <span className="text-lg">
                {tier === 'featured' ? '⭐' : tier === 'pro' ? '✓' : '○'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Current Plan: <span className={
                  tier === 'featured' ? 'text-yellow-700' : tier === 'pro' ? 'text-blue-700' : 'text-gray-600'
                }>{tier === 'featured' ? 'Featured' : tier === 'pro' ? 'Pro' : 'Free'}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {tier === 'free'
                  ? 'Upgrade to unlock more features and visibility.'
                  : 'Thank you for supporting FindDetailersNow!'}
              </p>
            </div>
          </div>
          {tier !== 'free' && (
            <a
              href="mailto:support@finddetailersnow.com?subject=Cancel my subscription"
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Cancel plan
            </a>
          )}
        </div>
      )}

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = tier === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-5 border-2 shadow-sm ${
                isCurrent
                  ? 'border-[#1e3a5f]'
                  : plan.highlight
                  ? 'border-[#ff6b35]'
                  : 'border-gray-100'
              }`}
            >
              {plan.highlight && !isCurrent && (
                <span className="inline-block bg-[#ff6b35] text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="inline-block bg-[#1e3a5f] text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                  Current Plan
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1 mb-4">
                <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-1.5 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    {!f.startsWith('Everything') ? (
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="w-3.5 flex-shrink-0" />
                    )}
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full text-center text-sm font-medium text-gray-400 py-2 bg-gray-50 rounded-xl">
                  Active Plan
                </div>
              ) : plan.id === 'free' ? (
                <div className="w-full text-center text-sm font-medium text-gray-400 py-2">
                  —
                </div>
              ) : (
                <Link
                  href={`/pricing${authQuery}#${plan.id}`}
                  className={`block w-full text-center text-sm font-bold py-2.5 rounded-xl transition-colors ${
                    plan.highlight
                      ? 'bg-[#ff6b35] hover:bg-orange-500 text-white'
                      : 'bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white'
                  }`}
                >
                  Upgrade to {plan.name}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        Questions? Email us at{' '}
        <a href="mailto:support@finddetailersnow.com" className="hover:text-[#1e3a5f] transition-colors">
          support@finddetailersnow.com
        </a>
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}
