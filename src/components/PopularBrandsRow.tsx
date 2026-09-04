'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

interface PopularBrandsRowProps {
  category?: 'phone' | 'laptop';
  selectedBrand?: string | null;
  onSelectBrand?: (brand: string) => void;
  title?: string;
  className?: string;
}

const POPULAR_PHONE_BRANDS = [
  'Vivo',
  'Samsung',
  'Motorola',
  'Realme',
  'OPPO',
  'Xiaomi',
  'Poco',
  'OnePlus',
  'Apple',
  'iQOO',
];

const POPULAR_LAPTOP_BRANDS = [
  'Apple',
  'Dell',
  'HP',
  'Lenovo',
  'Asus',
  'Acer',
  'Microsoft',
  'Razer',
];

export default function PopularBrandsRow({
  category = 'phone',
  selectedBrand,
  onSelectBrand,
  title = 'Popular Brands',
  className = '',
}: PopularBrandsRowProps) {
  const brands = category === 'laptop' ? POPULAR_LAPTOP_BRANDS : POPULAR_PHONE_BRANDS;

  return (
    <div className={`w-full rounded-2xl border border-theme bg-theme-surface p-4 sm:p-5 shadow-xs ${className}`}>
      {title && (
        <h3 className="text-base sm:text-lg font-black text-theme-primary font-display mb-4">
          {title}
        </h3>
      )}

      {/* Horizontal Scrollable Row of Circular Brand Avatars */}
      <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand;

          const content = (
            <div className="group flex flex-col items-center gap-2 shrink-0 cursor-pointer select-none">
              {/* Circular Avatar */}
              <div
                className={`relative rounded-full p-1 transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${
                  isSelected
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-theme-surface shadow-md'
                    : 'group-hover:shadow-md'
                }`}
              >
                <BrandLogo brand={brand} size="xl" className="shadow-xs" />
              </div>

              {/* Brand Name Below */}
              <span
                className={`text-xs font-bold transition-colors ${
                  isSelected
                    ? 'text-accent font-black'
                    : 'text-theme-primary group-hover:text-accent'
                }`}
              >
                {brand}
              </span>
            </div>
          );

          if (onSelectBrand) {
            return (
              <button
                key={brand}
                type="button"
                onClick={() => onSelectBrand(brand)}
                className="bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={brand}
              href={`/phones?category=${category}&brand=${encodeURIComponent(brand)}`}
              className="focus:outline-none"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
