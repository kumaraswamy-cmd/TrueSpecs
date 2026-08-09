'use client';

import React, { useState } from 'react';

export interface FilterState {
  brands: string[];
  priceRange: string;
  ram: number[];
  specsScore: number;
  only5G: boolean;
  cpuBrands?: string[];
  gpuTypes?: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalMatched: number;
  totalAvailable: number;
  onReset: () => void;
  category?: 'phone' | 'laptop';
  brandCounts?: Record<string, number>;
}

const PHONE_BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing', 'Poco', 'Motorola', 'Xiaomi'];
const LAPTOP_BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer'];

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ₹15,000', value: 'under-15k' },
  { label: '₹15,000 - ₹30,000', value: '15k-30k' },
  { label: '₹30,000 - ₹60,000', value: '30k-60k' },
  { label: '₹60,000 - ₹100,000', value: '60k-100k' },
  { label: 'Above ₹100,000', value: 'above-100k' },
];

const PHONE_RAM_OPTIONS = [4, 6, 8, 12, 16];
const LAPTOP_RAM_OPTIONS = [8, 16, 32];

const CPU_BRANDS = ['Intel', 'AMD', 'Apple'];
const GPU_TYPES = [
  { label: 'Integrated', value: 'integrated' },
  { label: 'Dedicated', value: 'dedicated' },
];

