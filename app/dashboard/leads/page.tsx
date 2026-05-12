'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ClickSummary {
  thisMonth: Record<string, number>;
  lastMonth: Record<string, number>;
  totalThisMonth: number;
  totalLastMonth: number;
  daily: Record<string, number>;
}

const CLICK_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  phone: { label: 'Phone Calls', icon: '📞', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  email: { label: 'Email Clicks', icon: '✉️', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  website: { label: 'Website Visits', icon: '🌐', color: 'bg-green-50 text-green-700 border-green-100' },
  directions: { label: 'Directions', icon: '📍', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  booking: { label: 'Booking Clicks', icon: '📅', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
};

function LeadsContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';

  const [data, setData] = useState<ClickSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!listingId || !email) { setLoading(false); return; }
    fetch(`/api/listings/clicks?listing=${listingId}&email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Failed to load lead data.'))
      .finally(() => setLoading(false));
  }, [listingId, email]);

  // Build last-30-days chart data
  const chartDays = (() => {
    const days: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: data?.daily[key] ?? 0 });
    }
    return days;
  })();

  const maxCount = Math.max(...chartDays.map(d => d.count), 1);

  const trend = data && data.totalLastMonth > 0
    ? Math.round(((data.totalThisMonth - data.totalLastMonth) / data.totalLastMonth) * 100)
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Leads</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track customer actions — phone calls, emails, website visits, and more.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-24" />
          <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-40" />
        </div>
      ) : !data ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-sm">No lead data available yet.</p>
        </div>
      ) : (
        <>
          {/* Total this month */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-extrabold text-gray-900">{data.totalThisMonth}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total leads this month</p>
              </div>
              {trend !== null && (
                <div className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
                </div>
              )}
            </div>
          </div>

          {/* Bar chart — last 30 days */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Leads — Last 30 Days</h3>
            <div className="flex items-end gap-0.5 h-24">
              {chartDays.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 bg-[#ff6b35] rounded-sm opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
                  style={{ height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 4 : 1)}%` }}
                  title={`${day.date}: ${day.count} leads`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Breakdown by type */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Breakdown by Type</h3>
            <div className="space-y-3">
              {Object.entries(CLICK_LABELS).map(([type, meta]) => {
                const count = data.thisMonth[type] ?? 0;
                const prev = data.lastMonth[type] ?? 0;
                const pct = count > 0 ? Math.round((count / Math.max(data.totalThisMonth, 1)) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 w-36 flex-shrink-0 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${meta.color}`}>
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 bg-[#ff6b35] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                    {prev > 0 && count !== prev && (
                      <span className={`text-xs ${count > prev ? 'text-green-500' : 'text-red-400'}`}>
                        {count > prev ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {data.totalThisMonth === 0 && (
            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-[#1e3a5f]">
              <strong>No leads yet this month.</strong> Leads are tracked when visitors click your phone number, email, website link, or directions on your listing page.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
