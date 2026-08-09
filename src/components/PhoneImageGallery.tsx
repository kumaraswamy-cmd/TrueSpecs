'use client';

import React, { useState } from 'react';

interface PhoneImageGalleryProps {
  images: string[];
  alt: string;
}

export default function PhoneImageGallery({ images, alt }: PhoneImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="rounded-xl border border-theme bg-theme-surface p-8 flex items-center justify-center aspect-square relative overflow-hidden shadow-sm">
        <span className="text-theme-secondary text-xs">No image available</span>
      </div>
    );
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main phone image card */}
      <div className="rounded-xl border border-theme bg-theme-surface p-8 flex items-center justify-center aspect-square relative overflow-hidden group shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity"></div>
        
        <img
          src={images[activeIndex]}
          alt={`${alt} - Image ${activeIndex + 1}`}
          className="max-h-64 object-contain filter brightness-95 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-theme-elevated text-theme-primary border border-theme shadow-sm hover:bg-theme-surface hover:text-accent transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-theme-elevated text-theme-primary border border-theme shadow-sm hover:bg-theme-surface hover:text-accent transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 p-1 bg-theme-surface flex items-center justify-center snap-start transition-all overflow-hidden cursor-pointer ${
                  isActive ? 'border-accent shadow-md shadow-accent/15' : 'border-transparent hover:border-theme'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <img src={img} alt={`${alt} thumbnail ${idx + 1}`} className={`max-h-full object-contain transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
