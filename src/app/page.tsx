'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import PhoneCard from '@/components/PhoneCard';
import { searchProducts } from '@/utils/search';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Laptop,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

type Category = 'phone' | 'laptop';

const CATEGORY_COPY: Record<Category, { label: string; placeholder: string; searches: string[]; brands: string[] }> = {
  phone: {
    label: 'Phones',
    placeholder: 'Search iPhone 16, Galaxy S25, Snapdragon 8 Gen 3, OLED...',
    searches: ['iPhone 16 Pro', 'Galaxy S25', 'Pixel 9 Pro', 'OnePlus 13', 'Nothing Phone'],
    brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing', 'Xiaomi', 'Motorola', 'Realme'],
  },
  laptop: {
    label: 'Laptops',
    placeholder: 'Search MacBook M4, Ryzen AI, OLED, RTX, 32GB RAM...',
    searches: ['MacBook M4', 'Dell XPS', 'ThinkPad', 'Zenbook OLED', 'Surface Laptop'],
    brands: ['Apple', 'Dell', 'Asus', 'Lenovo', 'HP', 'Microsoft', 'Razer', 'Acer'],
  },
};

function priceOf(product: Phone) {
  return product.price.amazonPrice || product.price.flipkartPrice || product.price.mrp;
}

function formatPrice(p?: number) {
  if (!p) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(p);
}

