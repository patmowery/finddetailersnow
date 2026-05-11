'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { SERVICE_LABELS, type ServiceType } from '@/types';

const SERVICES: ServiceType[] = [
  'detailing',
  'ceramic_coating',
  'ppf',
  'paint_correction',
  'interior',
  'mobile',
];

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];
const RATINGS = [4, 3, 2];

export default function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeServices = searchParams.getAll('service');
  const activePrices = searchParams.getAll('price');
  const activeRating = searchParams.get('rating');

  const setParam = useCallback(
    (key: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (checked) {
        params.append(key, value);
      } else {
        const existing = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        existing.forEach((v) => params.append(key, v));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function setRating(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('rating') === value) {
      params.delete('rating');
    } else {
      params.set('rating', value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const hasFilters = activeServices.length > 0 || activePrices.length > 0 || activeRating;

  return (
    <aside className="w-full">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-[#ff6b35] hover:underline">
              Clear all
            </button>
          )}
        </div>

        {/* Services */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Service Type
          </h3>
          <div className="space-y-2">
            {SERVICES.map((svc) => {
              const checked = activeServices.includes(svc);
              return (
                <label key={svc} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setParam('service', svc, e.target.checked)}
                    className="w-4 h-4 text-[#1e3a5f] rounded border-gray-300 focus:ring-[#1e3a5f]"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {SERVICE_LABELS[svc]}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Price range */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Price Range
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {PRICE_RANGES.map((p) => {
              const active = activePrices.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => setParam('price', p, !active)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </section>

        {/* Min rating */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Minimum Rating
          </h3>
          <div className="space-y-2">
            {RATINGS.map((r) => {
              const selected = activeRating === String(r);
              return (
                <button
                  key={r}
                  onClick={() => setRating(String(r))}
                  className={`flex items-center gap-1.5 text-sm w-full text-left px-2 py-1 rounded-lg transition-colors ${
                    selected ? 'bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-yellow-400">{'★'.repeat(r)}</span>
                  <span className="text-gray-400">{'★'.repeat(5 - r)}</span>
                  <span className="ml-1">&amp; up</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
