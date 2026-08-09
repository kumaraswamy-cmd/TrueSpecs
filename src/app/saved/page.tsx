'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowRight, Smartphone, Laptop, LayoutGrid, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import PhoneCard from '@/components/PhoneCard';

type FilterCategory = 'all' | 'phone' | 'laptop';

export default function SavedPage() {
  const { wishlistIds, isMounted, clearWishlist } = useWishlist();
  const [filter, setFilter] = useState<FilterCategory>('all');

  // We need to resolve the saved phone IDs to actual phone objects
  const savedProducts = useMemo(() => {
    if (!isMounted) return [];
    
    // Map IDs to product objects and filter out any that no longer exist
    return wishlistIds
      .map(id => (phonesData as Phone[]).find(p => p.id === id))
      .filter((p): p is Phone => p !== undefined);
  }, [wishlistIds, isMounted]);

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return savedProducts;
    return savedProducts.filter(p => (p.category || 'phone') === filter);
  }, [savedProducts, filter]);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
      clearWishlist();
    }
  };

  // Ensure we don't render mismatching empty state on server
  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex justify-center animate-pulse">
        <div className="h-32 w-full max-w-2xl bg-theme-elevated rounded-2xl border border-theme"></div>
      </div>
    );
  }

  // Empty state
  if (savedProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6 animate-slide-up">
        <div className="h-16 w-16 rounded-xl bg-accent-bg border border-accent/20 text-accent flex items-center justify-center mx-auto shadow-inner">
          <Bookmark className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight font-display">Your Saved Wishlist</h1>
          <p className="text-sm text-theme-secondary max-w-md mx-auto leading-relaxed font-normal">
            No saved products yet — tap the heart icon on any phone or laptop to save it here.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-theme bg-theme-surface p-8 max-w-lg mx-auto space-y-4 mt-6">
          <Link
            href="/phones"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-xs font-bold text-white hover:scale-102 transition-all shadow-md shadow-accent/15 cursor-pointer"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 animate-slide-up space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-theme-primary tracking-tight font-display flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-accent" />
            Saved Wishlist
          </h1>
          <p className="text-sm text-theme-secondary mt-2">
            You have {savedProducts.length} product{savedProducts.length === 1 ? '' : 's'} saved for later.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-theme-elevated p-1.5 rounded-xl border border-theme shrink-0 w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-theme-surface shadow-sm text-theme-primary'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4 stroke-[1.8]" />
            <span className="hidden sm:inline">All</span>
          </button>
          
          <button
            onClick={() => setFilter('phone')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'phone'
                ? 'bg-theme-surface shadow-sm text-theme-primary'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface/50'
            }`}
          >
            <Smartphone className="w-4 h-4 stroke-[1.8]" />
            <span className="hidden sm:inline">Phones</span>
          </button>

          <button
            onClick={() => setFilter('laptop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'laptop'
                ? 'bg-theme-surface shadow-sm text-theme-primary'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface/50'
            }`}
          >
            <Laptop className="w-4 h-4 stroke-[1.8]" />
            <span className="hidden sm:inline">Laptops</span>
          </button>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex justify-end">
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-danger border border-transparent hover:border-danger/30 hover:bg-danger-bg transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4 stroke-[1.8]" />
          Clear All
        </button>
      </div>

      {/* Grid of Saved Products */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map(product => (
            <PhoneCard key={product.id} phone={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-theme-surface border border-dashed border-theme rounded-2xl space-y-3">
          <p className="text-sm font-medium text-theme-secondary">
            No {filter === 'phone' ? 'phones' : 'laptops'} found in your wishlist.
          </p>
          <button 
            onClick={() => setFilter('all')}
            className="text-xs font-bold text-accent hover:underline cursor-pointer"
          >
            View all saved products
          </button>
        </div>
      )}
    </div>
  );
}