function featuredByCategory(category: Category) {
  const result: { product: Phone; configCount: number }[] = [];
  const groups = new Map<string, Phone[]>();

  (phonesData as Phone[])
    .filter((item) => (item.category || 'phone') === category)
    .sort((a, b) => b.specsScore - a.specsScore)
    .forEach((product) => {
      if (!product.variantGroupId) {
        result.push({ product, configCount: 1 });
        return;
      }

      if (!groups.has(product.variantGroupId)) {
        groups.set(product.variantGroupId, []);
      }
      groups.get(product.variantGroupId)!.push(product);
    });

  groups.forEach((groupProducts) => {
    const representative = groupProducts.reduce((best, current) => {
      return priceOf(current) < priceOf(best) ? current : best;
    }, groupProducts[0]);

    result.push({ product: representative, configCount: groupProducts.length });
  });

  return result.sort((a, b) => b.product.specsScore - a.product.specsScore);
}

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>('phone');
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [debouncedHeroQuery, setDebouncedHeroQuery] = useState('');
  const [isHeroDropdownOpen, setIsHeroDropdownOpen] = useState(false);
  const [heroSelectedIndex, setHeroSelectedIndex] = useState<number>(-1);

  const heroSearchRef = useRef<HTMLDivElement>(null);

  const featuredProducts = useMemo(() => featuredByCategory(activeCategory).slice(0, 6), [activeCategory]);
  const heroProducts = featuredProducts.slice(0, 3);
  const copy = CATEGORY_COPY[activeCategory];

  // Debounce hero search query (200ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedHeroQuery(heroSearchQuery.trim());
    }, 200);
    return () => clearTimeout(handler);
  }, [heroSearchQuery]);

  // Click outside to close hero search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (heroSearchRef.current && !heroSearchRef.current.contains(event.target as Node)) {
        setIsHeroDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hero search matching results
  const heroSearchResults = useMemo(() => {
    if (!debouncedHeroQuery) return [];
    return searchProducts(phonesData as Phone[], debouncedHeroQuery, activeCategory, 5);
  }, [debouncedHeroQuery, activeCategory]);

  useEffect(() => {
    if (debouncedHeroQuery.length > 0) {
      setIsHeroDropdownOpen(true);
      setHeroSelectedIndex(-1);
    } else {
      setIsHeroDropdownOpen(false);
    }
  }, [debouncedHeroQuery]);

  const handleHeroSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsHeroDropdownOpen(false);

    if (heroSelectedIndex >= 0 && heroSearchResults[heroSelectedIndex]) {
      router.push(`/phones/${heroSearchResults[heroSelectedIndex].slug}`);
      return;
    }

    if (heroSearchQuery.trim()) {
      router.push(`/phones?category=${activeCategory}&q=${encodeURIComponent(heroSearchQuery.trim())}`);
    } else {
      router.push(`/phones?category=${activeCategory}`);
    }
  };

  const handleHeroKeyDown = (e: React.KeyboardEvent) => {
    if (!isHeroDropdownOpen || heroSearchResults.length === 0) {
      if (e.key === 'Escape') setIsHeroDropdownOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHeroSelectedIndex((prev) => (prev < heroSearchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHeroSelectedIndex((prev) => (prev > 0 ? prev - 1 : heroSearchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleHeroSubmit();
    } else if (e.key === 'Escape') {
      setIsHeroDropdownOpen(false);
    }
  };

  const categoryCounts = useMemo(() => {
    return (phonesData as Phone[]).reduce(
      (acc, item) => {
        const category = (item.category || 'phone') as Category;
        acc[category] += 1;
        return acc;
      },
      { phone: 0, laptop: 0 }
    );
  }, []);

  return (
    <div className="min-h-screen space-y-10 pb-16 text-theme-primary">
      <section className="overflow-visible rounded-xl border border-theme bg-[var(--ts-hero-bg)] shadow-ts-shadow">
        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--ts-primary),var(--ts-accent-2),var(--ts-accent-3))]" />

          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-theme bg-theme-elevated px-3 py-1.5 text-xs font-bold text-theme-secondary shadow-ts-shadow">
              <Sparkles className="h-3.5 w-3.5 text-ts-accent-3" />
              Verified product intelligence
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl font-black leading-none tracking-tight text-[var(--ts-hero-ink)] sm:text-5xl lg:text-6xl">
                TrueSpecs
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-theme-secondary sm:text-base">
                Compare phones and laptops with clean specs, evidence-aware scores, live pricing, and side-by-side decisions that are easy to trust.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            {/* Live Autocomplete Hero Search Box */}
            <div ref={heroSearchRef} className="relative rounded-lg border border-theme bg-theme-elevated p-2 shadow-ts-shadow-md">
              <form onSubmit={handleHeroSubmit} className="grid gap-2 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                {/* Category Pill Switcher */}
                <div className="grid grid-cols-2 gap-1 rounded-md bg-ts-secondary p-1">
                  {(['phone', 'laptop'] as const).map((category) => {
                    const Icon = category === 'phone' ? Smartphone : Laptop;
                    const isActive = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setActiveCategory(category);
                          setIsHeroDropdownOpen(false);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-xs font-bold transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isActive ? 'var(--ts-card)' : 'transparent',
                          color: isActive
                            ? category === 'phone'
                              ? 'var(--color-category-phone)'
                              : 'var(--color-category-laptop)'
                            : 'var(--ts-fg-muted)',
                          boxShadow: isActive ? 'var(--ts-shadow)' : 'none',
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {CATEGORY_COPY[category].label}
                      </button>
                    );
                  })}
                </div>

                {/* Search input with live suggestion capability */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (debouncedHeroQuery.length > 0) setIsHeroDropdownOpen(true);
                    }}
                    onKeyDown={handleHeroKeyDown}
                    placeholder={copy.placeholder}
                    className="h-12 w-full rounded-lg border border-transparent bg-theme-surface pl-10 pr-9 text-sm text-theme-primary outline-none transition-all placeholder:text-theme-secondary focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
                  />
                  {heroSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeroSearchQuery('');
                        setIsHeroDropdownOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary p-0.5 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ts-primary px-5 text-sm font-bold text-white shadow-ts-shadow transition-all hover:bg-ts-primary-hover cursor-pointer"
                >
                  Find Matches
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Hero Live Autocomplete Dropdown */}
              {isHeroDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-xl border border-theme bg-theme-elevated p-2 shadow-2xl animate-slide-up max-h-[380px] overflow-y-auto">
                  {heroSearchResults.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-theme-secondary border-b border-theme/60">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-accent" />
                          Suggested {copy.label} ({heroSearchResults.length})
                        </span>
                        <span className="text-[9px] font-mono lowercase opacity-70">↑↓ to navigate, ↵ to select</span>
                      </div>
                      {heroSearchResults.map((product, idx) => {
                        const isSelected = idx === heroSelectedIndex;
                        const priceVal = priceOf(product);

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setIsHeroDropdownOpen(false);
                              router.push(`/phones/${product.slug}`);
                            }}
                            onMouseEnter={() => setHeroSelectedIndex(idx)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left group cursor-pointer ${
                              isSelected ? 'bg-accent/10 border border-accent/30' : 'hover:bg-theme-surface-hover border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-9 shrink-0 rounded bg-theme-surface p-1 flex items-center justify-center border border-theme">
                                <img
                                  src={product.images[0] || '/placeholder.png'}
                                  alt={product.model}
                                  className="h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-theme-secondary block">
                                  {product.brand}
                                </span>
                                <span className="text-xs font-extrabold text-theme-primary truncate block group-hover:text-accent transition-colors font-display">
                                  {product.model}
                                </span>
                                <span className="text-[10px] text-theme-secondary truncate block">
                                  {activeCategory === 'laptop'
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
                        onClick={() => handleHeroSubmit()}
                        className="w-full py-2 mt-1 text-center text-xs font-bold text-accent hover:bg-accent-bg rounded-lg transition-colors flex items-center justify-center gap-1 border-t border-theme cursor-pointer font-sans"
                      >
                        <span>View all results for &quot;{heroSearchQuery}&quot;</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-theme-secondary">
                      No {copy.label.toLowerCase()} found matching &quot;{heroSearchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/compare"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-theme bg-theme-elevated px-5 text-sm font-bold text-theme-primary shadow-ts-shadow transition-all hover:border-accent/40 hover:text-accent"
            >
              Compare Tool
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick searches */}
          <div className="mt-5 flex flex-wrap gap-2">
            {copy.searches.map((query) => (
              <Link
                key={query}
                href={`/phones?category=${activeCategory}&q=${encodeURIComponent(query)}`}
                className="rounded-md border border-theme bg-theme-elevated px-3 py-1.5 text-xs font-semibold text-theme-secondary transition-all hover:border-accent/40 hover:text-theme-primary"
              >
                {query}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {heroProducts.map(({ product, configCount }, index) => (
              <Link
                key={product.id}
                href={`/phones/${product.slug}`}
                className="group hover-lift grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-theme bg-theme-elevated p-3 shadow-sm hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center rounded-lg bg-ts-secondary p-2 overflow-hidden">
                  <img src={product.images[0]} alt={product.model} className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-theme-secondary">
                    <span>#{index + 1}</span>
                    <span>{configCount > 1 ? `${configCount} configs` : product.brand}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-extrabold text-theme-primary group-hover:text-accent transition-colors">{product.model}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-md bg-accent-bg px-2 py-1 font-mono text-[10px] font-bold text-accent border border-accent/20">
                      {product.specsScore}
                    </span>
                    <span className="truncate text-[11px] font-semibold text-theme-secondary">
                      from {formatPrice(priceOf(product))}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Products indexed', value: `${categoryCounts.phone + categoryCounts.laptop}`, icon: BadgeCheck },
          { label: 'Phone variants', value: `${categoryCounts.phone}`, icon: Smartphone },
          { label: 'Laptop variants', value: `${categoryCounts.laptop}`, icon: Laptop },
          { label: 'Score model', value: '5-axis', icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="hover-lift rounded-xl border border-theme bg-theme-elevated p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-theme-secondary">{label}</p>
              <Icon className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-2 sm:mt-3 font-mono text-xl sm:text-2xl font-black text-theme-primary">{value}</p>
          </div>
        ))}
      </section>

      {/* Top Ranked Products */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wide text-ts-accent-2">Ranked by Specs Score</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-theme-primary sm:text-3xl">
              Top {copy.label} Right Now
            </h2>
          </div>

          <Link
            href={`/phones?category=${activeCategory}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-theme bg-theme-elevated px-4 text-xs font-bold text-theme-primary shadow-ts-shadow transition-all hover:border-accent/40 hover:text-accent"
          >
            View All {copy.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map(({ product, configCount }) => (
            <PhoneCard key={product.id} phone={product} configCount={configCount} />
          ))}
        </div>
      </section>

      {/* Decision signals & Brands */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-theme bg-theme-elevated p-5 shadow-ts-shadow">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            <h2 className="text-lg font-black text-theme-primary">Decision Signals</h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Verified specs', value: 'Official and checked fields stay visibly separated from in-review fields.' },
              { label: 'Weighted scores', value: 'Performance, display, battery, build, and camera value are blended into one scan-ready score.' },
              { label: 'Store comparison', value: 'Amazon and Flipkart prices stay close to the decision point on product detail pages.' },
            ].map((item) => (
              <div key={item.label} className="border-l-2 border-ts-accent-2 pl-3">
                <h3 className="text-sm font-extrabold text-theme-primary">{item.label}</h3>
                <p className="mt-1 text-xs leading-5 text-theme-secondary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-theme bg-theme-elevated p-5 shadow-ts-shadow">
          <h2 className="text-lg font-black text-theme-primary">Browse Brands</h2>
          <p className="mt-1 text-xs text-theme-secondary">Jump straight into the makers people compare most.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.brands.map((brand) => (
              <Link
                key={brand}
                href={`/phones?category=${activeCategory}&brand=${brand}`}
                className="rounded-md border border-theme bg-theme-surface px-3 py-2 text-xs font-bold text-theme-secondary transition-all hover:border-accent/40 hover:text-theme-primary"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