export default function FilterSidebar({
  filters,
  onChange,
  totalMatched,
  totalAvailable,
  onReset,
  category = 'phone',
  brandCounts = {},
}: FilterSidebarProps) {
  const isLaptop = category === 'laptop';
  const availableBrands = isLaptop ? LAPTOP_BRANDS : PHONE_BRANDS;
  const ramOptions = isLaptop ? LAPTOP_RAM_OPTIONS : PHONE_RAM_OPTIONS;

  // Accordion open/close state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brands: true,
    price: true,
    ram: true,
    score: true,
    cpu: true,
    gpu: true,
    connectivity: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const updatedBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter((b) => b !== brand);
    onChange({ ...filters, brands: updatedBrands });
  };

  const handleRamChange = (ramVal: number, checked: boolean) => {
    const updatedRam = checked
      ? [...filters.ram, ramVal]
      : filters.ram.filter((r) => r !== ramVal);
    onChange({ ...filters, ram: updatedRam });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priceRange: e.target.value });
  };

  const handleScoreChange = (score: number) => {
    onChange({ ...filters, specsScore: score });
  };

  const handle5GChange = (checked: boolean) => {
    onChange({ ...filters, only5G: checked });
  };

  const handleCpuBrandChange = (cpuBrand: string, checked: boolean) => {
    const currentCpuBrands = filters.cpuBrands || [];
    const updatedCpuBrands = checked
      ? [...currentCpuBrands, cpuBrand]
      : currentCpuBrands.filter((c) => c !== cpuBrand);
    onChange({ ...filters, cpuBrands: updatedCpuBrands });
  };

  const handleGpuTypeChange = (gpuType: string, checked: boolean) => {
    const currentGpuTypes = filters.gpuTypes || [];
    const updatedGpuTypes = checked
      ? [...currentGpuTypes, gpuType]
      : currentGpuTypes.filter((g) => g !== gpuType);
    onChange({ ...filters, gpuTypes: updatedGpuTypes });
  };

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.priceRange !== 'all' ||
    filters.ram.length > 0 ||
    filters.specsScore > 0 ||
    (!isLaptop && filters.only5G) ||
    (isLaptop &&
      ((filters.cpuBrands && filters.cpuBrands.length > 0) ||
        (filters.gpuTypes && filters.gpuTypes.length > 0)));

  return (
    <div className="w-full lg:w-64 flex-shrink-0 bg-theme-surface border border-theme rounded-2xl p-6 h-fit sticky top-24 shadow-sm transition-colors duration-200">
      {/* Active count & clear */}
      <div className="flex items-center justify-between border-b border-theme pb-4 mb-5">
        <div>
          <h3 className="text-sm font-bold text-theme-primary">Filters</h3>
          <p className="text-[11px] text-theme-secondary mt-0.5 font-semibold">
            Showing {totalMatched} of {totalAvailable} {isLaptop ? 'laptops' : 'phones'}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-accent hover:text-accent-hover font-bold transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {/* Brand Accordion */}
        <div className="border-b border-theme pb-4">
          <button
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>Brands</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.brands ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.brands && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mt-3 animate-slide-up">
              {availableBrands.map((brand) => {
                const count = brandCounts[brand] || 0;
                return (
                  <label key={brand} className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary cursor-pointer select-none">
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={(e) => handleBrandChange(brand, e.target.checked)}
                        className="h-4 w-4 rounded border-theme bg-theme-surface text-accent focus:ring-accent"
                      />
                      <span className="font-medium text-xs sm:text-sm">{brand}</span>
                    </span>
                    <span className="text-[10px] text-theme-secondary font-mono">({count})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Price Accordion */}
        <div className="border-b border-theme pb-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>Price Range</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.price && (
            <div className="mt-3 animate-slide-up">
              <select
                value={filters.priceRange}
                onChange={handlePriceChange}
                className="w-full h-10 px-3 rounded-lg border border-theme bg-theme-surface text-xs sm:text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
              >
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.value} value={pr.value}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* RAM Accordion */}
        <div className="border-b border-theme pb-4">
          <button
            onClick={() => toggleSection('ram')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>RAM</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.ram ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.ram && (
            <div className="flex flex-wrap gap-2 mt-3 animate-slide-up">
              {ramOptions.map((ramVal) => {
                const isSelected = filters.ram.includes(ramVal);
                return (
                  <button
                    key={ramVal}
                    type="button"
                    onClick={() => handleRamChange(ramVal, !isSelected)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-accent-bg text-accent'
                        : 'border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    {ramVal} GB
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Specs Score Accordion */}
        <div className="border-b border-theme pb-4">
          <button
            onClick={() => toggleSection('score')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>Min Specs Score</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.score ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.score && (
            <div className="grid grid-cols-4 gap-2 mt-3 animate-slide-up">
              {[0, 50, 75, 90].map((score) => {
                const isSelected = filters.specsScore === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleScoreChange(score)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-accent-bg text-accent'
                        : 'border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    {score === 0 ? 'Any' : `${score}+`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Laptop Specific CPU Accordion */}
        {isLaptop && (
          <div className="border-b border-theme pb-4">
            <button
              onClick={() => toggleSection('cpu')}
              className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
            >
              <span>CPU Brand</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-4 h-4 transition-transform duration-200 ${expandedSections.cpu ? 'rotate-180' : ''}`}
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            {expandedSections.cpu && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mt-3 animate-slide-up">
                {CPU_BRANDS.map((cpuBrand) => (
                  <label key={cpuBrand} className="flex items-center gap-2.5 text-sm text-theme-secondary hover:text-theme-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={(filters.cpuBrands || []).includes(cpuBrand)}
                      onChange={(e) => handleCpuBrandChange(cpuBrand, e.target.checked)}
                      className="h-4 w-4 rounded border-theme bg-theme-surface text-accent focus:ring-accent"
                    />
                    <span className="font-medium text-xs sm:text-sm">{cpuBrand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Laptop Specific GPU Accordion */}
        {isLaptop && (
          <div className="border-b border-theme pb-4">
            <button
              onClick={() => toggleSection('gpu')}
              className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
            >
              <span>GPU Type</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-4 h-4 transition-transform duration-200 ${expandedSections.gpu ? 'rotate-180' : ''}`}
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            {expandedSections.gpu && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mt-3 animate-slide-up">
                {GPU_TYPES.map((gpuType) => (
                  <label key={gpuType.value} className="flex items-center gap-2.5 text-sm text-theme-secondary hover:text-theme-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={(filters.gpuTypes || []).includes(gpuType.value)}
                      onChange={(e) => handleGpuTypeChange(gpuType.value, e.target.checked)}
                      className="h-4 w-4 rounded border-theme bg-theme-surface text-accent focus:ring-accent"
                    />
                    <span className="font-medium text-xs sm:text-sm">{gpuType.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5G Support Accordion (Phones only) */}
        {!isLaptop && (
          <div className="pb-2">
            <label className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary cursor-pointer select-none">
              <span className="font-bold text-xs sm:text-sm">5G Support Only</span>
              <input
                type="checkbox"
                checked={filters.only5G}
                onChange={(e) => handle5GChange(e.target.checked)}
                className="h-4 w-4 rounded border-theme bg-theme-surface text-accent focus:ring-accent"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
