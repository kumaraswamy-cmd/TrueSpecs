'use client';

import React, { useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

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
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

const PHONE_BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing', 'Poco', 'Motorola', 'Xiaomi', 'Realme', 'iQOO'];
const LAPTOP_BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'Razer'];

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ₹15,000', value: 'under-15k' },
  { label: '₹15,000 - ₹30,000', value: '15k-30k' },
  { label: '₹30,000 - ₹60,000', value: '30k-60k' },
  { label: '₹60,000 - ₹100,000', value: '60k-100k' },
  { label: 'Above ₹100,000', value: 'above-100k' },
];

const PHONE_RAM_OPTIONS = [4, 6, 8, 12, 16];
const LAPTOP_RAM_OPTIONS = [8, 16, 32, 64];

const CPU_BRANDS = ['Intel', 'AMD', 'Apple', 'Qualcomm'];
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
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
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

  const filterContent = (
    <div className="space-y-4 font-sans">
      {/* Active count & clear */}
      <div className="flex items-center justify-between border-b border-theme pb-4 mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-theme-primary font-display flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            Filters
          </h3>
          <p className="text-[11px] text-theme-secondary mt-0.5 font-semibold">
            {totalMatched} of {totalAvailable} {isLaptop ? 'laptops' : 'phones'}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-accent hover:text-accent-hover font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {/* Brand Accordion */}
        <div className="border-b border-theme pb-4">
          <button
            type="button"
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>Brands {filters.brands.length > 0 && `(${filters.brands.length})`}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.brands ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.brands && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 mt-3 animate-slide-up">
              {availableBrands.map((brand) => {
                const count = brandCounts[brand] || 0;
                const isChecked = filters.brands.includes(brand);
                return (
                  <label
                    key={brand}
                    className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg cursor-pointer select-none transition-colors ${
                      isChecked ? 'bg-accent-bg text-accent font-bold' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleBrandChange(brand, e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-theme text-accent focus:ring-accent"
                      />
                      <BrandLogo brand={brand} size="xs" />
                      <span>{brand}</span>
                    </span>
                    <span className="text-[10px] opacity-70 font-mono">({count})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Price Accordion */}
        <div className="border-b border-theme pb-4">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>Price Range</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.price && (
            <div className="mt-3 animate-slide-up">
              <select
                value={filters.priceRange}
                onChange={handlePriceChange}
                className="w-full h-10 px-3 rounded-lg border border-theme bg-theme-surface text-xs text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
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
            type="button"
            onClick={() => toggleSection('ram')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>RAM {filters.ram.length > 0 && `(${filters.ram.length})`}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.ram ? 'rotate-180' : ''}`}
            />
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
                        : 'border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
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
            type="button"
            onClick={() => toggleSection('score')}
            className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
          >
            <span>Min Specs Score {filters.specsScore > 0 && `(${filters.specsScore}+)`}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.score ? 'rotate-180' : ''}`}
            />
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
                        : 'border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
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
              type="button"
              onClick={() => toggleSection('cpu')}
              className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
            >
              <span>CPU Brand</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${expandedSections.cpu ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.cpu && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 mt-3 animate-slide-up">
                {CPU_BRANDS.map((cpuBrand) => (
                  <label key={cpuBrand} className="flex items-center gap-2 text-xs text-theme-secondary hover:text-theme-primary cursor-pointer select-none py-1">
                    <input
                      type="checkbox"
                      checked={(filters.cpuBrands || []).includes(cpuBrand)}
                      onChange={(e) => handleCpuBrandChange(cpuBrand, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <BrandLogo brand={cpuBrand} size="xs" />
                    <span className="font-medium">{cpuBrand}</span>
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
              type="button"
              onClick={() => toggleSection('gpu')}
              className="w-full flex items-center justify-between text-xs font-bold text-theme-secondary uppercase tracking-wider select-none cursor-pointer"
            >
              <span>GPU Type</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${expandedSections.gpu ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.gpu && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 mt-3 animate-slide-up">
                {GPU_TYPES.map((gpuType) => (
                  <label key={gpuType.value} className="flex items-center gap-2.5 text-xs text-theme-secondary hover:text-theme-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={(filters.gpuTypes || []).includes(gpuType.value)}
                      onChange={(e) => handleGpuTypeChange(gpuType.value, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="font-medium">{gpuType.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5G Support (Phones only) */}
        {!isLaptop && (
          <div className="pb-2">
            <label className="flex items-center justify-between text-xs text-theme-secondary hover:text-theme-primary cursor-pointer select-none">
              <span className="font-bold">5G Support Only</span>
              <input
                type="checkbox"
                checked={filters.only5G}
                onChange={(e) => handle5GChange(e.target.checked)}
                className="h-4 w-4 rounded border-theme text-accent focus:ring-accent"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-theme-surface border border-theme rounded-2xl p-5 h-fit sticky top-24 shadow-sm transition-colors duration-200">
        {filterContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileDrawer}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-theme-elevated p-5 shadow-2xl overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between border-b border-theme pb-3 mb-4">
              <span className="text-sm font-extrabold text-theme-primary font-display">Filters & Refinements</span>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filterContent}

            <div className="mt-6 pt-4 border-t border-theme sticky bottom-0 bg-theme-elevated">
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md shadow-accent/20 cursor-pointer"
              >
                Show {totalMatched} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
