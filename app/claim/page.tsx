import type { Metadata } from 'next';
import ClaimForm from '@/components/ClaimForm';

export const metadata: Metadata = {
  title: 'Claim Your Business Listing',
  description:
    'Are you an auto detailing business owner? Claim your free listing on FindDetailersNow and get found by customers in your area.',
  alternates: { canonical: '/claim' },
};

const BENEFITS = [
  {
    icon: '🆓',
    title: 'Free to Claim',
    desc: 'Basic listings are always free. No credit card required.',
  },
  {
    icon: '📈',
    title: 'More Customers',
    desc: 'Get found by car enthusiasts actively searching for detailers.',
  },
  {
    icon: '⭐',
    title: 'Build Reviews',
    desc: 'Collect reviews from happy customers to boost credibility.',
  },
  {
    icon: '🎯',
    title: 'Premium Placement',
    desc: 'Upgrade for featured placement at the top of search results.',
  },
];

export default function ClaimPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: benefits */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Claim Your <span className="text-[#ff6b35]">Free</span> Business Listing
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Join thousands of auto detailing businesses on FindDetailersNow. Get found by customers
            who are ready to book — for free.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="text-3xl mb-2">{b.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#1e3a5f]/5 rounded-2xl p-6 border border-[#1e3a5f]/10">
            <h3 className="font-bold text-gray-900 mb-2">What happens after you claim?</h3>
            <ol className="space-y-2 text-sm text-gray-600 list-none">
              {[
                'We verify your ownership via email',
                'You get access to your listing dashboard',
                'Update photos, description, and services',
                'Respond to customer reviews',
                'Optionally upgrade to Premium for more visibility',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#ff6b35] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Find &amp; Claim Your Listing</h2>
          <ClaimForm />
        </div>
      </div>
    </div>
  );
}
