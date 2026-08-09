'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import PhoneCard from '@/components/PhoneCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';

type SortOption = 'price-asc' | 'price-desc' | 'score-desc' | 'date-desc';

function ListingContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'phone';
  const category = categoryParam === 'laptop' ? 'laptop' : 'phone';

  // Initial Filter State
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    priceRange: 'all',
    ram: [],
    specsScore: 0,
    only5G: false,
    cpuBrands: [],
    gpuTypes: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');

  // Reset filters when category changes
  useEffect(() => {
    setFilters({
      brands: [],
      priceRange: 'all',
      ram: [],
      specsScore: 0,
      only5G: false,
      cpuBrands: [],
      gpuTypes: [],
    });
  }, [category]);

  // Load initial filters from URL query parameters
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

  // Handle filter resets
  const handleResetFilters = () => {
    setFilters({
      brands: [],
      priceRange: 'all',
      ram: [],
      specsScore: 0,
      only5G: false,
      cpuBrands: [],
      gpuTypes: [],
    });
    setSearchQuery('');
  };

  // Main Filtering Logic
  const filteredPhones = useMemo(() => {
    return (phonesData as Phone[]).filter((phone) => {
      // 0. Category Match
      if ((phone.category || 'phone') !== category) return false;

      // 1. Search Query Match (Model, Brand, Chipset, Storage, etc.)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery = (category === 'laptop' ? (
          phone.model.toLowerCase().includes(query) ||
          phone.brand.toLowerCase().includes(query) ||
          (phone.specs.performance?.cpuModel || '').toLowerCase().includes(query) ||
          (phone.specs.performance?.gpuModel || '').toLowerCase().includes(query) ||
          (phone.specs.display?.panelType || '').toLowerCase().includes(query)
        ) : (
          phone.model.toLowerCase().includes(query) ||
          phone.brand.toLowerCase().includes(query) ||
          (phone.specs.performance?.chipset || '').toLowerCase().includes(query) ||
          (phone.specs.display?.type || '').toLowerCase().includes(query)
        )) ||
        (phone.variantGroupId || '').toLowerCase().includes(query) ||
        (phone.variantLabel || '').toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Brand Match
      if (filters.brands.length > 0) {
        if (!filters.brands.includes(phone.brand)) return false;
      }

      // 3. Price Range Match
      const price = phone.price.amazonPrice || phone.price.flipkartPrice;
      if (filters.priceRange !== 'all') {
        if (filters.priceRange === 'under-15k' && price >= 15000) return false;
        if (filters.priceRange === '15k-30k' && (price < 15000 || price >= 30000)) return false;
        if (filters.priceRange === '30k-60k' && (price < 30000 || price >= 60000)) return false;
        if (filters.priceRange === '60k-100k' && (price < 60000 || price >= 100000)) return false;
        if (filters.priceRange === 'above-100k' && price < 100000) return false;
      }

      // 4. RAM Match
      if (filters.ram.length > 0) {
        if (category === 'laptop') {
          if (!filters.ram.includes(phone.specs.performance?.ramSize)) return false;
        } else {
          const hasMatchingRam = (phone.specs.performance?.ram || []).some((r: number) =>
            filters.ram.includes(r)
          );
          if (!hasMatchingRam) return false;
        }
      }

      // 5. Specs Score Match
      if (phone.specsScore < filters.specsScore) return false;

      // 6. 5G Match (Phones only)
      if (category === 'phone' && filters.only5G && !phone.specs.connectivity?.network5G) return false;

      // 7. Laptop CPU Brand Match
      if (category === 'laptop' && filters.cpuBrands && filters.cpuBrands.length > 0) {
        if (!filters.cpuBrands.includes(phone.specs.performance?.cpuBrand)) return false;
      }

      // 8. Laptop GPU Type Match
      if (category === 'laptop' && filters.gpuTypes && filters.gpuTypes.length > 0) {
        if (!filters.gpuTypes.includes(phone.specs.performance?.gpuType)) return false;
      }

      return true;
    });
  }, [filters, searchQuery, category]);

  // Main Sorting Logic
  const sortedPhones = useMemo(() => {
    return [...filteredPhones].sort((a, b) => {
      const priceA = a.price.amazonPrice || a.price.flipkartPrice;
      const priceB = b.price.amazonPrice || b.price.flipkartPrice;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'score-desc') return b.specsScore - a.specsScore;
      if (sortBy === 'date-desc') {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      return 0;
    });
  }, [filteredPhones, sortBy]);

  // Group variants together by default: show ONE card per variantGroupId
  const groupedSortedPhones = useMemo(() => {
    const result: { product: Phone; configCount: number }[] = [];
    const groupMap = new Map<string, Phone[]>();

    sortedPhones.forEach((p) => {
      if (p.variantGroupId) {
        if (!groupMap.has(p.variantGroupId)) {
          groupMap.set(p.variantGroupId, []);
        }
        groupMap.get(p.variantGroupId)!.push(p);
      } else {
        result.push({ product: p, configCount: 1 });
      }
    });

    groupMap.forEach((groupProducts) => {
      // Find the lowest-priced variant as representative
      const representative = groupProducts.reduce((min, curr) => {
        const minPrice = min.price.amazonPrice || min.price.flipkartPrice || Infinity;
        const currPrice = curr.price.amazonPrice || curr.price.flipkartPrice || Infinity;
        return currPrice < minPrice ? curr : min;
      }, groupProducts[0]);

      result.push({
        product: representative,
        configCount: groupProducts.length,
      });
    });

    // Re-sort the final grouped array based on the sorting settings
    return result.sort((a, b) => {
      const pA = a.product;
      const pB = b.product;
      
      const priceA = pA.price.amazonPrice || pA.price.flipkartPrice;
      const priceB = pB.price.amazonPrice || pB.price.flipkartPrice;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'score-desc') return pB.specsScore - pA.specsScore;
      if (sortBy === 'date-desc') {
        return new Date(pB.releaseDate).getTime() - new Date(pA.releaseDate).getTime();
      }
      return 0;
    });
  }, [sortedPhones, sortBy]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const categoryList = (phonesData as Phone[]).filter(p => (p.category || 'phone') === category);
    categoryList.forEach(p => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [category]);

  const totalAvailable = useMemo(() => {
    const list = (phonesData as Phone[]).filter(p => (p.category || 'phone') === category);
    // Count unique products (grouped by variantGroupId)
    const seenGroups = new Set<string>();
    let uniqueCount = 0;
    list.forEach(p => {
      if (p.variantGroupId) {
        if (!seenGroups.has(p.variantGroupId)) {
          seenGroups.add(p.variantGroupId);
          uniqueCount++;
        }
      } else {
        uniqueCount++;
      }
    });
    return uniqueCount;
  }, [category]);

  return (
    <div className="space-y-10">
      {/* Search status header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight font-display">
            {searchQuery ? `Search Results for &quot;${searchQuery}&quot;` : category === 'laptop' ? 'All Laptops' : 'All Phones'}
          </h1>
          <p className="text-xs text-theme-secondary mt-1.5 font-bold">
            {groupedSortedPhones.length} {category === 'laptop' ? 'Laptops' : 'Phones'} found
          </p>
        </div>

        {/* Sort drop down */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-theme-secondary font-bold whitespace-nowrap">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 rounded-lg border border-theme bg-theme-surface text-xs text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="score-desc">Relevance</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="score-desc">Specs Score</option>
          </select>
        </div>
      </div>

      {/* Main split grid */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar Filters */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          totalMatched={groupedSortedPhones.length}
          totalAvailable={totalAvailable}
          onReset={handleResetFilters}
          category={category}
          brandCounts={brandCounts}
        />

        {/* Grid results */}
        <div className="flex-1 w-full">
          {groupedSortedPhones.length > 0 ? (
            <div className="flex flex-col gap-6 animate-slide-up">
              {groupedSortedPhones.map(({ product, configCount }) => (
                <PhoneCard key={product.id} phone={product} configCount={configCount} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="rounded-xl border border-dashed border-theme bg-theme-surface/50 py-20 px-6 text-center space-y-4 max-w-lg mx-auto">
              <div className="h-12 w-12 rounded-full bg-theme-surface border border-theme text-theme-secondary flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
               </div>
              <h3 className="text-sm font-extrabold text-theme-primary font-display">No Match Found</h3>
              <p className="text-xs text-theme-secondary max-w-sm mx-auto leading-relaxed font-normal">
                No products match your current filter combination
                {filters.brands.length > 0 && ` [Brands: ${filters.brands.join(', ')}]`}
                {filters.priceRange !== 'all' && ` [Price: ${filters.priceRange}]`}
                {filters.ram.length > 0 && ` [RAM: ${filters.ram.join(', ')}GB]`}
                {filters.specsScore > 0 && ` [Score: ${filters.specsScore}+]`}
                {filters.only5G && ` [5G Only]`}. Try widening your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-theme-surface border border-theme text-theme-primary hover:bg-theme-surface-hover hover:border-accent/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Reset All Filters
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
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-theme-app">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
      </div>
    }>
      <ListingContent />
    </Suspense>
  );
}
