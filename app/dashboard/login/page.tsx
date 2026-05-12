'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const errorMessages: Record<string, string> = {
    missing_token: 'Invalid login link. Please request a new one.',
    invalid: 'This login link is invalid. Please request a new one.',
    used: 'This login link has already been used. Please request a new one.',
    expired: 'This login link has expired. Please request a new one.',
    server_error: 'Something went wrong. Please try again.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/dashboard/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Failed to send login link.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-500 mb-6">
            We sent a login link to <span className="font-semibold text-gray-700">{email}</span>. 
            Click the link in the email to access your dashboard.
          </p>
          <p className="text-sm text-gray-400">
            The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="mt-6 text-sm text-[#ff6b35] hover:text-orange-600 font-medium"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Dashboard Login</h1>
          <p className="text-gray-500">
            Enter the email you used to claim your business. We&apos;ll send you a login link.
          </p>
        </div>

        {(errorParam || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error || errorMessages[errorParam!] || 'Something went wrong.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent text-gray-900"
              placeholder="you@yourbusiness.com"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="w-full bg-[#ff6b35] hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Login Link'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Don&apos;t have an account yet?
          </p>
          <Link
            href="/claim"
            className="text-[#ff6b35] hover:text-orange-600 font-semibold text-sm"
          >
            Claim Your Business →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
