'use client';

import { useState } from 'react';

interface PricingCardProps {
  name: string;
  price: number;
  priceId: string | null;
  features: readonly string[];
  notIncluded: readonly string[];
  highlighted?: boolean;
  badge?: string;
}

export default function PricingCard({
  name,
  price,
  priceId,
  features,
  notIncluded,
  highlighted = false,
  badge,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!priceId) return;
    setLoading(true);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col ${
        highlighted
          ? 'bg-[#1e3a5f] text-white shadow-2xl scale-105 border-2 border-[#ff6b35]'
          : 'bg-white text-gray-900 shadow-lg border border-gray-200'
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#ff6b35] text-white text-sm font-bold px-4 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-[#1e3a5f]'}`}>
          {name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-extrabold">
            {price === 0 ? 'Free' : `$${price}`}
          </span>
          {price > 0 && (
            <span className={`text-sm ${highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
              /month
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-8">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 shrink-0 mt-0.5 ${highlighted ? 'text-[#ff6b35]' : 'text-green-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className={`text-sm ${highlighted ? 'text-gray-200' : 'text-gray-700'}`}>
              {feature}
            </span>
          </div>
        ))}
        {notIncluded.map((feature) => (
          <div key={feature} className="flex items-start gap-2 opacity-40">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm line-through">{feature}</span>
          </div>
        ))}
      </div>

      {priceId ? (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all ${
            highlighted
              ? 'bg-[#ff6b35] hover:bg-orange-500 text-white shadow-lg hover:shadow-xl'
              : 'bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Redirecting...' : `Get ${name}`}
        </button>
      ) : (
        <a
          href="/claim"
          className="w-full py-3 px-6 rounded-xl font-bold text-lg text-center border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all block"
        >
          Get Started Free
        </a>
      )}
    </div>
  );
}
