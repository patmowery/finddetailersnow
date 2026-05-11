import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Claim Submitted | FindDetailersNow',
  robots: { index: false, follow: false },
};

export default function ClaimSuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Claim Submitted!</h1>
      <p className="text-lg text-gray-600 mb-8">
        We&apos;ll verify your ownership and activate your listing within 1-2 business days.
        You&apos;ll receive a confirmation email once approved.
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-bold text-blue-900 mb-2">What happens next?</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            We verify your business ownership (usually within 24 hours)
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            You get access to your dashboard to update your listing
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            Your listing shows a &quot;Claimed&quot; badge for credibility
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            Optionally upgrade to Premium or Featured for more visibility
          </li>
        </ol>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/pricing"
          className="px-6 py-3 bg-[#ff6b35] hover:bg-orange-500 text-white font-semibold rounded-xl transition-colors"
        >
          View Pricing Plans
        </Link>
      </div>
    </div>
  );
}
