'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import PhoneCard from '@/components/PhoneCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import { ArrowDownUp, Laptop, Search, SlidersHorizontal, Smartphone, X } from 'lucide-react';

type SortOption = 'price-asc' | 'price-desc' | 'score-desc' | 'date-desc';
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
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'phone';
  const category: Category = categoryParam === 'laptop' ? 'laptop' : 'phone';

  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');

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

  const filteredPhones = useMemo(() => {
    return (phonesData as Phone[]).filter((phone) => {
      if ((phone.category || 'phone') !== category) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          (category === 'laptop'
            ? phone.model.toLowerCase().includes(query) ||
              phone.brand.toLowerCase().includes(query) ||
              (phone.specs.performance?.cpuModel || '').toLowerCase().includes(query) ||
              (phone.specs.performance?.gpuModel || '').toLowerCase().includes(query) ||
              (phone.specs.display?.panelType || '').toLowerCase().includes(query)
            : phone.model.toLowerCase().includes(query) ||
              phone.brand.toLowerCase().includes(query) ||
              (phone.specs.performance?.chipset || '').toLowerCase().includes(query) ||
              (phone.specs.display?.type || '').toLowerCase().includes(query)) ||
          (phone.variantGroupId || '').toLowerCase().includes(query) ||
          (phone.variantLabel || '').toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      if (filters.brands.length > 0 && !filters.brands.includes(phone.brand)) return false;

      const price = priceOf(phone);
      if (filters.priceRange !== 'all') {
        if (filters.priceRange === 'under-15k' && price >= 15000) return false;
        if (filters.priceRange === '15k-30k' && (price < 15000 || price >= 30000)) return false;
        if (filters.priceRange === '30k-60k' && (price < 30000 || price >= 60000)) return false;
        if (filters.priceRange === '60k-100k' && (price < 60000 || price >= 100000)) return false;
        if (filters.priceRange === 'above-100k' && price < 100000) return false;
      }

      if (filters.ram.length > 0) {
        if (category === 'laptop') {
          if (!filters.ram.includes(phone.specs.performance?.ramSize)) return false;
        } else {
          const hasMatchingRam = (phone.specs.performance?.ram || []).some((ram: number) => filters.ram.includes(ram));
          if (!hasMatchingRam) return false;
        }
      }

      if (phone.specsScore < filters.specsScore) return false;
      if (category === 'phone' && filters.only5G && !phone.specs.connectivity?.network5G) return false;

      if (category === 'laptop' && filters.cpuBrands && filters.cpuBrands.length > 0) {
        if (!filters.cpuBrands.includes(phone.specs.performance?.cpuBrand)) return false;
      }

      if (category === 'laptop' && filters.gpuTypes && filters.gpuTypes.length > 0) {
        if (!filters.gpuTypes.includes(phone.specs.performance?.gpuType)) return false;
      }

      return true;
    });
  }, [filters, searchQuery, category]);

  const sortedPhones = useMemo(() => {
    return [...filteredPhones].sort((a, b) => {
      const priceA = priceOf(a);
      const priceB = priceOf(b);

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'score-desc') return b.specsScore - a.specsScore;
      if (sortBy === 'date-desc') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      return 0;
    });
  }, [filteredPhones, sortBy]);

  const groupedSortedPhones = useMemo(() => {
    const result: { product: Phone; configCount: number }[] = [];
    const groupMap = new Map<string, Phone[]>();

    sortedPhones.forEach((product) => {
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
  }, [sortedPhones, sortBy]);

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
    ? `Search results for "${searchQuery}"`
    : category === 'laptop'
      ? 'Laptop Finder'
      : 'Phone Finder';

  return (
    <div className="space-y-7 py-2 animate-slide-up">
      <section className="rounded-lg border border-theme bg-theme-elevated p-5 shadow-ts-shadow">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-accent-bg px-2.5 py-1 text-xs font-bold text-accent">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {groupedSortedPhones.length} of {totalAvailable} matches
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-theme-primary sm:text-4xl">{pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-secondary">
              Search, filter, and compare devices by the specs that actually change the buying decision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg border border-theme bg-ts-secondary p-1">
            {(['phone', 'laptop'] as const).map((item) => {
              const Icon = item === 'phone' ? Smartphone : Laptop;
              const active = category === item;

              return (
                <Link
                  key={item}
                  href={`/phones?category=${item}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-xs font-bold transition-all"
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

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={category === 'laptop' ? 'Search by model, CPU, GPU, display...' : 'Search by model, chipset, display, brand...'}
              className="h-11 w-full rounded-lg border border-theme bg-theme-surface px-10 text-sm text-theme-primary outline-none transition-all placeholder:text-theme-secondary focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-theme-secondary transition-colors hover:bg-theme-surface-hover hover:text-theme-primary"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <label className="flex h-11 items-center gap-2 rounded-lg border border-theme bg-theme-surface px-3">
            <ArrowDownUp className="h-4 w-4 text-theme-secondary" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="h-full bg-transparent text-xs font-bold text-theme-primary outline-none"
            >
              <option value="score-desc">Best Specs Score</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="date-desc">Newest First</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          totalMatched={groupedSortedPhones.length}
          totalAvailable={totalAvailable}
          onReset={handleResetFilters}
          category={category}
          brandCounts={brandCounts}
        />

        <div className="min-w-0 space-y-4">
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-theme bg-theme-elevated p-3 text-xs text-theme-secondary shadow-ts-shadow">
              <span className="font-bold text-theme-primary">{activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}</span>
              {filters.brands.map((brand) => (
                <span key={brand} className="rounded-md bg-ts-secondary px-2 py-1 font-semibold">{brand}</span>
              ))}
              {filters.priceRange !== 'all' && <span className="rounded-md bg-ts-secondary px-2 py-1 font-semibold">{filters.priceRange}</span>}
              {filters.ram.map((ram) => (
                <span key={ram} className="rounded-md bg-ts-secondary px-2 py-1 font-semibold">{ram}GB RAM</span>
              ))}
              {filters.specsScore > 0 && <span className="rounded-md bg-ts-secondary px-2 py-1 font-semibold">{filters.specsScore}+ score</span>}
              {filters.only5G && <span className="rounded-md bg-ts-secondary px-2 py-1 font-semibold">5G</span>}
              <button onClick={handleResetFilters} className="ml-auto rounded-md px-2 py-1 font-bold text-accent transition-colors hover:bg-accent-bg">
                Reset
              </button>
            </div>
          )}

          {groupedSortedPhones.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {groupedSortedPhones.map(({ product, configCount }) => (
                <PhoneCard key={product.id} phone={product} configCount={configCount} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-lg rounded-lg border border-dashed border-theme bg-theme-elevated px-6 py-16 text-center shadow-ts-shadow">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-theme bg-theme-surface text-theme-secondary">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-black text-theme-primary">No matching products</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-theme-secondary">
                Widen the filters or clear the search to bring more devices back into view.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-ts-primary px-4 text-xs font-bold text-white shadow-ts-shadow transition-all hover:bg-ts-primary-hover"
              >
                Reset Filters
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
