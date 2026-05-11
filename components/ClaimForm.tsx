'use client';

import { useState } from 'react';
import type { Listing } from '@/types';

interface ClaimFormProps {
  listing?: Listing;
}

export default function ClaimForm({ listing }: ClaimFormProps) {
  const [step, setStep] = useState<'search' | 'form' | 'success'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(listing ?? null);
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/listings/search?q=${encodeURIComponent(searchQuery)}`);
      const data: Listing[] = await res.json();
      setSearchResults(data);
    } catch {
      setError('Search failed. Please try again.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedListing || !email) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: selectedListing.id,
          user_email: email,
          business_name: businessName,
          message,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setStep('success');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email! 📧</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-4">
          We sent a verification link to <strong>{email}</strong>.
          Click the link in the email to verify your business.
        </p>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The link expires in 48 hours. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    );
  }

  if (!listing && step === 'search') {
    return (
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your business name..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
          <button
            type="submit"
            className="bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {searchResults.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedListing(r);
                    setStep('form');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{r.business_name}</p>
                    <p className="text-sm text-gray-500">{r.city}, {r.state_code}</p>
                  </div>
                  <span className="text-[#ff6b35] text-sm font-medium">Select &rarr;</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {searchResults.length === 0 && searchQuery && (
          <p className="text-gray-500 text-sm text-center">
            No listings found. Contact us to add your business.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {selectedListing && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium">Claiming:</p>
          <p className="font-bold text-blue-900">{selectedListing.business_name}</p>
          <p className="text-sm text-blue-700">{selectedListing.city}, {selectedListing.state_code}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Name / Business Name
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          placeholder="John's Auto Detailing"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Business Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          placeholder="owner@yourbusiness.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Message (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] resize-none"
          placeholder="Any additional information to verify ownership..."
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#ff6b35] hover:bg-orange-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-base"
      >
        {submitting ? 'Submitting...' : 'Submit Claim Request'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        We verify ownership through email confirmation. Free for all business owners.
      </p>
    </form>
  );
}
