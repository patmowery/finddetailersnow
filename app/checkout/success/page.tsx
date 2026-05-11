import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Successful',
  description: 'Your subscription is active. Welcome to FindDetailersNow!',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-3">
            You&apos;re All Set! 🎉
          </h1>
          <p className="text-gray-600 mb-8">
            Your subscription is now active. Your listing has been upgraded and
            you&apos;ll start seeing increased visibility right away.
          </p>

          <div className="space-y-3">
            <Link
              href="/claim"
              className="block w-full bg-[#ff6b35] hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Complete Your Profile
            </Link>
            <Link
              href="/"
              className="block w-full border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
