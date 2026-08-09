'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';
import ThemeToggle from '@/components/ThemeToggle';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import { Smartphone, Laptop, LayoutGrid, ArrowLeftRight, Bookmark, Search, Menu, X, ChevronRight } from 'lucide-react';

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

  const searchContainerRef = useRef<HTMLDivElement>(null);
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

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Close live search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search matching results (up to 5 products)
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    const query = debouncedQuery.toLowerCase();
    return (phonesData as Phone[])
      .filter((phone) => {
        const isLaptop = phone.category === 'laptop';
        const perfSpec = isLaptop
          ? (phone.specs.performance?.cpuModel || '')
          : (phone.specs.performance?.chipset || '');
        return (
          phone.model.toLowerCase().includes(query) ||
          phone.brand.toLowerCase().includes(query) ||
          perfSpec.toLowerCase().includes(query)
        );
      })
      .slice(0, 5);
  }, [debouncedQuery]);

  // Open dropdown when debounced query exists
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    const categoryVal = searchParams.get('category');
    const categoryQuery = categoryVal ? `&category=${categoryVal}` : '';
    if (searchQuery.trim()) {
      router.push(`/phones?q=${encodeURIComponent(searchQuery.trim())}${categoryQuery}`);
    } else {
      router.push(`/phones${categoryVal ? `?category=${categoryVal}` : ''}`);
    }
  };

  const handleSelectResult = (slug: string) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    router.push(`/phones/${slug}`);
  };

  const formatPrice = (p: number) => {
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
          <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-bold text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-all font-display">
            TS
            <span className="absolute -inset-0.5 rounded-lg bg-accent opacity-20 blur-sm group-hover:opacity-45 transition-opacity"></span>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-theme-primary group-hover:text-accent transition-colors font-display">
            TrueSpecs
          </span>
        </Link>

        {/* 2. Live Search Bar (Persistent across site) */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
          {showHeaderSearch && (
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (debouncedQuery.length > 0) setIsDropdownOpen(true);
                }}
                placeholder="Search products (e.g. iPhone, Snapdragon, OIS)..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-theme bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 text-xs transition-all shadow-sm font-sans"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary stroke-[1.8]" />
            </form>
          )}

          {/* Autocomplete Dropdown */}
          {showHeaderSearch && isDropdownOpen && (
            <div className="absolute top-12 left-0 right-0 z-50 rounded-2xl border border-theme bg-theme-elevated p-2 shadow-2xl animate-slide-up">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-theme-secondary">
                    Matching Products ({searchResults.length})
                  </div>
                  {searchResults.map((phone) => (
                    <button
                      key={phone.id}
                      onClick={() => handleSelectResult(phone.slug)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-theme-surface-hover transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-8 shrink-0 rounded bg-theme-surface p-1 flex items-center justify-center border border-theme">
                          <img
                            src={phone.images[0]}
                            alt={phone.model}
                            className="h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-theme-secondary block">
                            {phone.brand}
                          </span>
                          <span className="text-xs font-extrabold text-theme-primary truncate block group-hover:text-accent transition-colors font-display">
                            {phone.model}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-xs font-bold text-theme-primary block tabular-nums">
                          {formatPrice(phone.price.amazonPrice || phone.price.flipkartPrice)}
                        </span>
                        <span className="text-[10px] font-bold text-accent bg-accent-bg px-1.5 py-0.5 rounded-md border border-accent/20">
                          {phone.specsScore} Score
                        </span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
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

        {/* 3. Desktop Navigation Items (Icon + Label Pairs) */}
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

        {/* 5. Mobile Controls (Outside hamburger menu) */}
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
        <div className="md:hidden px-4 pb-2 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (debouncedQuery.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search products (e.g. 5G, Snapdragon)..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-theme bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 text-xs transition-all font-sans"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-secondary stroke-[1.8]" />
          </form>

          {/* Mobile Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-11 left-4 right-4 z-50 rounded-xl border border-theme bg-theme-elevated p-2 shadow-2xl animate-slide-up">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((phone) => (
                    <button
                      key={phone.id}
                      onClick={() => handleSelectResult(phone.slug)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-theme-surface-hover transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-6 shrink-0 rounded bg-theme-surface p-0.5 flex items-center justify-center border border-theme">
                          <img src={phone.images[0]} alt={phone.model} className="h-full object-contain" />
                        </div>
                        <span className="text-xs font-bold text-theme-primary truncate font-display">
                          {phone.brand} {phone.model}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-accent shrink-0 tabular-nums">
                        {formatPrice(phone.price.amazonPrice || phone.price.flipkartPrice)}
                      </span>
                    </button>
                  ))}
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
