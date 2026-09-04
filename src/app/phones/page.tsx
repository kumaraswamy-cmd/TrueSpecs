'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import PhoneCard from '@/components/PhoneCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import BrandLogo from '@/components/BrandLogo';
import { searchProducts, getAlternateCategoryCount } from '@/utils/search';
import { ArrowDownUp, Laptop, RotateCcw, Search, SlidersHorizontal, Smartphone, Sparkles, X } from 'lucide-react';

type SortOption = 'score-desc' | 'price-asc' | 'price-desc' | 'date-desc';
type Category = 'phone' | 'laptop';

const emptyFilters: FilterState = {
  brands: [],
  priceRange: 'all',
  ram: [],
  specsScore: 0,
  only5G: false,
  cpuBrands: [],
  gpuTypes: [],
};

function priceOf(product: Phone) {
  return product.price.amazonPrice || product.price.flipkartPrice || product.price.mrp;
}

function ListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'phone';
  const category: Category = categoryParam === 'laptop' ? 'laptop' : 'phone';

  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    setFilters(emptyFilters);
  }, [category]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const brandParam = searchParams.get('brand');

    const timer = setTimeout(() => {
      setSearchQuery(q);
      if (brandParam) {
        setFilters((prev) => ({
          ...prev,
          brands: [brandParam],
        }));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setSearchQuery('');
  };

  const removeBrandFilter = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b !== brand),
    }));
  };

  const removeRamFilter = (ram: number) => {
    setFilters((prev) => ({
      ...prev,
      ram: prev.ram.filter((r) => r !== ram),
    }));
  };

  // Step 1: Filter by category and intelligent search
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return (phonesData as Phone[]).filter((p) => (p.category || 'phone') === category);
    }
    return searchProducts(phonesData as Phone[], searchQuery, category);
  }, [searchQuery, category]);

  // Alternate category match check (e.g. searching 'MacBook' while on phone category)
  const alternateCategoryInfo = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return getAlternateCategoryCount(phonesData as Phone[], searchQuery, category);
  }, [searchQuery, category]);

  // Step 2: Apply sidebar filters on top of search results
  const filteredPhones = useMemo(() => {
    return searchedProducts.filter((phone) => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(phone.brand)) return false;

      // Price filter
      const price = priceOf(phone);
      if (filters.priceRange !== 'all') {
        if (filters.priceRange === 'under-15k' && price >= 15000) return false;
        if (filters.priceRange === '15k-30k' && (price < 15000 || price >= 30000)) return false;
        if (filters.priceRange === '30k-60k' && (price < 30000 || price >= 60000)) return false;
        if (filters.priceRange === '60k-100k' && (price < 60000 || price >= 100000)) return false;
        if (filters.priceRange === 'above-100k' && price < 100000) return false;
      }

      // RAM filter
      if (filters.ram.length > 0) {
        if (category === 'laptop') {
          if (!filters.ram.includes(phone.specs.performance?.ramSize)) return false;
        } else {
          const hasMatchingRam = (phone.specs.performance?.ram || []).some((r: number) => filters.ram.includes(r));
          if (!hasMatchingRam) return false;
        }
      }

      // Specs Score filter
      if (phone.specsScore < filters.specsScore) return false;

      // 5G filter (phones only)
      if (category === 'phone' && filters.only5G && !phone.specs.connectivity?.network5G) return false;

      // Laptop specific CPU & GPU filters
      if (category === 'laptop') {
        if (filters.cpuBrands && filters.cpuBrands.length > 0) {
          if (!filters.cpuBrands.includes(phone.specs.performance?.cpuBrand)) return false;
        }
        if (filters.gpuTypes && filters.gpuTypes.length > 0) {
          if (!filters.gpuTypes.includes(phone.specs.performance?.gpuType)) return false;
        }
      }

      return true;
    });
  }, [searchedProducts, filters, category]);

  // Step 3: Group variant representatives
  const groupedSortedPhones = useMemo(() => {
    const result: { product: Phone; configCount: number }[] = [];
    const groupMap = new Map<string, Phone[]>();

    filteredPhones.forEach((product) => {
      if (!product.variantGroupId) {
        result.push({ product, configCount: 1 });
        return;
      }

      if (!groupMap.has(product.variantGroupId)) {
        groupMap.set(product.variantGroupId, []);
      }
      groupMap.get(product.variantGroupId)!.push(product);
    });

    groupMap.forEach((groupProducts) => {
      const representative = groupProducts.reduce((best, current) => {
        return priceOf(current) < priceOf(best) ? current : best;
      }, groupProducts[0]);

      result.push({ product: representative, configCount: groupProducts.length });
    });

    return result.sort((a, b) => {
      const productA = a.product;
      const productB = b.product;
      const priceA = priceOf(productA);
      const priceB = priceOf(productB);

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'score-desc') return productB.specsScore - productA.specsScore;
      if (sortBy === 'date-desc') return new Date(productB.releaseDate).getTime() - new Date(productA.releaseDate).getTime();
      return 0;
    });
  }, [filteredPhones, sortBy]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const categoryList = (phonesData as Phone[]).filter((product) => (product.category || 'phone') === category);
    categoryList.forEach((product) => {
      counts[product.brand] = (counts[product.brand] || 0) + 1;
    });
    return counts;
  }, [category]);

  const totalAvailable = useMemo(() => {
    const list = (phonesData as Phone[]).filter((product) => (product.category || 'phone') === category);
    const seenGroups = new Set<string>();
    let uniqueCount = 0;

    list.forEach((product) => {
      if (!product.variantGroupId) {
        uniqueCount += 1;
        return;
      }

      if (!seenGroups.has(product.variantGroupId)) {
        seenGroups.add(product.variantGroupId);
        uniqueCount += 1;
      }
    });

    return uniqueCount;
  }, [category]);

  const activeFilterCount =
    filters.brands.length +
    filters.ram.length +
    (filters.priceRange !== 'all' ? 1 : 0) +
    (filters.specsScore > 0 ? 1 : 0) +
    (filters.only5G ? 1 : 0) +
    (filters.cpuBrands?.length || 0) +
    (filters.gpuTypes?.length || 0);

  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : category === 'laptop'
      ? 'Laptop Finder'
      : 'Phone Finder';

  return (
    <div className="space-y-6 py-2 animate-slide-up">
      {/* Header Bar */}
      <section className="rounded-xl border border-theme bg-theme-elevated p-4 sm:p-6 shadow-ts-shadow">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-accent-bg px-2.5 py-1 text-xs font-bold text-accent">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {groupedSortedPhones.length} of {totalAvailable} {category === 'laptop' ? 'laptops' : 'phones'} available
            </div>
            <h1 className="mt-2.5 text-2xl sm:text-3xl font-black tracking-tight text-theme-primary font-display">{pageTitle}</h1>
            <p className="mt-1 text-xs sm:text-sm text-theme-secondary">
              Search, filter, and compare devices by verified specs and benchmark ratings.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-theme bg-ts-secondary p-1 shrink-0">
            {(['phone', 'laptop'] as const).map((item) => {
              const Icon = item === 'phone' ? Smartphone : Laptop;
              const active = category === item;

              return (
                <Link
                  key={item}
                  href={`/phones?category=${item}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-xs font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--ts-card)' : 'transparent',
                    color: active ? (item === 'phone' ? 'var(--color-category-phone)' : 'var(--color-category-laptop)') : 'var(--ts-fg-muted)',
                    boxShadow: active ? 'var(--ts-shadow)' : 'none',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item === 'phone' ? 'Phones' : 'Laptops'}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search & Sort Controls Row */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={category === 'laptop' ? 'Search laptops by model, CPU (M4, Intel), GPU, RAM...' : 'Search phones by model, chipset (Snapdragon, Dimensity), RAM...'}
              className="h-11 w-full rounded-lg border border-theme bg-theme-surface pl-10 pr-9 text-xs sm:text-sm text-theme-primary outline-none transition-all placeholder:text-theme-secondary focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-theme-secondary transition-colors hover:bg-theme-surface-hover hover:text-theme-primary cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <label className="flex h-11 items-center gap-2 rounded-lg border border-theme bg-theme-surface px-3">
            <ArrowDownUp className="h-4 w-4 text-theme-secondary shrink-0" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="h-full bg-transparent text-xs font-bold text-theme-primary outline-none cursor-pointer"
            >
              <option value="score-desc">Best Specs Score</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="date-desc">Newest First</option>
            </select>
          </label>

          {/* Mobile Filter Sheet Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex h-11 items-center justify-center gap-2 rounded-lg border border-theme bg-theme-surface px-4 text-xs font-bold text-theme-primary hover:bg-theme-surface-hover transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Brand Logos Filter Strip */}
        <div className="mt-3.5 pt-3 border-t border-theme/60 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-theme-secondary tracking-wider shrink-0 mr-1">
            Top Brands:
          </span>
          {(category === 'laptop'
            ? ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft']
            : ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing', 'Xiaomi', 'Poco', 'Motorola', 'Realme', 'iQOO']
          ).map((b) => {
            const isSelected = filters.brands.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    brands: isSelected ? prev.brands.filter((item) => item !== b) : [...prev.brands, b],
                  }));
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white shadow-sm border border-accent'
                    : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary border border-theme'
                }`}
              >
                <BrandLogo brand={b} size="xs" />
                <span>{b}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cross-Category Recommendation Hint (e.g. When searching 'MacBook' while on phone category) */}
      {alternateCategoryInfo && alternateCategoryInfo.count > 0 && groupedSortedPhones.length === 0 && (
        <div className="rounded-xl border border-accent/30 bg-accent-bg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent shrink-0" />
            <div>
              <p className="text-xs font-bold text-theme-primary">
                Looking for {alternateCategoryInfo.category === 'laptop' ? 'laptops' : 'phones'}?
              </p>
              <p className="text-[11px] text-theme-secondary">
                We found <strong className="text-accent">{alternateCategoryInfo.count} matching {alternateCategoryInfo.category === 'laptop' ? 'laptops' : 'phones'}</strong> for &quot;{searchQuery}&quot;.
              </p>
            </div>
          </div>
          <Link
            href={`/phones?category=${alternateCategoryInfo.category}&q=${encodeURIComponent(searchQuery)}`}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shrink-0 text-center"
          >
            Switch to {alternateCategoryInfo.category === 'laptop' ? 'Laptops' : 'Phones'} ({alternateCategoryInfo.count})
          </Link>
        </div>
      )}

      {/* Main Grid: Filter Sidebar + Products */}
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          totalMatched={groupedSortedPhones.length}
          totalAvailable={totalAvailable}
          onReset={handleResetFilters}
          category={category}
          brandCounts={brandCounts}
          isMobileDrawerOpen={isMobileFilterOpen}
          onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
        />

        <div className="min-w-0 space-y-4">
          {/* Active Filter Chips with Individual 1-Click Removals */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-theme bg-theme-elevated p-3 text-xs text-theme-secondary shadow-ts-shadow">
              <span className="font-bold text-theme-primary mr-1">
                {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}:
              </span>

              {/* Brand Pills */}
              {filters.brands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ts-secondary border border-theme px-2.5 py-1 font-semibold text-theme-primary text-xs"
                >
                  <BrandLogo brand={brand} size="xs" />
                  <span>{brand}</span>
                  <button
                    type="button"
                    onClick={() => removeBrandFilter(brand)}
                    className="hover:text-danger cursor-pointer"
                    aria-label={`Remove brand filter ${brand}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Price Pill */}
              {filters.priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-ts-secondary border border-theme px-2.5 py-1 font-semibold text-theme-primary text-xs">
                  <span>Price: {filters.priceRange}</span>
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, priceRange: 'all' }))}
                    className="hover:text-danger cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* RAM Pills */}
              {filters.ram.map((ram) => (
                <span
                  key={ram}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ts-secondary border border-theme px-2.5 py-1 font-semibold text-theme-primary text-xs"
                >
                  <span>{ram}GB RAM</span>
                  <button
                    type="button"
                    onClick={() => removeRamFilter(ram)}
                    className="hover:text-danger cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Specs Score Pill */}
              {filters.specsScore > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-ts-secondary border border-theme px-2.5 py-1 font-semibold text-theme-primary text-xs">
                  <span>{filters.specsScore}+ SpecsScore</span>
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, specsScore: 0 }))}
                    className="hover:text-danger cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* 5G Pill */}
              {filters.only5G && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-ts-secondary border border-theme px-2.5 py-1 font-semibold text-theme-primary text-xs">
                  <span>5G Only</span>
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, only5G: false }))}
                    className="hover:text-danger cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 font-bold text-accent transition-colors hover:bg-accent-bg cursor-pointer text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Products Grid */}
          {groupedSortedPhones.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {groupedSortedPhones.map(({ product, configCount }) => (
                <PhoneCard key={product.id} phone={product} configCount={configCount} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-theme bg-theme-elevated px-6 py-16 text-center shadow-ts-shadow">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-theme bg-theme-surface text-theme-secondary">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-black text-theme-primary font-display">No matching products</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-theme-secondary">
                {searchQuery
                  ? `No ${category === 'laptop' ? 'laptops' : 'phones'} matched your search "${searchQuery}". Try a different keyword or reset active filters.`
                  : 'Try relaxing some filters to bring more devices back into view.'}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ts-primary px-5 text-xs font-bold text-white shadow-ts-shadow transition-all hover:bg-ts-primary-hover cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center bg-theme-app">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-theme border-t-accent" />
        </div>
      }
    >
      <ListingContent />
    </Suspense>
  );
}
