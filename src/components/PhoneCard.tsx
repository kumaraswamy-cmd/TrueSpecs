'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone } from '@/types/phone';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';

interface PhoneCardProps {
  phone: Phone;
  configCount?: number;
}

export default function PhoneCard({ phone, configCount }: PhoneCardProps) {
  const { selectedIds, isMounted: compareIsMounted, addPhone, removePhone } = useCompare();
  const { wishlistIds, isMounted: wishlistIsMounted, toggleWishlist } = useWishlist();

  const isSelected = compareIsMounted && selectedIds.includes(phone.id);
  const isLiked = wishlistIsMounted && wishlistIds.includes(phone.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSelected) {
      removePhone(phone.id);
    } else {
      if (selectedIds.length < 4) {
        addPhone(phone.id);
      } else {
        alert('You can compare at most 4 products side-by-side.');
      }
    }
  };

  // Format currency
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);
  };

  const isLaptop = phone.category === 'laptop';
  const price = phone.price.amazonPrice || phone.price.flipkartPrice;
  const isVerified = !phone.dataCompleteness?.unverifiedFields || phone.dataCompleteness.unverifiedFields.length === 0;

  // Star Rating out of 5 based on specsScore
  const starRating = Math.round((phone.specsScore || 0) / 20);

  // Specifications highlights (4-6 checkmarked bullets)
  const specsHighlights = isLaptop ? [
    `Display: ${phone.specs.display.size}" ${phone.specs.display.panelType} (${phone.specs.display.resolution})`,
    `Processor: ${phone.specs.performance.cpuBrand} ${phone.specs.performance.cpuModel} (${phone.specs.performance.cpuCores} Cores)`,
    `Memory: ${phone.specs.performance.ramSize}GB ${phone.specs.performance.ramType} RAM`,
    `Storage: ${phone.specs.performance.storageCapacity} ${phone.specs.performance.storageType}`,
    `Battery: ${phone.specs.battery.capacityWh} Wh (${phone.specs.battery.fastCharging ? 'Fast Charging' : 'Standard'})`,
    `OS: ${phone.specs.os.preinstalledOS}`,
  ] : [
    `Display: ${phone.specs.display.size}" ${phone.specs.display.type} (${phone.specs.display.refreshRate}Hz)`,
    `Chipset: ${phone.specs.performance.chipset}`,
    `Memory: ${phone.specs.performance.ram?.join('/') || '8'}GB RAM \| ${phone.specs.performance.storage?.join('/') || '128'}GB Storage`,
    `Camera: ${phone.specs.camera.rear?.[0]?.megapixel || '50'} MP (${phone.specs.camera.rear?.[0]?.ois ? 'OIS Supported' : 'No OIS'})`,
    `Battery: ${phone.specs.battery.capacity} mAh (${phone.specs.battery.chargingSpeedWatts}W Fast Charging)`,
    `IP Rating: ${phone.specs.build.ipRating || 'IP68'} Water Resistant`,
  ];

  return (
    <div className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl border border-theme bg-theme-surface hover:shadow-md transition-all duration-300 relative h-full min-w-0">
      {/* Product Image (Left) */}
      <div className="w-full sm:w-48 h-40 flex items-center justify-center bg-theme-elevated rounded-xl p-4 shrink-0 overflow-hidden relative sm:self-center">
        <img
          src={phone.images[0] || '/placeholder.png'}
          alt={phone.model}
          className="max-h-full max-w-full object-contain filter brightness-95 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300"
          loading="lazy"
        />
        {configCount && configCount > 1 && (
          <span className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-black bg-accent text-white uppercase tracking-wider py-0.5 rounded px-1.5 shadow-sm">
            {configCount} configs
          </span>
        )}
      </div>

      {/* Main content details (Center) */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold text-accent bg-accent-bg border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {phone.brand}
            </span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
              isLaptop
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {phone.category || 'phone'}
            </span>
          </div>

          {/* Title & Price Row */}
          <div className="flex justify-between items-start gap-4 w-full">
            <Link href={`/phones/${phone.slug}`} className="min-w-0 flex-1">
              <h3 className="text-base sm:text-xl font-extrabold text-theme-primary group-hover:text-accent transition-colors tracking-tight font-display truncate">
                {phone.model}
              </h3>
            </Link>

            {/* Price Block */}
            <div className="text-right shrink-0">
              <span className="text-[9px] text-theme-secondary block uppercase font-bold tracking-wider leading-none">Starting from</span>
              <span className="text-base sm:text-xl font-black text-theme-primary tabular-nums">
                {formatPrice(price)}
              </span>
            </div>
          </div>

          {/* Rating and Spec Score badge */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* Star Rating */}
            <div className="flex items-center gap-0.5 text-amber-500" title={`Rating: ${starRating}/5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill={star <= starRating ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-3.5 h-3.5"
                >
                  <path d="M10.868 2.784c-.304-.793-1.432-.793-1.736 0l-1.92 5.016-5.26.448c-.854.072-1.195 1.124-.543 1.74l4.024 3.793-1.222 5.21c-.2.853.722 1.523 1.453 1.055L10 17.51l4.736 2.536c.73.392 1.653-.278 1.453-1.055l-1.222-5.21 4.024-3.793c.652-.616.31-1.668-.543-1.74l-5.26-.448-1.92-5.016z" />
                </svg>
              ))}
            </div>

            {/* Specs Score Badge & Verification */}
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                phone.specsScore >= 80
                  ? 'bg-success-bg text-success border-success-border'
                  : phone.specsScore >= 60
                  ? 'bg-warning-bg text-warning border-warning-border'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                <span className="font-extrabold">{phone.specsScore}</span> Specs Score
              </span>
              
              {!isVerified && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-warning bg-warning-bg border border-warning-border px-1.5 py-0.5 rounded-md shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action row with Compare/Like/View */}
        <div className="flex items-center gap-2.5 bg-theme-elevated border border-theme px-3.5 py-1.5 rounded-xl my-2.5 w-fit">
          {/* Compare Button */}
          <button
            onClick={handleCompareClick}
            className={`h-8 px-3 rounded-lg font-bold text-xs transition-all border cursor-pointer ${
              isSelected
                ? 'bg-accent text-white border-accent shadow-sm shadow-accent/15'
                : 'border-accent/30 text-accent hover:bg-accent-bg'
            }`}
          >
            {isSelected ? '✓ Compared' : '+ Compare'}
          </button>

          {/* Save/Wishlist Heart */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(phone.id); }}
            className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-500 shadow-sm shadow-rose-500/10'
                : 'border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
            }`}
            title={isLiked ? 'Saved to Wishlist' : 'Save to Wishlist'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {/* View Details Link */}
          <Link
            href={`/phones/${phone.slug}`}
            className="h-8 px-2 flex items-center justify-center text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover border border-transparent rounded-lg transition-colors cursor-pointer text-xs font-bold gap-0.5"
            title="View Details"
          >
            <span>Details</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {/* Checkmarked Specifications list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 border-t border-theme pt-3 text-xs text-theme-secondary w-full">
          {specsHighlights.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-1.5 min-w-0 w-full" title={spec}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-success shrink-0">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              <span className="truncate whitespace-nowrap">{spec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
