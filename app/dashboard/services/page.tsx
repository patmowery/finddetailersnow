'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Service {
  id: string;
  listing_id: string;
  service_name: string;
  description: string | null;
  price_from: number | null;
  price_to: number | null;
  duration_minutes: number | null;
  sort_order: number;
  created_at: string;
}

type ServiceDraft = Omit<Service, 'id' | 'listing_id' | 'created_at'> & { id?: string };

const EMPTY_DRAFT: ServiceDraft = {
  service_name: '',
  description: '',
  price_from: null,
  price_to: null,
  duration_minutes: null,
  sort_order: 0,
};

function formatPrice(from: number | null, to: number | null) {
  if (from == null && to == null) return 'Price varies';
  if (from != null && to != null) return `$${from} – $${to}`;
  if (from != null) return `From $${from}`;
  return `Up to $${to}`;
}

function formatDuration(mins: number | null) {
  if (!mins) return null;
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}hr`;
}

function ServicesContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!listingId) { setLoading(false); return; }
    loadServices();
  }, [listingId]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/services?listing=${listingId}`);
      const data = await res.json();
      setServices(data.services ?? []);
    } catch {
      setError('Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing || !editing.service_name.trim()) {
      setError('Service name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/listings/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          email,
          service: { ...editing, sort_order: editing.sort_order ?? services.length },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setEditing(null);
        setSuccess(editing.id ? 'Service updated.' : 'Service added.');
        setTimeout(() => setSuccess(''), 3000);
        await loadServices();
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Delete this service?')) return;
    setDeleting(serviceId);
    try {
      const res = await fetch('/api/listings/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, listing_id: listingId, email }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch {
      setError('Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  if (!listingId) {
    return <div className="text-center py-20 text-gray-400">No listing found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Service Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            List your services with pricing to help customers make decisions.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing({ ...EMPTY_DRAFT, sort_order: services.length })}
            className="flex items-center gap-1.5 bg-[#ff6b35] hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Service
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">{success}</div>
      )}

      {/* Edit / Add form */}
      {editing && (
        <div className="bg-white rounded-2xl p-5 border-2 border-[#ff6b35] shadow-sm mb-5">
          <h3 className="font-semibold text-gray-900 mb-4">{editing.id ? 'Edit Service' : 'New Service'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
              <input
                type="text"
                value={editing.service_name}
                onChange={e => setEditing(prev => prev ? { ...prev, service_name: e.target.value } : prev)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent text-sm"
                placeholder="e.g. Full Detail Package"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editing.description ?? ''}
                onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : prev)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent text-sm"
                placeholder="What's included in this service?"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price From ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editing.price_from ?? ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, price_from: e.target.value ? Number(e.target.value) : null } : prev)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent text-sm"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price To ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editing.price_to ?? ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, price_to: e.target.value ? Number(e.target.value) : null } : prev)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent text-sm"
                  placeholder="150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  min="0"
                  step="15"
                  value={editing.duration_minutes ?? ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, duration_minutes: e.target.value ? Number(e.target.value) : null } : prev)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent text-sm"
                  placeholder="120"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#ff6b35] hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving...' : editing.id ? 'Save Changes' : 'Add Service'}
            </button>
            <button
              onClick={() => { setEditing(null); setError(''); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Services list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-20" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No services yet</h3>
          <p className="text-sm text-gray-400 mb-4">Add your services with pricing to attract customers.</p>
          <button
            onClick={() => setEditing({ ...EMPTY_DRAFT })}
            className="bg-[#ff6b35] hover:bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Add First Service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900">{svc.service_name}</h4>
                  <span className="text-sm font-bold text-[#ff6b35]">
                    {formatPrice(svc.price_from, svc.price_to)}
                  </span>
                  {svc.duration_minutes && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {formatDuration(svc.duration_minutes)}
                    </span>
                  )}
                </div>
                {svc.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{svc.description}</p>
                )}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setEditing({
                    id: svc.id,
                    service_name: svc.service_name,
                    description: svc.description,
                    price_from: svc.price_from,
                    price_to: svc.price_to,
                    duration_minutes: svc.duration_minutes,
                    sort_order: svc.sort_order,
                  })}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(svc.id)}
                  disabled={deleting === svc.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
