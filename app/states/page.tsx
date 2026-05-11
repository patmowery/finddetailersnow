import Link from 'next/link';
import type { Metadata } from 'next';
import { US_STATES } from '@/types';

export const metadata: Metadata = {
  title: 'Auto Detailers by State | FindDetailersNow',
  description:
    'Browse auto detailers, ceramic coating shops, and PPF installers across all 50 US states. Find the best detailers in your state.',
  alternates: { canonical: '/states' },
};

export default function StatesPage() {
  // Group into rows of 5 for visual clarity
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#1e3a5f]">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">All States</span>
      </nav>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Browse by State</h1>
        <p className="mt-3 text-lg text-gray-500">
          Find professional auto detailers, ceramic coating specialists, and PPF installers in any state.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {US_STATES.map((state) => (
          <Link
            key={state.code}
            href={`/${state.slug}`}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1e3a5f] hover:bg-[#1e3a5f] group transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-[#1e3a5f] group-hover:text-[#ff6b35] transition-colors">
                  {state.code}
                </p>
                <p className="text-sm text-gray-600 group-hover:text-blue-200 transition-colors">
                  {state.name}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-300 group-hover:text-[#ff6b35] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-br from-[#1e3a5f] to-[#0d2140] rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Own a Detailing Business?</h2>
        <p className="text-blue-200 mb-6 max-w-lg mx-auto">
          Get your shop in front of thousands of car enthusiasts searching for detailers in your area.
          Free listings available.
        </p>
        <Link
          href="/claim"
          className="inline-block bg-[#ff6b35] hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Claim Your Free Listing
        </Link>
      </div>
    </div>
  );
}
