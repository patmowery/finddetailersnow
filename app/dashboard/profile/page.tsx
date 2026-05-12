'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ProfileData {
  business_name: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state_code: string;
  description: string;
  services: string[];
  hours: string;
  booking_url: string;
}

const SERVICE_OPTIONS = [
  { value: 'detailing', label: 'Auto Detailing' },
  { value: 'ceramic_coating', label: 'Ceramic Coating' },
  { value: 'paint_correction', label: 'Paint Correction' },
  { value: 'ppf', label: 'Paint Protection Film (PPF)' },
  { value: 'interior', label: 'Interior Detailing' },
  { value: 'tinting', label: 'Window Tinting' },
  { value: 'wash', label: 'Car Wash' },
  { value: 'mobile', label: 'Mobile Detailing' },
  { value: 'commercial', label: 'Commercial/Fleet' },
  { value: 'rv_boat', label: 'RV & Boat Detailing' },
];

function ProfileContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [tier, setTier] = useState('free');

  const [profile, setProfile] = useState<ProfileData>({
    business_name: '',
    phone: '',
    email: email ? decodeURIComponent(email) : '',
    website: '',
    address: '',
    city: '',
    state_code: '',
    description: '',
    services: [],
    hours: '',
    booking_url: '',
  });

  // Load existing listing data
  useEffect(() => {
    if (!listingId) return;
    fetch(`/api/listings/profile?listing=${listingId}&email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }));
        }
        if (data.tier) setTier(data.tier);
      })
      .catch(() => {}); // Silently fail — user can fill in from scratch
  }, [listingId, email]);

  const handleServiceToggle = (service: string) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/listings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          email: profile.email,
          profile,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save. Please try again.');
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!listingId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t find your listing. Please use the link from your verification email,
          or claim your business first.
        </p>
        <Link
          href="/claim"
          className="inline-block bg-[#ff6b35] hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl"
        >
          Claim Your Business
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-extrabold text-[#1e3a5f]">Edit Your Profile</h1>
          {tier !== 'free' && (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              tier === 'featured' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {tier === 'featured' ? '⭐ Featured' : '✓ Pro'}
            </span>
          )}
        </div>
        <p className="text-gray-600">
          Update your business details below. Changes will be reflected on your listing.
        </p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6">
          ✅ Profile saved successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
          ❌ {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name *</label>
          <input
            type="text"
            value={profile.business_name}
            onChange={e => setProfile(prev => ({ ...prev, business_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            placeholder="Your Business Name"
          />
        </div>

        {/* Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              placeholder="you@yourbusiness.com"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={profile.website}
            onChange={e => setProfile(prev => ({ ...prev, website: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            placeholder="https://www.yourbusiness.com"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            placeholder="123 Main St, City, ST 12345"
          />
        </div>

        {/* City / State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={profile.city}
              onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={profile.state_code}
              onChange={e => setProfile(prev => ({ ...prev, state_code: e.target.value.toUpperCase().slice(0, 2) }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              placeholder="MD"
              maxLength={2}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Business Description</label>
          <textarea
            value={profile.description}
            onChange={e => setProfile(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            placeholder="Tell customers what makes your business special..."
          />
        </div>

        {/* Booking URL (Pro+) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Booking / Scheduling URL
            {tier === 'free' && <span className="text-gray-400 font-normal ml-2">(Pro feature)</span>}
          </label>
          <input
            type="url"
            value={profile.booking_url}
            onChange={e => setProfile(prev => ({ ...prev, booking_url: e.target.value }))}
            disabled={tier === 'free'}
            className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${tier === 'free' ? 'bg-gray-100 opacity-60' : ''}`}
            placeholder="https://calendly.com/yourbusiness"
          />
        </div>

        {/* Business Hours */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Business Hours</label>
          <textarea
            value={profile.hours}
            onChange={e => setProfile(prev => ({ ...prev, hours: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            placeholder="Mon-Fri: 8am-6pm&#10;Sat: 9am-4pm&#10;Sun: Closed"
          />
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Services Offered</label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleServiceToggle(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  profile.services.includes(opt.value)
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#ff6b35] hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Upgrade CTA for free tier */}
      {tier === 'free' && (
        <div className="mt-8 bg-gradient-to-r from-[#1e3a5f] to-[#2a4d7a] text-white rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Want more customers?</h3>
          <p className="text-blue-200 mb-4">Upgrade to Pro for priority placement, verified badge, and more.</p>
          <Link
            href={`/pricing?listing=${listingId}&email=${encodeURIComponent(profile.email)}`}
            className="inline-block bg-[#ff6b35] hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl"
          >
            Upgrade Now — $29/mo
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-[#1e3a5f]">Loading profile...</h1>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
