import Link from 'next/link';
import type { Metadata } from 'next';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import { getFeaturedListings } from '@/lib/data';
import { US_STATES } from '@/types';

export const metadata: Metadata = {
  title: 'FindDetailersNow – Find Auto Detailers, Ceramic Coating & PPF Near You',
  description:
    'Search thousands of auto detailers, ceramic coating specialists, PPF installers, and mobile detailers across the US. Find and compare the best in your city.',
};

const FEATURED_CITIES = [
  { city: 'Los Angeles', state: 'CA', slug: 'california/los-angeles' },
  { city: 'Miami', state: 'FL', slug: 'florida/miami' },
  { city: 'Houston', state: 'TX', slug: 'texas/houston' },
  { city: 'Chicago', state: 'IL', slug: 'illinois/chicago' },
  { city: 'Phoenix', state: 'AZ', slug: 'arizona/phoenix' },
  { city: 'Atlanta', state: 'GA', slug: 'georgia/atlanta' },
  { city: 'Dallas', state: 'TX', slug: 'texas/dallas' },
  { city: 'Las Vegas', state: 'NV', slug: 'nevada/las-vegas' },
  { city: 'Denver', state: 'CO', slug: 'colorado/denver' },
  { city: 'Seattle', state: 'WA', slug: 'washington/seattle' },
  { city: 'Nashville', state: 'TN', slug: 'tennessee/nashville' },
  { city: 'Orlando', state: 'FL', slug: 'florida/orlando' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Search Your City',
    desc: 'Enter your city or zip code to instantly browse local auto detailing professionals.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: '2',
    title: 'Compare Detailers',
    desc: 'Read real reviews, see services offered, compare pricing, and check photos.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    step: '3',
    title: 'Book or Call',
    desc: "Contact the detailer directly — no middleman, no booking fees. It's that simple.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

const SERVICES_OVERVIEW = [
  { label: 'Auto Detailing', icon: '🚗', desc: 'Full interior & exterior detail' },
  { label: 'Ceramic Coating', icon: '✨', desc: 'Long-lasting paint protection' },
  { label: 'Paint Protection Film', icon: '🛡️', desc: 'PPF & clear bra installation' },
  { label: 'Paint Correction', icon: '🎨', desc: 'Swirl & scratch removal' },
  { label: 'Interior Detailing', icon: '🪑', desc: 'Deep cleaning & restoration' },
  { label: 'Mobile Detailing', icon: '📍', desc: 'We come to you' },
];

export default async function HomePage() {
  const featured = await getFeaturedListings(6).catch(() => []);

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0d2140] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Find Auto Detailers{' '}
            <span className="text-[#ff6b35]">Near You</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Discover top-rated detailers, ceramic coating shops, and PPF installers in your city.
            Read real reviews and connect directly.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Enter your city (e.g. Miami, FL)" />
          </div>
          <p className="mt-4 text-sm text-blue-300">
            Serving <span className="font-semibold text-white">all 50 states</span> — 200+ cities covered
          </p>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICES_OVERVIEW.map((svc) => (
              <div key={svc.label} className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">{svc.icon}</div>
                <p className="font-semibold text-gray-900 text-sm">{svc.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CITIES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Browse by City</h2>
            <p className="mt-2 text-gray-500">Find detailers in the most popular metros</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {FEATURED_CITIES.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="bg-white hover:bg-[#1e3a5f] hover:text-white group rounded-xl p-4 text-center shadow-sm border border-gray-100 transition-all hover:shadow-md"
              >
                <p className="font-semibold text-gray-900 group-hover:text-white text-sm">{item.city}</p>
                <p className="text-xs text-gray-400 group-hover:text-blue-200">{item.state}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/states"
              className="inline-flex items-center gap-2 text-[#1e3a5f] font-semibold hover:text-[#ff6b35] transition-colors"
            >
              View all 50 states
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Featured Detailers</h2>
              <p className="mt-2 text-gray-500">Top-rated professionals across the country</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-2 text-gray-500">Find the perfect detailer in 3 easy steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-[#1e3a5f] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ff6b35] text-white text-sm font-bold mb-3">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS CTA */}
      <section className="bg-[#1e3a5f] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Own an Auto Detailing Business?
          </h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Claim your free listing today and get found by thousands of car enthusiasts searching
            for detailing services in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/claim"
              className="bg-[#ff6b35] hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Claim Your Free Listing
            </Link>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1e3a5f] font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* STATES GRID */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Browse All States</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {US_STATES.map((state) => (
              <Link
                key={state.code}
                href={`/${state.slug}`}
                className="text-center p-2 rounded-lg hover:bg-[#1e3a5f] hover:text-white group transition-all"
              >
                <p className="font-bold text-sm text-gray-700 group-hover:text-white">{state.code}</p>
                <p className="text-xs text-gray-400 group-hover:text-blue-200 hidden sm:block truncate">{state.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
