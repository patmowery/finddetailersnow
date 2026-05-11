'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildCityUrl } from '@/lib/utils';

interface CityItem {
  id: string;
  name: string;
  state_code: string;
}

export default function CitySearch({
  cities,
  stateName,
}: {
  cities: CityItem[];
  stateName: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? cities.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : cities;

  return (
    <>
      {/* Search input */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search cities in ${stateName}...`}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {query && (
          <p className="text-sm text-gray-500 mt-2">
            {filtered.length} {filtered.length === 1 ? 'city' : 'cities'} found
          </p>
        )}
      </div>

      {/* City grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No cities matching &ldquo;{query}&rdquo;. Try a different search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((city) => (
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
                  <p className="text-sm text-gray-400 mt-0.5">{stateName}</p>
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
    </>
  );
}
