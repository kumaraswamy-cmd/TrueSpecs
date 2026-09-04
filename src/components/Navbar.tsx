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
import { Smartphone, Laptop, ArrowLeftRight, Bookmark, Search, Menu, X, ChevronRight, Sparkles } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedIds } = useCompare();
  const { wishlistIds, isMounted: wishlistIsMounted } = useWishlist();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroScrolledPast, setHeroScrolledPast] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === '/';

  // Mount tracking for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track window scroll for shadow and homepage search bar visibility
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

  // Debounce search query input (200ms for fast feedback)
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

  // Live search matching results (up to 6 products using multi-token search)
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    return searchProducts(phonesData as Phone[], debouncedQuery, 'all', 6);
  }, [debouncedQuery]);

  // Open dropdown when debounced query exists
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

  // Determine if header search bar should be displayed
  const showHeaderSearch = !isHomePage || heroScrolledPast;

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-theme-elevated/95 backdrop-blur-md transition-all duration-200 ${
        isScrolled ? 'border-b border-theme shadow-md shadow-black/5' : 'border-b border-theme/40'
      }`}
    >
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* 1. Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="relative flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-accent font-bold text-xs sm:text-sm text-white shadow-md shadow-accent/20 group-hover:scale-105 transition-all font-display">
            TS
            <span className="absolute -inset-0.5 rounded-lg bg-accent opacity-20 blur-sm group-hover:opacity-45 transition-opacity"></span>
          </span>
          <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-theme-primary group-hover:text-accent transition-colors font-display">
            TrueSpecs
          </span>
        </Link>

        {/* 2. Desktop Live Search Bar */}
        <div ref={desktopSearchRef} className="relative flex-1 max-w-lg hidden md:block">
          {showHeaderSearch && (
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (debouncedQuery.length > 0) setIsDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search phones, laptops, chipsets, RAM (e.g. Snapdragon, OLED, M4)..."
                className="w-full h-10 pl-10 pr-9 rounded-lg border border-theme bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 text-xs transition-all shadow-sm font-sans"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary stroke-[1.8]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary p-0.5 rounded-md"
                  aria-label="Clear search query"
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
                      Matching Products ({searchResults.length})
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
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left group cursor-pointer ${
                          isSelected ? 'bg-accent/10 border border-accent/30' : 'hover:bg-theme-surface-hover border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-8 shrink-0 rounded bg-theme-surface p-1 flex items-center justify-center border border-theme">
                            <img
                              src={product.images[0] || '/placeholder.png'}
                              alt={product.model}
                              className="h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-theme-secondary">
                                {product.brand}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  isLaptop
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                    : 'bg-accent-bg text-accent border border-accent/20'
                                }`}
                              >
                                {isLaptop ? 'Laptop' : 'Phone'}
                              </span>
                            </div>
                            <span className="text-xs font-extrabold text-theme-primary truncate block group-hover:text-accent transition-colors font-display">
                              {product.model}
                            </span>
                            <span className="text-[10px] text-theme-secondary truncate block">
                              {isLaptop
                                ? `${product.specs.performance?.cpuModel || ''} • ${product.specs.performance?.ramSize || ''}GB RAM`
                                : `${product.specs.performance?.chipset || ''} • ${product.specs.display?.type || ''}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-xs font-bold text-theme-primary block tabular-nums">
                            {formatPrice(priceVal)}
                          </span>
                          <span className="text-[10px] font-bold text-accent bg-accent-bg px-1.5 py-0.5 rounded-md border border-accent/20">
                            {product.specsScore} Score
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
                <div className="p-5 text-center text-xs text-theme-secondary space-y-1">
                  <p className="font-bold text-theme-primary">No products found matching &quot;{searchQuery}&quot;</p>
                  <p className="text-[11px] opacity-80">Try searching by brand (Apple, Samsung, Asus), chip (Snapdragon, M4), or feature (OLED, 5G).</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Desktop Navigation Items */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {/* Phones Category Tab */}
          <Link
            href="/phones?category=phone"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              pathname === '/phones' && (searchParams.get('category') || 'phone') === 'phone'
                ? 'text-accent bg-accent-bg'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
            }`}
          >
            <Smartphone className="w-4 h-4 stroke-[1.8]" />
            <span>Phones</span>
          </Link>

          {/* Laptops Category Tab */}
          <Link
            href="/phones?category=laptop"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              pathname === '/phones' && searchParams.get('category') === 'laptop'
                ? 'text-accent bg-accent-bg'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
            }`}
          >
            <Laptop className="w-4 h-4 stroke-[1.8]" />
            <span>Laptops</span>
          </Link>

          {/* Compare */}
          <Link
            href="/compare"
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 stroke-[1.8]" />
            <span>Compare</span>
            {mounted && selectedIds.length > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded bg-accent text-[10px] font-extrabold text-white animate-bounce-short">
                {selectedIds.length}
              </span>
            )}
          </Link>

          {/* Saved / Wishlist */}
          <Link
            href="/saved"
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            <Bookmark className="w-4 h-4 stroke-[1.8]" />
            <span>Saved</span>
            {wishlistIsMounted && wishlistIds.length > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded bg-rose-500 text-[10px] font-extrabold text-white animate-bounce-short">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          {/* 4. Theme Toggle */}
          <div className="pl-1 border-l border-theme ml-1">
            <ThemeToggle />
          </div>
        </nav>

        {/* 5. Mobile Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ThemeToggle />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[1.8]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Live Search Row */}
      {showHeaderSearch && (
        <div className="md:hidden px-4 pb-3 relative" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (debouncedQuery.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search products (e.g. 5G, Snapdragon, M4)..."
              className="w-full h-10 pl-9 pr-8 rounded-lg border border-theme bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 text-xs transition-all font-sans"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-secondary stroke-[1.8]" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-12 left-4 right-4 z-50 rounded-xl border border-theme bg-theme-elevated p-2 shadow-2xl animate-slide-up max-h-[360px] overflow-y-auto">
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
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-6 shrink-0 rounded bg-theme-surface p-0.5 flex items-center justify-center border border-theme">
                            <img src={product.images[0] || '/placeholder.png'} alt={product.model} className="h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-theme-secondary uppercase font-bold">{product.brand}</span>
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
                          <span className="text-[9px] text-theme-secondary block">
                            {product.specsScore} Score
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

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-theme bg-theme-elevated p-4 space-y-2 animate-slide-up">
          <Link
            href="/phones?category=phone"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
              pathname === '/phones' && (searchParams.get('category') || 'phone') === 'phone'
                ? 'text-accent bg-accent-bg'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
            }`}
          >
            <Smartphone className="w-5 h-5 stroke-[1.8]" />
            <span>Phones</span>
          </Link>

          <Link
            href="/phones?category=laptop"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
              pathname === '/phones' && searchParams.get('category') === 'laptop'
                ? 'text-accent bg-accent-bg'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
            }`}
          >
            <Laptop className="w-5 h-5 stroke-[1.8]" />
            <span>Laptops</span>
          </Link>

          <Link
            href="/compare"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-5 h-5 stroke-[1.8]" />
              <span>Compare</span>
            </div>
            {mounted && selectedIds.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded bg-accent text-xs font-extrabold text-white">
                {selectedIds.length}
              </span>
            )}
          </Link>

          <Link
            href="/saved"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 stroke-[1.8]" />
              <span>Saved Wishlist</span>
            </div>
            {wishlistIsMounted && wishlistIds.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-xs font-extrabold text-white">
                {wishlistIds.length}
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  );
}
