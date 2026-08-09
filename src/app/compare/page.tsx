'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import SpecsTable from '@/components/SpecsTable';
import SpecsScoreDial from '@/components/SpecsScoreDial';

export default function ComparePage() {
  const { selectedIds, isMounted, addPhone, removePhone, clearCompare } = useCompare();
  const [highlightDiff, setHighlightDiff] = useState(true);

  const activeIds = isMounted ? selectedIds : [];

  // Filter selected phones from database
  const selectedPhones = (phonesData as Phone[]).filter((phone) =>
    activeIds.includes(phone.id)
  );

  // Find remaining products of the same category that can be added to compare
  const selectedCategory = selectedPhones[0]?.category;
  const remainingPhones = (phonesData as Phone[]).filter(
    (phone) => !activeIds.includes(phone.id) && (!selectedCategory || (phone.category || 'phone') === selectedCategory)
  );

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);
  };

  return (
    <div className="space-y-8 py-6 animate-slide-up transition-colors duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">Compare Products</h1>
          <p className="text-xs text-theme-secondary mt-1 font-medium">
            Compare specs side-by-side and highlight crucial technical differences.
          </p>
        </div>
        
        {selectedIds.length >= 2 && (
          <div className="flex items-center gap-4">
            {/* Highlight differences toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none bg-theme-surface border border-theme px-4 py-2 rounded-lg text-xs font-bold text-theme-secondary hover:text-theme-primary transition-colors">
              <input
                type="checkbox"
                checked={highlightDiff}
                onChange={(e) => setHighlightDiff(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-theme bg-theme-surface text-accent focus:ring-accent"
              />
              Highlight Differences
            </label>

            {/* Clear compare */}
            <button
              onClick={clearCompare}
              className="px-4 py-2 bg-danger hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Clear Comparison
            </button>
          </div>
        )}
      </div>

      {/* Selected Phones Overview Grid (Hidden on Mobile, relying on the scrollable table instead) */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedPhones.map((phone) => {
          const isVerified = !phone.dataCompleteness.unverifiedFields || phone.dataCompleteness.unverifiedFields.length === 0;
          return (
            <div
              key={phone.id}
              className="group relative rounded-xl border border-theme bg-theme-surface p-5 flex flex-col items-center justify-between text-center shadow-sm"
            >
              {/* Remove button */}
              <button
                onClick={() => removePhone(phone.id)}
                className="absolute right-3 top-3 h-7 w-7 rounded-full bg-danger text-white hover:opacity-90 transition-colors flex items-center justify-center cursor-pointer"
                title="Remove from comparison"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Phone Info */}
              <div className="flex flex-col items-center">
                <div className="h-28 w-24 overflow-hidden p-1 bg-theme-elevated rounded-lg flex items-center justify-center mb-4 border border-theme">
                  <img src={phone.images[0]} alt={phone.model} className="h-full object-contain" />
                </div>
                <span className="text-[10px] text-theme-secondary uppercase font-bold tracking-widest">{phone.brand}</span>
                <Link href={`/phones/${phone.slug}`} className="text-sm font-extrabold text-theme-primary mt-1 hover:text-accent transition-colors line-clamp-1">
                  {phone.model}
                </Link>
                {phone.variantLabel && (
                  <span className="text-[9px] font-bold text-accent bg-accent-bg border border-accent/20 px-1.5 py-0.5 rounded mt-1">
                    {phone.variantLabel}
                  </span>
                )}
              </div>

              {/* Score & price */}
              <div className="mt-4 pt-3 border-t border-theme w-full flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between text-center xl:text-left">
                <div className="flex items-center gap-2 justify-center xl:justify-start">
                  <SpecsScoreDial score={phone.specsScore} size="sm" />
                  <div className="flex flex-col text-left leading-[1.1]">
                    <span className="text-[8px] text-theme-secondary uppercase font-bold tracking-wider">Score</span>
                    <span className={`text-[10px] font-bold ${isVerified ? 'text-success' : 'text-warning'}`}>
                      {isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center xl:items-end">
                  <span className="text-[8px] text-theme-secondary block uppercase font-bold">Starts from</span>
                  <span className="font-extrabold text-theme-primary tabular-nums">
                    {formatPrice(phone.price.amazonPrice || phone.price.flipkartPrice)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty slots placeholders */}
        {Array.from({ length: 4 - selectedPhones.length }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-dashed border-theme bg-theme-surface/40 p-6 flex flex-col items-center justify-center text-center h-full min-h-[11rem] cursor-pointer hover:border-accent/40 hover:bg-theme-surface-hover/10 transition-colors group"
          >
            <div className="h-10 w-10 rounded-full border border-theme flex items-center justify-center text-theme-secondary group-hover:text-accent group-hover:border-accent/30 transition-all mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h4 className="text-xs font-bold text-theme-secondary group-hover:text-theme-primary">Add Product</h4>
            <p className="text-[10px] text-theme-secondary mt-1">To compare specs side-by-side</p>

            {/* Quick dropdown select */}
            {remainingPhones.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addPhone(e.target.value);
                  }
                }}
                defaultValue=""
                className="mt-3 text-[10px] bg-theme-surface border border-theme rounded-lg px-2 py-1 text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 cursor-pointer max-w-[140px]"
              >
                <option value="" disabled>+ Quick Add...</option>
                {remainingPhones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.model} {p.variantLabel ? `(${p.variantLabel})` : ''}
                  </option>
                ))}
              </select>
            )}
            
            <Link
              href="/phones"
              className="mt-4 px-3 py-1.5 rounded-lg border border-accent/30 bg-accent-bg text-accent hover:bg-accent-bg/80 text-[10px] font-bold transition-all"
            >
              Browse List
            </Link>
          </div>
        ))}
      </div>

      {/* Specs comparison table */}
      {selectedPhones.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-theme-primary font-display">Side-by-Side Comparison</h3>
          
          {selectedPhones.length < 2 && (
            <div className="rounded-xl border border-theme bg-theme-surface p-5 text-center text-theme-secondary text-xs">
              ⚠️ Select at least 2 products to enable comparative highlights and difference tracking.
            </div>
          )}

          <SpecsTable 
            phones={selectedPhones} 
            highlightDifferences={highlightDiff} 
            showEmptySlots={true} 
            remainingPhones={remainingPhones} 
          />
        </div>
      ) : (
        <div className="rounded-xl border border-theme bg-theme-surface py-16 px-6 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-theme-elevated border border-theme text-theme-secondary flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-theme-primary font-display">Comparison is Empty</h3>
            <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
              You haven&apos;t added any products to compare yet. Browse the listing page and select the compare check on cards to see side-by-side details here.
            </p>
          </div>
          <Link
            href="/phones"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-xs font-bold text-white hover:scale-102 transition-all shadow-md shadow-accent/10 cursor-pointer"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
