import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Business Dashboard | FindDetailersNow',
  description: 'Manage your auto detailing business listing on FindDetailersNow.',
  robots: { index: false, follow: false },
};

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    current: true,
    features: [
      'Basic business listing',
      'Contact info displayed',
      'Appear in city search',
      'Customer reviews',
    ],
    cta: 'Current Plan',
    ctaStyle: 'bg-gray-200 text-gray-600 cursor-default',
  },
  {
    name: 'Premium',
    price: '$29',
    period: '/month',
    current: false,
    popular: true,
    features: [
      'Everything in Free, plus:',
      '⬆️ Top placement in your city',
      '✅ "Verified Business" badge',
      '📸 Photo gallery (up to 20)',
      '🔗 Direct booking link',
      '📊 Monthly view analytics',
      '🏷️ Highlight your specialties',
    ],
    cta: 'Upgrade to Premium',
    ctaStyle: 'bg-[#ff6b35] hover:bg-orange-500 text-white',
  },
  {
    name: 'Featured',
    price: '$79',
    period: '/month',
    current: false,
    features: [
      'Everything in Premium, plus:',
      '⭐ Homepage spotlight',
      '🗺️ State page feature',
      '🔝 Priority in all searches',
      '🏆 "Featured" badge',
      '📧 Lead form (customers contact you)',
      '📈 Detailed analytics dashboard',
    ],
    cta: 'Upgrade to Featured',
    ctaStyle: 'bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Business Dashboard
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Manage your listing, track performance, and grow your customer base.
          First, claim your business to get started.
        </p>
      </div>

      {/* CTA to claim */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4d7a] text-white rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Haven&apos;t claimed your listing yet?</h2>
          <p className="text-blue-200">
            Search for your business, verify ownership, and unlock your dashboard — it&apos;s free.
          </p>
        </div>
        <Link
          href="/claim"
          className="bg-[#ff6b35] hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-xl transition-colors whitespace-nowrap"
        >
          Claim Your Listing
        </Link>
      </div>

      {/* What you get */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          What Business Owners Get
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Choose the plan that fits your business goals
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white rounded-2xl p-6 border-2 ${
                tier.popular
                  ? 'border-[#ff6b35] shadow-lg relative'
                  : 'border-gray-100 shadow-sm'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff6b35] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-gray-900">{tier.price}</span>
                <span className="text-gray-500 text-sm">{tier.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    {!f.startsWith('Everything') && !f.startsWith('⬆') && !f.startsWith('✅') && !f.startsWith('📸') && !f.startsWith('🔗') && !f.startsWith('📊') && !f.startsWith('🏷') && !f.startsWith('⭐') && !f.startsWith('🗺') && !f.startsWith('🔝') && !f.startsWith('🏆') && !f.startsWith('📧') && !f.startsWith('📈') && (
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.current ? '#' : '/pricing'}
                className={`block w-full text-center font-semibold py-2.5 rounded-xl transition-colors ${tier.ctaStyle}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          💰 Why Detailers Upgrade
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-extrabold text-[#ff6b35]">$200-$500</p>
            <p className="text-gray-600 text-sm mt-1">Average detailing job value</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#ff6b35]">1 customer</p>
            <p className="text-gray-600 text-sm mt-1">pays for 3-17 months of Premium</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#ff6b35]">7-17x</p>
            <p className="text-gray-600 text-sm mt-1">ROI on your $29/month investment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
