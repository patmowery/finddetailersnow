'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AnalyticsData {
  viewsThisMonth: number;
  viewsLastMonth: number;
  clicksThisMonth: number;
  clicksLastMonth: number;
  completeness: number;
  cityRank: number | null;
  cityTotal: number | null;
  tier: string;
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span className={`text-xs font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? '↑' : '↓'} {Math.abs(pct)}% vs last month
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  );
}

function CompletenessBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="mt-1">
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DashboardHomeContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';
  const authQuery = listingId && email ? `?listing=${listingId}&email=${encodeURIComponent(email)}` : '';

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId || !email) { setLoading(false); return; }
    fetch(`/api/listings/analytics?listing=${listingId}&email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setAnalytics(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId, email]);

  const tierLabel = analytics?.tier === 'featured'
    ? 'Featured'
    : analytics?.tier === 'pro'
    ? 'Pro'
    : 'Free';

  const tierBadgeClass = analytics?.tier === 'featured'
    ? 'bg-yellow-100 text-yellow-800'
    : analytics?.tier === 'pro'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-600';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your business performance at a glance</p>
        </div>
        {analytics && (
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${tierBadgeClass}`}>
            {tierLabel} Plan
          </span>
        )}
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-28" />
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Profile Views"
            value={analytics.viewsThisMonth.toLocaleString()}
            sub={<TrendBadge current={analytics.viewsThisMonth} previous={analytics.viewsLastMonth} />}
            color="bg-blue-50"
            icon={
              <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <StatCard
            label="Leads This Month"
            value={analytics.clicksThisMonth.toLocaleString()}
            sub={<TrendBadge current={analytics.clicksThisMonth} previous={analytics.clicksLastMonth} />}
            color="bg-orange-50"
            icon={
              <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            label="City Rank"
            value={analytics.cityRank ? `#${analytics.cityRank}` : '–'}
            sub={analytics.cityTotal ? (
              <span className="text-xs text-gray-400">of {analytics.cityTotal} listings</span>
            ) : undefined}
            color="bg-green-50"
            icon={
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            label="Profile Complete"
            value={`${analytics.completeness}%`}
            sub={<CompletenessBar pct={analytics.completeness} />}
            color="bg-purple-50"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8 text-sm text-yellow-800">
          Stats will appear here once your listing has been claimed and verified.
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {[
          { href: `/dashboard/profile${authQuery}`, label: 'Edit Profile', desc: 'Update your contact info, description, and hours', icon: '✏️' },
          { href: `/dashboard/photos${authQuery}`, label: 'Manage Photos', desc: 'Add a cover photo, logo, and gallery', icon: '📸' },
          { href: `/dashboard/services${authQuery}`, label: 'Service Menu', desc: 'List your services with pricing', icon: '💰' },
          { href: `/dashboard/reviews${authQuery}`, label: 'Respond to Reviews', desc: 'Reply to customer feedback', icon: '⭐' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#ff6b35] transition-all group"
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-[#1e3a5f]">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Upgrade CTA for free tier */}
      {analytics?.tier === 'free' && (
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4d7a] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">Unlock Pro Features</h3>
            <p className="text-blue-200 text-sm">
              Priority placement, verified badge, photo gallery, and detailed analytics.
            </p>
          </div>
          <Link
            href={`/pricing${authQuery}`}
            className="bg-[#ff6b35] hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            Upgrade — $29/mo
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DashboardHomePage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <DashboardHomeContent />
    </Suspense>
  );
}
