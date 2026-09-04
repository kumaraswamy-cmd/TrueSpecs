'use client';

import React, { useState } from 'react';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';

interface CompareDetailButtonProps {
  phoneId: string;
}

export default function CompareDetailButton({ phoneId }: CompareDetailButtonProps) {
  const { selectedIds, addPhone, removePhone } = useCompare();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isSelected = mounted && selectedIds.includes(phoneId);
  const isFull = mounted && selectedIds.length >= 4 && !isSelected;

  const handleToggle = () => {
    if (isSelected) {
      removePhone(phoneId);
    } else {
      addPhone(phoneId);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5">
      <div className="flex items-center gap-2.5">
        {/* Compare Button */}
        <button
          onClick={handleToggle}
          disabled={isFull}
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all border cursor-pointer ${
            isSelected
              ? 'bg-accent text-white border-accent shadow-sm shadow-accent/15'
              : isFull
              ? 'bg-theme-surface text-theme-secondary border border-theme cursor-not-allowed opacity-50'
              : 'border-accent/40 text-accent bg-transparent hover:bg-accent-bg'
          }`}
        >
          {isSelected ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              <span>Added to Compare</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add to Compare</span>
            </>
          )}
        </button>

        {/* Save/Wishlist Heart */}
        <WishlistHeartButton phoneId={phoneId} />
      </div>

      {isFull && (
        <span className="inline-flex items-center gap-1.5 text-xs text-warning bg-warning-bg border border-warning-border px-3 py-1.5 rounded-lg font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-warning">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Compare list full (4/4) — remove one to add this product
        </span>
      )}
    </div>
  );
}

// Local helper component for Wishlist button state
function WishlistHeartButton({ phoneId }: { phoneId: string }) {
  const { wishlistIds, toggleWishlist } = useWishlist();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLiked = mounted && wishlistIds.includes(phoneId);

  return (
    <button
      onClick={() => toggleWishlist(phoneId)}
      className={`h-10 px-4 rounded-lg border flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer font-bold text-xs sm:text-sm ${
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
        className={`w-4.5 h-4.5 ${isLiked ? 'animate-heart-click' : ''}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      <span>{isLiked ? 'Saved' : 'Save'}</span>
    </button>
  );
}
