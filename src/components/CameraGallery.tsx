'use client';

import React, { useState } from 'react';
import { MediaPhoto } from '@/types/phone';

interface CameraGalleryProps {
  photos: MediaPhoto[];
  sampleVideoUrl?: string;
  reviewVideoTimestampUrl?: string;
}

export default function CameraGallery({
  photos = [],
  sampleVideoUrl = '',
  reviewVideoTimestampUrl = '',
}: CameraGalleryProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'video' | 'review'>(
    photos.length > 0 ? 'photos' : sampleVideoUrl ? 'video' : 'review'
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hasPhotos = photos.length > 0;
  const hasSampleVideo = !!sampleVideoUrl;
  const hasReviewVideo = !!reviewVideoTimestampUrl;

  if (!hasPhotos && !hasSampleVideo && !hasReviewVideo) {
    return (
      <div className="rounded-2xl border border-theme bg-theme-surface p-8 text-center text-theme-secondary text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 text-theme-secondary">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
        No camera samples available yet for this device.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-theme bg-theme-surface overflow-hidden shadow-sm transition-colors duration-200">
      {/* Tab bar header */}
      <div className="flex border-b border-theme bg-theme-elevated">
        {hasPhotos && (
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase tracking-wider cursor-pointer ${
              activeTab === 'photos'
                ? 'border-accent text-theme-primary bg-theme-surface'
                : 'border-transparent text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Camera Photos ({photos.length})
          </button>
        )}
        {hasSampleVideo && (
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase tracking-wider cursor-pointer ${
              activeTab === 'video'
                ? 'border-accent text-theme-primary bg-theme-surface'
                : 'border-transparent text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Video Footage
          </button>
        )}
        {hasReviewVideo && (
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase tracking-wider cursor-pointer ${
              activeTab === 'review'
                ? 'border-accent text-theme-primary bg-theme-surface'
                : 'border-transparent text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Video Review Sample
          </button>
        )}
      </div>

      {/* Tab contents */}
      <div className="p-6">
        {activeTab === 'photos' && hasPhotos && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative cursor-pointer aspect-video rounded-xl overflow-hidden bg-theme-elevated border border-theme hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-[11px] font-semibold text-white line-clamp-1">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-theme-secondary text-center mt-4 italic">
              Click any photo to open in fullscreen lightbox
            </p>
          </div>
        )}

        {activeTab === 'video' && hasSampleVideo && (
          <div className="max-w-2xl mx-auto rounded-xl overflow-hidden bg-theme-elevated border border-theme shadow-2xl">
            <video
              src={sampleVideoUrl}
              controls
              className="w-full h-auto aspect-video"
              poster="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"
            />
            <div className="p-3 bg-theme-surface text-center">
              <span className="text-[11px] font-bold text-theme-secondary">Official camera sample footage</span>
            </div>
          </div>
        )}

        {activeTab === 'review' && hasReviewVideo && (
          <div className="max-w-2xl mx-auto rounded-xl overflow-hidden bg-theme-elevated border border-theme shadow-2xl">
            <div className="relative aspect-video w-full">
              <iframe
                src={reviewVideoTimestampUrl}
                title="Review Video"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-3 bg-theme-surface text-center">
              <span className="text-[11px] font-bold text-theme-secondary">Independent YouTube review timestamped camera test</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-slide-up">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Active Image and Caption */}
          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption}
              className="max-h-[70vh] object-contain rounded-lg border border-zinc-800"
            />
            <p className="text-sm font-bold text-zinc-300 mt-4 text-center px-4 bg-zinc-900/50 py-2 rounded-full border border-zinc-850">
              {photos[lightboxIndex].caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
