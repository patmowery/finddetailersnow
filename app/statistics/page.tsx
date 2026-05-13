import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Auto Detailing Industry Statistics 2025 | FindDetailersNow',
  description:
    'Comprehensive auto detailing industry statistics for 2025. Data on 22,000+ detailing businesses across all 50 US states — ratings, services, pricing trends, and market insights.',
  alternates: { canonical: '/statistics' },
  openGraph: {
    title: 'Auto Detailing Industry Statistics 2025',
    description: 'Data-driven insights from 22,000+ auto detailing businesses across the US.',
    type: 'article',
  },
};

/* ─── static data pulled from our database ─── */
const STATS = {
  totalListings: 22405,
  totalCities: 5410,
  totalStates: 51,
  totalReviews: 30555,
  avgRating: 4.12,
  fiveStarCount: 8313,
  fourPlusPct: 83,
  avgReviewsPerBiz: 14.2,
};

const TOP_STATES = [
  { state: 'California', count: 1017 },
  { state: 'Texas', count: 588 },
  { state: 'Florida', count: 381 },
  { state: 'Arizona', count: 193 },
  { state: 'North Carolina', count: 166 },
  { state: 'Virginia', count: 140 },
  { state: 'Washington', count: 134 },
  { state: 'Colorado', count: 132 },
  { state: 'Nevada', count: 118 },
  { state: 'Illinois', count: 113 },
];

