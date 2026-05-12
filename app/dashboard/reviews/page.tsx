'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Review {
  id: string;
  listing_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  owner_response?: { response_text: string; responded_at: string } | null;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewsContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!listingId) { setLoading(false); return; }
    loadReviews();
  }, [listingId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/reviews?listing=${listingId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) {
      setError('Response cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/listings/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          email,
          review_id: reviewId,
          response_text: responseText,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRespondingTo(null);
        setResponseText('');
        setSuccess('Response posted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        await loadReviews();
      }
    } catch {
      setError('Failed to save response.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResponse = async (reviewId: string) => {
    if (!confirm('Delete your response to this review?')) return;
    try {
      await fetch('/api/listings/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, email, review_id: reviewId }),
      });
      await loadReviews();
    } catch {
      setError('Failed to delete response.');
    }
  };

  if (!listingId) {
    return <div className="text-center py-20 text-gray-400">No listing found.</div>;
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const responded = reviews.filter(r => r.owner_response).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">
          Read and respond to customer reviews to build trust.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">{success}</div>
      )}

      {/* Summary bar */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5 grid grid-cols-3 divide-x divide-gray-100">
          <div className="text-center pr-4">
            <p className="text-2xl font-extrabold text-gray-900">{avgRating}</p>
            <p className="text-xs text-gray-400 mt-0.5">Avg rating</p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-extrabold text-gray-900">{reviews.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total reviews</p>
          </div>
          <div className="text-center pl-4">
            <p className="text-2xl font-extrabold text-gray-900">{responded}</p>
            <p className="text-xs text-gray-400 mt-0.5">Responded to</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-400">
            Reviews from customers will appear here once your listing is live.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              {/* Review header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.author_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
                    <StarRow rating={review.rating} />
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3 pl-12">{review.comment}</p>
              )}

              {/* Owner response (if exists) */}
              {review.owner_response ? (
                <div className="ml-12 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#1e3a5f]">Your Response</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRespondingTo(review.id);
                          setResponseText(review.owner_response!.response_text);
                        }}
                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResponse(review.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.owner_response.response_text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.owner_response.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ) : respondingTo === review.id ? (
                <div className="ml-12 mt-2">
                  <textarea
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    placeholder="Thank the customer and address any concerns professionally..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleRespond(review.id)}
                      disabled={saving}
                      className="bg-[#ff6b35] hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Posting...' : 'Post Response'}
                    </button>
                    <button
                      onClick={() => { setRespondingTo(null); setResponseText(''); setError(''); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ml-12 mt-1">
                  <button
                    onClick={() => { setRespondingTo(review.id); setResponseText(''); }}
                    className="text-sm text-[#1e3a5f] hover:text-[#ff6b35] font-medium transition-colors"
                  >
                    + Respond to this review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <ReviewsContent />
    </Suspense>
  );
}
