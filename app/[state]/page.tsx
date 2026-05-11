import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCitiesByState } from '@/lib/data';
import { getStateBySlug, buildCityUrl } from '@/lib/utils';
import { US_STATES } from '@/types';

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const stateInfo = getStateBySlug(stateSlug);
  if (!stateInfo) return {};

  return {
    title: `Auto Detailers in ${stateInfo.name} | FindDetailersNow`,
    description: `Find the best auto detailers, ceramic coating specialists, and PPF installers across ${stateInfo.name}. Browse by city.`,
    alternates: {
      canonical: `/${stateSlug}`,
    },
  };
}

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

export default async function StatePage({ params }: Props) {
  const { state: stateSlug } = await params;
  const stateInfo = getStateBySlug(stateSlug);
  if (!stateInfo) notFound();

  const cities = await getCitiesByState(stateInfo.code);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#1e3a5f]">Home</Link>
        <span>/</span>
        <Link href="/states" className="hover:text-[#1e3a5f]">States</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{stateInfo.name}</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Auto Detailers in {stateInfo.name}
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Browse auto detailing, ceramic coating, and PPF installers by city in {stateInfo.name}.
        </p>
      </div>

      {cities.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No cities listed yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={buildCityUrl(city.name, city.state_code)}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1e3a5f] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-[#1e3a5f] transition-colors">
                    {city.name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">{stateInfo.name}</p>
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
      )}

      {/* CTA */}
      <div className="mt-16 bg-[#1e3a5f] rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Don&apos;t see your city?</h2>
        <p className="text-blue-200 mb-6">
          We&apos;re adding new cities every week. Claim your business listing today.
        </p>
        <Link
          href="/claim"
          className="inline-block bg-[#ff6b35] hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          List Your Business
        </Link>
      </div>
    </div>
  );
}
