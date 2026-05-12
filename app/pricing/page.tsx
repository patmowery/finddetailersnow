'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import PricingCard from '@/components/PricingCard';
import { PLANS } from '@/lib/plans';

function PricingContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1e3a5f] mb-4">
          Grow Your Detailing Business
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Get found by customers searching for auto detailing in your area.
          Choose the plan that fits your business.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
          <PricingCard
            name={PLANS.free.name}
            price={PLANS.free.price}
            priceId={PLANS.free.priceId}
            features={PLANS.free.features}
            notIncluded={PLANS.free.notIncluded}
            listingId={listingId}
            email={email}
          />
          <PricingCard
            name={PLANS.pro.name}
            price={PLANS.pro.price}
            priceId={PLANS.pro.priceId}
            features={PLANS.pro.features}
            notIncluded={PLANS.pro.notIncluded}
            highlighted
            badge="Most Popular"
            listingId={listingId}
            email={email}
          />
          <PricingCard
            name={PLANS.featured.name}
            price={PLANS.featured.price}
            priceId={PLANS.featured.priceId}
            features={PLANS.featured.features}
            notIncluded={PLANS.featured.notIncluded}
            listingId={listingId}
            email={email}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-[#1e3a5f] text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600">
              Yes! All paid plans are month-to-month with no contracts. Cancel anytime
              from your dashboard and your listing will revert to the free tier at the
              end of your billing period.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-2">
              How do I get listed?
            </h3>
            <p className="text-gray-600">
              Click &quot;Get Started Free&quot; to claim your business listing. Fill out your
              business details, and you&apos;ll be live in minutes. Upgrade to Pro or
              Featured anytime to boost your visibility.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-2">
              What&apos;s the difference between Pro and Featured?
            </h3>
            <p className="text-gray-600">
              Pro gives you priority placement, a verified badge, and lead notifications.
              Featured adds top-of-page placement, a featured badge, premium branding,
              and a monthly performance report — maximum visibility for your business.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-2">
              How quickly will I see results?
            </h3>
            <p className="text-gray-600">
              Most businesses see increased visibility within the first week. Pro and
              Featured listings typically receive 3-5x more views and inquiries than
              free listings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e3a5f] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get More Customers?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join hundreds of detailing businesses already growing with FindDetailersNow.
          </p>
          <Link
            href="/claim"
            className="inline-block bg-[#ff6b35] hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
          >
            List Your Business Now — It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold text-[#1e3a5f]">Loading...</h1>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