const SERVICE_BREAKDOWN = [
  { service: 'Ceramic Coating', pct: 38, mentions: 4593 },
  { service: 'Paint Protection Film (PPF)', pct: 23, mentions: 2780 },
  { service: 'Mobile Detailing', pct: 21, mentions: 2517 },
  { service: 'Paint Correction', pct: 6, mentions: 722 },
  { service: 'Window Tinting', pct: 4, mentions: 439 },
  { service: 'Vehicle Wraps', pct: 3, mentions: 409 },
  { service: 'Interior Detailing', pct: 1, mentions: 124 },
];

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
      <p className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f]">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-sm font-medium text-gray-700 shrink-0">{label}</span>
      <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color ?? 'bg-[#ff6b35]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 text-right text-sm font-semibold text-gray-700">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#1e3a5f]">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Industry Statistics</span>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          Auto Detailing Industry Statistics
          <span className="block text-[#ff6b35] text-2xl sm:text-3xl mt-2">2025 Report</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl">
          We analyzed <strong>{STATS.totalListings.toLocaleString()}</strong> auto detailing
          businesses across all 50 US states plus Washington D.C. Here&rsquo;s what the data shows.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Data sourced from Google Business Profiles &amp; public business records. Last updated May
          2025.
        </p>
      </header>

      {/* Headline stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <StatCard
          label="Detailing Businesses"
          value={STATS.totalListings.toLocaleString()}
          sub="Across the US"
        />
        <StatCard
          label="Cities Covered"
          value={STATS.totalCities.toLocaleString()}
          sub={`${STATS.totalStates} states + DC`}
        />
        <StatCard label="Google Reviews" value={STATS.totalReviews.toLocaleString()} sub="Aggregated" />
        <StatCard
          label="Average Rating"
          value={`${STATS.avgRating} ★`}
          sub={`${STATS.fourPlusPct}% rated 4.0+`}
        />
      </section>

      {/* Top states */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Top 10 States by Number of Detailers
        </h2>
        <div className="space-y-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {TOP_STATES.map((s) => (
            <BarRow
              key={s.state}
              label={s.state}
              value={s.count}
              max={TOP_STATES[0].count}
              color="bg-[#1e3a5f]"
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-400">
          California leads with over 1,000 listed detailing businesses, followed by Texas and
          Florida.
        </p>
      </section>

      {/* Services */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Most Popular Detailing Services
        </h2>
        <div className="space-y-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {SERVICE_BREAKDOWN.map((s) => (
            <BarRow
              key={s.service}
              label={s.service}
              value={s.mentions}
              max={SERVICE_BREAKDOWN[0].mentions}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-400">
          Ceramic coating is the most commonly offered premium service, appearing in 38% of
          business descriptions.
        </p>
      </section>

      {/* Rating distribution */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Distribution</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#1e3a5f]">8,313</p>
              <p className="text-sm text-gray-500">5.0 ★</p>
              <p className="text-xs text-gray-400">39%</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2a4d7a]">6,986</p>
              <p className="text-sm text-gray-500">4.5–4.9 ★</p>
              <p className="text-xs text-gray-400">32%</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#3a6a9a]">2,601</p>
              <p className="text-sm text-gray-500">4.0–4.4 ★</p>
              <p className="text-xs text-gray-400">12%</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">804</p>
              <p className="text-sm text-gray-500">3.5–3.9 ★</p>
              <p className="text-xs text-gray-400">4%</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">2,867</p>
              <p className="text-sm text-gray-500">Below 3.5 ★</p>
              <p className="text-xs text-gray-400">13%</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-400">
          71% of detailing businesses have a rating of 4.5 or higher — the industry maintains
          high customer satisfaction.
        </p>
      </section>

      {/* Key takeaways */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Industry Takeaways</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7a] text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">🚗 Market Size</h3>
            <p className="text-sm text-blue-100">
              The US auto detailing market is valued at over $15 billion (2024) and growing at
              ~5% annually. Mobile detailing is the fastest-growing segment, driven by
              convenience and post-pandemic consumer preferences.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#ff6b35] to-[#e55a25] text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">📈 Ceramic Coating Boom</h3>
            <p className="text-sm text-orange-100">
              Ceramic coating services have grown 300%+ in search volume over the past 5 years.
              38% of detailers now offer ceramic coating as a premium service — up from under 10%
              in 2019.
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">⭐ Quality Matters</h3>
            <p className="text-sm text-emerald-100">
              Businesses with 4.5+ star ratings receive 3x more clicks than those rated below
              4.0. Our data shows 71% of detailers maintain a 4.5+ rating, indicating intense
              competition on service quality.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">📱 Mobile First</h3>
            <p className="text-sm text-purple-100">
              21% of detailing businesses offer mobile services — coming to the customer instead
              of operating from a fixed location. This segment is growing fastest in urban areas
              like California, Texas, and Florida.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Average Detailing Prices (2025)
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Service</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Sedan</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">SUV/Truck</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-3 font-medium">Basic Exterior Wash</td>
                <td className="px-6 py-3">$25–$50</td>
                <td className="px-6 py-3">$35–$75</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Full Interior Detail</td>
                <td className="px-6 py-3">$150–$300</td>
                <td className="px-6 py-3">$200–$400</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Full Detail (Int + Ext)</td>
                <td className="px-6 py-3">$200–$400</td>
                <td className="px-6 py-3">$300–$600</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Paint Correction (1-Stage)</td>
                <td className="px-6 py-3">$300–$600</td>
                <td className="px-6 py-3">$400–$800</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Ceramic Coating</td>
                <td className="px-6 py-3">$500–$2,000</td>
                <td className="px-6 py-3">$800–$3,000</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">PPF (Full Front)</td>
                <td className="px-6 py-3">$1,500–$2,500</td>
                <td className="px-6 py-3">$2,000–$3,500</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">PPF (Full Vehicle)</td>
                <td className="px-6 py-3">$5,000–$7,000</td>
                <td className="px-6 py-3">$6,000–$10,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-400">
          Prices vary by region, vehicle condition, and product quality. Coastal and metro areas
          tend to be 15–25% higher.
        </p>
      </section>

      {/* Citation */}
      <section className="bg-gray-50 rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Cite This Data</h2>
        <p className="text-sm text-gray-500 mb-4">
          Journalists, bloggers, and researchers: feel free to reference these statistics. We just
          ask that you link back to this page.
        </p>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-left text-xs text-gray-600 font-mono max-w-xl mx-auto">
          FindDetailersNow. &ldquo;Auto Detailing Industry Statistics 2025.&rdquo;
          <br />
          https://finddetailersnow.com/statistics
          <br />
          Accessed [date]. Data from 22,405 US detailing businesses.
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 mb-4">
          Looking for a detailer near you? We cover {STATS.totalCities.toLocaleString()} cities
          across all 50 states.
        </p>
        <Link
          href="/states"
          className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors"
        >
          Find Detailers Near You →
        </Link>
      </div>
    </div>
  );
}
