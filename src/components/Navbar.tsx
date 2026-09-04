'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';
import ThemeToggle from '@/components/ThemeToggle';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import { searchProducts } from '@/utils/search';
import {
  Smartphone,
  Laptop,
  Scale,
  Heart,
  Search,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedIds } = useCompare();
  const { wishlistIds } = useWishlist();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroScrolledPast, setHeroScrolledPast] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === '/';

  // Mount tracking for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Keyboard Shortcut: ⌘K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        desktopInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track window scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (isHomePage) {
        setHeroScrolledPast(window.scrollY > 280);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Sync search input with URL search param
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const timer = setTimeout(() => {
      setSearchQuery((prev) => (prev === q ? prev : q));
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Debounce search query input (200ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Close live search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopSearchRef.current?.contains(target);
      const insideMobile = mobileSearchRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search matching results
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    return searchProducts(phonesData as Phone[], debouncedQuery, 'all', 6);
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsDropdownOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsDropdownOpen(false);
    }
  }, [debouncedQuery]);

  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);

    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      router.push(`/phones/${searchResults[selectedIndex].slug}`);
      return;
    }

    const categoryVal = searchParams.get('category');
    const categoryQuery = categoryVal ? `&category=${categoryVal}` : '';
    if (searchQuery.trim()) {
      router.push(`/phones?q=${encodeURIComponent(searchQuery.trim())}${categoryQuery}`);
    } else {
      router.push(`/phones${categoryVal ? `?category=${categoryVal}` : ''}`);
    }
  }, [selectedIndex, searchResults, searchParams, searchQuery, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) {
      if (e.key === 'Escape') setIsDropdownOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectResult = (slug: string) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    router.push(`/phones/${slug}`);
  };

  const formatPrice = (p?: number) => {
    if (!p) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);
  };

  const showHeaderSearch = !isHomePage || heroScrolledPast;

  const isPhonesActive = pathname === '/phones' && (searchParams.get('category') || 'phone') === 'phone';
  const isLaptopsActive = pathname === '/phones' && searchParams.get('category') === 'laptop';
  const isCompareActive = pathname === '/compare';
  const isSavedActive = pathname === '/saved';

  const compareCount = mounted ? selectedIds.length : 0;
  const wishlistCount = mounted ? wishlistIds.length : 0;

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-theme-elevated/95 backdrop-blur-md transition-all duration-200 ${
        isScrolled ? 'border-b border-theme shadow-md shadow-black/5' : 'border-b border-theme/40'
      }`}
    >
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-3 sm:gap-4">
        {/* 1. Logo & Symbol Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" title="TrueSpecs Home">
          <span className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-accent font-black text-xs sm:text-sm text-white shadow-md shadow-accent/25 group-hover:scale-105 transition-all font-display">
            TS
            <span className="absolute -inset-0.5 rounded-xl bg-accent opacity-20 blur-sm group-hover:opacity-50 transition-opacity" />
          </span>
          <span className="text-base sm:text-lg md:text-xl font-black tracking-tight text-theme-primary group-hover:text-accent transition-colors font-display">
            TrueSpecs
          </span>
        </Link>

        {/* 2. Desktop Live Search Bar with ⌘K Symbol */}
        <div ref={desktopSearchRef} className="relative flex-1 max-w-md hidden md:block">
          {showHeaderSearch && (
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                ref={desktopInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (debouncedQuery.length > 0) setIsDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search specs, chipsets, models..."
                className="w-full h-10 pl-9 pr-14 rounded-xl border border-theme bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 text-xs transition-all shadow-sm font-sans"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-secondary stroke-[2]" />
              
              {/* Shortcut Symbol Badge ⌘K */}
              {!searchQuery && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 rounded-md border border-theme bg-theme-elevated px-1.5 py-0.5 text-[9px] font-mono font-bold text-theme-secondary opacity-70">
                  <Command className="w-2.5 h-2.5" />
                  <span>K</span>
                </div>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary p-0.5 rounded-md cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          )}

          {/* Autocomplete Dropdown */}
          {showHeaderSearch && isDropdownOpen && (
            <div className="absolute top-12 left-0 right-0 z-50 rounded-xl border border-theme bg-theme-elevated p-2 shadow-2xl animate-slide-up max-h-[420px] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-theme-secondary border-b border-theme/60">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-accent" />
                      Matches ({searchResults.length})
                    </span>
                    <span className="text-[9px] font-mono lowercase opacity-70">↑↓ to navigate, ↵ to select</span>
                  </div>
                  {searchResults.map((product, idx) => {
                    const isLaptop = product.category === 'laptop';
                    const isSelected = idx === selectedIndex;
                    const priceVal = product.price.amazonPrice || product.price.flipkartPrice || product.price.mrp;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectResult(product.slug)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left group cursor-pointer ${
                          isSelected ? 'bg-accent/10 border border-accent/30' : 'hover:bg-theme-surface-hover border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-7 shrink-0 rounded bg-theme-surface p-1 flex items-center justify-center border border-theme">
                            <img
                              src={product.images[0] || '/placeholder.png'}
                              alt={product.model}
                              className="h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] uppercase font-bold text-theme-secondary">
                                {product.brand}
                              </span>
                              <span
                                className={`text-[8px] font-bold px-1 rounded ${
                                  isLaptop
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                    : 'bg-accent-bg text-accent border border-accent/20'
                                }`}
                              >
                                {isLaptop ? 'Laptop' : 'Phone'}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-theme-primary truncate block group-hover:text-accent transition-colors font-display">
                              {product.model}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-xs font-bold text-theme-primary block tabular-nums">
                            {formatPrice(priceVal)}
                          </span>
                          <span className="text-[9px] font-bold text-accent bg-accent-bg px-1 py-0.5 rounded border border-accent/20">
                            {product.specsScore}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-2 mt-1 text-center text-xs font-bold text-accent hover:bg-accent-bg rounded-lg transition-colors flex items-center justify-center gap-1 border-t border-theme cursor-pointer font-sans"
                  >
                    <span>View all matching results</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-theme-secondary">
                  No products found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Symbol-First Navigation Suite (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {/* Phones Symbol */}
          <Link
            href="/phones?category=phone"
            className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isPhonesActive
                ? 'text-accent bg-accent-bg border border-accent/25 shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover border border-transparent'
            }`}
            title="Browse Smartphones"
            aria-label="Phones"
          >
            <Smartphone className="w-4 h-4 stroke-[2]" />
            <span className="text-xs">Phones</span>
          </Link>

          {/* Laptops Symbol */}
          <Link
            href="/phones?category=laptop"
            className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isLaptopsActive
                ? 'text-accent bg-accent-bg border border-accent/25 shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover border border-transparent'
            }`}
            title="Browse Laptops"
            aria-label="Laptops"
          >
            <Laptop className="w-4 h-4 stroke-[2]" />
            <span className="text-xs">Laptops</span>
          </Link>

          {/* Compare Symbol with Live Count Pill */}
          <Link
            href="/compare"
            className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isCompareActive
                ? 'text-accent bg-accent-bg border border-accent/25 shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover border border-transparent'
            }`}
            title="Side-by-Side Comparison"
            aria-label="Compare"
          >
            <Scale className="w-4 h-4 stroke-[2]" />
            <span className="text-xs">Compare</span>
            {compareCount > 0 && (
              <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-accent text-[9px] font-black text-white animate-bounce-short">
                {compareCount}
              </span>
            )}
          </Link>

          {/* Wishlist / Saved Symbol with Heart Badge */}
          <Link
            href="/saved"
            className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isSavedActive
                ? 'text-rose-500 bg-rose-500/10 border border-rose-500/25 shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover border border-transparent'
            }`}
            title="Saved Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 stroke-[2]" fill={wishlistCount > 0 ? '#f43f5e' : 'none'} />
            <span className="text-xs">Saved</span>
            {wishlistCount > 0 && (
              <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-bounce-short">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle Symbol */}
          <div className="pl-1 border-l border-theme ml-1">
            <ThemeToggle />
          </div>
        </nav>

        {/* 4. Mobile Quick Symbol Action Bar */}
        <div className="flex md:hidden items-center gap-1">
          {/* Quick Compare Icon Badge on Mobile Header */}
          <Link
            href="/compare"
            className="relative p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover flex items-center justify-center"
            title="Compare"
            aria-label="Compare"
          >
            <Scale className="w-4 h-4 stroke-[2]" />
            {compareCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-accent text-[8px] font-black text-white">
                {compareCount}
              </span>
            )}
          </Link>

          {/* Quick Wishlist Icon Badge on Mobile Header */}
          <Link
            href="/saved"
            className="relative p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover flex items-center justify-center"
            title="Saved"
            aria-label="Saved"
          >
            <Heart className="w-4 h-4 stroke-[2]" fill={wishlistCount > 0 ? '#f43f5e' : 'none'} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-4.5 h-4.5 stroke-[2]" />
            ) : (
              <Menu className="w-4.5 h-4.5 stroke-[2]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Live Search Row */}
      {showHeaderSearch && (
        <div className="md:hidden px-3 pb-2.5 relative" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (debouncedQuery.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search phones, laptops, chips..."
              className="w-full h-9 pl-8 pr-7 rounded-lg border border-theme bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 text-xs transition-all font-sans"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-secondary stroke-[2]" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-11 left-3 right-3 z-50 rounded-xl border border-theme bg-theme-elevated p-2 shadow-2xl animate-slide-up max-h-[340px] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((product) => {
                    const isLaptop = product.category === 'laptop';
                    const priceVal = product.price.amazonPrice || product.price.flipkartPrice || product.price.mrp;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectResult(product.slug)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-theme-surface-hover transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-6 shrink-0 rounded bg-theme-surface p-0.5 flex items-center justify-center border border-theme">
                            <img src={product.images[0] || '/placeholder.png'} alt={product.model} className="h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-theme-secondary uppercase font-bold">{product.brand}</span>
                              <span className={`text-[8px] font-bold px-1 rounded ${isLaptop ? 'text-purple-500 bg-purple-500/10' : 'text-accent bg-accent-bg'}`}>
                                {isLaptop ? 'Laptop' : 'Phone'}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-theme-primary truncate block font-display">
                              {product.model}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-[11px] font-extrabold text-accent block tabular-nums">
                            {formatPrice(priceVal)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-2 mt-1 text-center text-xs font-bold text-accent hover:bg-accent-bg rounded-lg transition-colors flex items-center justify-center gap-1 border-t border-theme cursor-pointer font-sans"
                  >
                    <span>View all matching results</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-theme-secondary">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-theme bg-theme-elevated p-3 space-y-1.5 animate-slide-up">
          <Link
            href="/phones?category=phone"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              isPhonesActive
                ? 'text-accent bg-accent-bg border border-accent/20'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
            }`}
          >
            <Smartphone className="w-4 h-4 stroke-[2]" />
            <span>Smartphones</span>
          </Link>

          <Link
            href="/phones?category=laptop"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              isLaptopsActive
                ? 'text-accent bg-accent-bg border border-accent/20'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
            }`}
          >
            <Laptop className="w-4 h-4 stroke-[2]" />
            <span>Laptops & Notebooks</span>
          </Link>

          <Link
            href="/compare"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <Scale className="w-4 h-4 stroke-[2]" />
              <span>Comparison Tool</span>
            </div>
            {compareCount > 0 && (
              <span className="flex h-4.5 px-1.5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                {compareCount}
              </span>
            )}
          </Link>

          <Link
            href="/saved"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 stroke-[2]" fill={wishlistCount > 0 ? '#f43f5e' : 'none'} />
              <span>Saved Wishlist</span>
            </div>
            {wishlistCount > 0 && (
              <span className="flex h-4.5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  );
}
