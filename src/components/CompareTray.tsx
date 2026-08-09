'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';

export default function CompareTray() {
  const pathname = usePathname();
  const { selectedIds, isMounted, removePhone, clearCompare } = useCompare();

  if (pathname === '/compare' || !isMounted || selectedIds.length === 0) return null;

  // Filter selected phones from the seed database
  const selectedPhones = (phonesData as Phone[]).filter((phone) =>
    selectedIds.includes(phone.id)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-theme-elevated/95 border-t border-theme backdrop-blur-lg shadow-2xl animate-slide-up transition-colors duration-200">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tray Heading */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-bg text-accent font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-theme-primary">Compare Tray</h4>
            <p className="text-xs text-theme-secondary">
              {selectedIds.length} of 4 products selected
            </p>
          </div>
        </div>

        {/* Selected Phone List */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {selectedPhones.map((phone) => (
            <div
              key={phone.id}
              className="group relative flex items-center gap-2 pl-2 pr-8 py-1.5 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover transition-colors"
            >
              <div className="relative h-6 w-6 rounded bg-theme-elevated overflow-hidden flex items-center justify-center border border-theme">
                {phone.images && phone.images[0] ? (
                  <img
                    src={phone.images[0]}
                    alt={phone.model}
                    className="h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-theme-secondary">TS</span>
                )}
              </div>
              <span className="text-xs font-semibold text-theme-primary">
                {phone.model}
              </span>
              <button
                onClick={() => removePhone(phone.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-red-500 transition-colors"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {selectedIds.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-xs text-danger hover:text-danger/80 transition-colors font-bold underline underline-offset-4 pl-2"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/compare"
            className="px-5 py-2.5 rounded-lg font-bold text-xs shadow-md transition-all bg-accent hover:bg-accent-hover text-white shadow-accent/15 hover:scale-102 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Compare Now ({selectedIds.length})</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
