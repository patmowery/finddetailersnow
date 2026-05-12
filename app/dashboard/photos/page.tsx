'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Photo {
  id: string;
  listing_id: string;
  photo_type: 'cover' | 'logo' | 'gallery';
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

const PHOTO_LIMITS: Record<string, number> = { free: 10, pro: 25, featured: 50 };

function PhotosContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const email = searchParams.get('email') || '';

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!listingId) { setLoading(false); return; }
    loadPhotos();
    // Get tier from analytics
    if (email) {
      fetch(`/api/listings/analytics?listing=${listingId}&email=${encodeURIComponent(email)}`)
        .then(r => r.json())
        .then(d => { if (d.tier) setTier(d.tier); })
        .catch(() => {});
    }
  }, [listingId, email]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/photos?listing=${listingId}`);
      const data = await res.json();
      setPhotos(data.photos ?? []);
    } catch {
      setError('Failed to load photos.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, photoType: string) => {
    setUploading(photoType);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('listing_id', listingId);
      formData.append('email', email);
      formData.append('photo_type', photoType);
      formData.append('alt_text', file.name.replace(/\.[^.]+$/, ''));

      const res = await fetch('/api/listings/photos', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        await loadPhotos();
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    setDeleting(photoId);
    try {
      const res = await fetch('/api/listings/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photoId, listing_id: listingId, email }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
      }
    } catch {
      setError('Delete failed. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const coverPhoto = photos.find(p => p.photo_type === 'cover');
  const logoPhoto = photos.find(p => p.photo_type === 'logo');
  const galleryPhotos = photos.filter(p => p.photo_type === 'gallery');
  const galleryLimit = PHOTO_LIMITS[tier] ?? 10;

  const UploadZone = ({
    label,
    photoType,
    currentPhoto,
    inputRef,
    aspectHint,
  }: {
    label: string;
    photoType: string;
    currentPhoto: Photo | undefined;
    inputRef: React.RefObject<HTMLInputElement | null>;
    aspectHint: string;
  }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <span className="text-xs text-gray-400">{aspectHint}</span>
      </div>

      {currentPhoto ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200">
          <div className="relative w-full h-40">
            <Image src={currentPhoto.url} alt={currentPhoto.alt_text || label} fill className="object-cover" sizes="400px" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading === photoType}
              className="bg-white text-gray-900 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Replace
            </button>
            <button
              onClick={() => handleDelete(currentPhoto.id)}
              disabled={deleting === currentPhoto.id}
              className="bg-red-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading === photoType}
          className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#ff6b35] hover:bg-orange-50 transition-all text-gray-400 hover:text-[#ff6b35]"
        >
          {uploading === photoType ? (
            <div className="w-6 h-6 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Upload {label}</span>
              <span className="text-xs">JPEG, PNG, WebP · Max 5MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, photoType);
          e.target.value = '';
        }}
      />
    </div>
  );

  if (!listingId) {
    return (
      <div className="text-center py-20 text-gray-400">
        No listing found. Use the link from your verification email.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Photos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a cover photo, logo, and gallery to attract more customers.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-5 text-sm">
          {error}
        </div>
      )}

      {/* Cover + Logo row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <UploadZone
          label="Cover Photo"
          photoType="cover"
          currentPhoto={coverPhoto}
          inputRef={coverInputRef}
          aspectHint="Recommended: 1200×400"
        />
        <UploadZone
          label="Business Logo"
          photoType="logo"
          currentPhoto={logoPhoto}
          inputRef={logoInputRef}
          aspectHint="Recommended: 400×400"
        />
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Work Gallery</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {galleryPhotos.length} / {galleryLimit} photos ({tier} plan)
            </p>
          </div>
          {galleryPhotos.length < galleryLimit && (
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading === 'gallery'}
              className="flex items-center gap-1.5 bg-[#ff6b35] hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading === 'gallery' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              Add Photo
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : galleryPhotos.length === 0 ? (
          <button
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading === 'gallery'}
            className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#ff6b35] hover:bg-orange-50 transition-all text-gray-400 hover:text-[#ff6b35]"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Upload work photos — before & after, finished jobs</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={photo.url}
                  alt={photo.alt_text || 'Gallery photo'}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deleting === photo.id}
                    className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    {deleting === photo.id ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file, 'gallery');
            e.target.value = '';
          }}
        />
      </div>

      {/* Upgrade nudge */}
      {tier === 'free' && (
        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-[#1e3a5f]">
          <strong>Free plan:</strong> Up to 10 gallery photos.{' '}
          <a
            href={`/pricing?listing=${listingId}&email=${encodeURIComponent(email)}`}
            className="text-[#ff6b35] hover:underline font-medium"
          >
            Upgrade to Pro
          </a>{' '}
          for 25 photos, or Featured for 50.
        </div>
      )}
    </div>
  );
}

export default function PhotosPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <PhotosContent />
    </Suspense>
  );
}
