'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone } from '@/types/phone';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';
import SpecsScoreGauge from './SpecsScoreGauge';
import BrandLogo from '@/components/BrandLogo';
import {
  BatteryCharging,
  Check,
  ChevronRight,
  Cpu,
  Heart,
  Laptop,
  Monitor,
  Plus,
  ShieldCheck,
  Smartphone,
  Star,
} from 'lucide-react';

interface PhoneCardProps {
  phone: Phone;
  configCount?: number;
  compact?: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Elite';
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Balanced';
  return 'Entry';
}

export default function PhoneCard({ phone: p, configCount, compact = false }: PhoneCardProps) {
  const router = useRouter();
  const { selectedIds, addPhone, removePhone } = useCompare();
  const { wishlistIds, toggleWishlist } = useWishlist();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isSelected = mounted && selectedIds.includes(p.id);
  const isLiked = mounted && wishlistIds.includes(p.id);
  const isLaptop = p.category === 'laptop';
  const price = p.price.amazonPrice || p.price.flipkartPrice || p.price.mrp;
  const isVerified = !p.dataCompleteness?.unverifiedFields || p.dataCompleteness.unverifiedFields.length === 0;
  const starRating = Math.round((p.specsScore || 0) / 20);

  const specsHighlights = isLaptop
    ? [
        { icon: Monitor, label: `${p.specs.display.size}" ${p.specs.display.panelType}` },
        { icon: Cpu, label: `${p.specs.performance.cpuBrand} ${p.specs.performance.cpuModel}` },
        { icon: Laptop, label: `${p.specs.performance.ramSize}GB / ${p.specs.performance.storageCapacity}` },
        { icon: BatteryCharging, label: `${p.specs.battery.capacityWh} Wh battery` },
      ]
    : [
        { icon: Monitor, label: `${p.specs.display.size}" ${p.specs.display.type}` },
        { icon: Cpu, label: p.specs.performance.chipset },
        {
          icon: Smartphone,
          label: `${p.specs.performance.ram?.slice(0, 2).join('/')}GB / ${p.specs.performance.storage?.slice(0, 2).join('/')}GB`,
        },
        { icon: BatteryCharging, label: `${p.specs.battery.capacity} mAh` },
      ];

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) {
      removePhone(p.id);
      return;
    }

    if (selectedIds.length < 4) {
      addPhone(p.id);
    } else {
      alert('You can compare at most 4 products side-by-side.');
    }
  };

  return (
    <article
      onClick={() => router.push(`/phones/${p.slug}`)}
      className="group hover-lift flex h-full cursor-pointer flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-theme bg-theme-surface shadow-sm hover:border-accent/40 hover:shadow-md"
    >
      {/* Product Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-theme bg-ts-secondary">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--ts-primary),var(--ts-accent-2),var(--ts-accent-3))]" />
        <img
          src={p.images[0] || '/placeholder.png'}
          alt={p.model}
          className="h-full w-full object-contain p-4 sm:p-6 transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Category & Config Badges */}
        <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 flex flex-wrap gap-1">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${
              isLaptop
                ? 'border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                : 'border-accent/20 bg-accent-bg text-accent'
            }`}
          >
            {isLaptop ? <Laptop className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Smartphone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            {isLaptop ? 'Laptop' : 'Phone'}
          </span>
          {configCount && configCount > 1 && (
            <span className="rounded-md border border-theme bg-theme-elevated/90 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-theme-secondary backdrop-blur">
              {configCount} configs
            </span>
          )}
        </div>

        {/* Wishlist Heart Button with Micro-pop */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
          aria-pressed={isLiked}
          aria-label={isLiked ? 'Remove from saved products' : 'Save product'}
          title={isLiked ? 'Remove from saved products' : 'Save product'}
          className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-theme bg-theme-elevated/95 text-theme-secondary shadow-sm hover:scale-110 active:scale-90 transition-all hover:text-rose-500 cursor-pointer"
          style={{
            backgroundColor: isLiked ? 'rgba(244, 63, 94, 0.15)' : undefined,
            borderColor: isLiked ? 'rgba(244, 63, 94, 0.3)' : undefined,
            color: isLiked ? '#f43f5e' : undefined,
          }}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLiked ? 'animate-heart-click' : ''}`} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* Specs Score Gauge */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 rounded-lg border border-theme bg-theme-elevated/95 p-0.5 sm:p-1 shadow-sm backdrop-blur">
          <SpecsScoreGauge score={p.specsScore} size="sm" />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3.5 sm:p-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <BrandLogo brand={p.brand} size="xs" />
                <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-theme-secondary">
                  {p.brand}
                </p>
              </div>
              <h3 className="mt-0.5 truncate font-display text-sm sm:text-base font-extrabold leading-tight text-theme-primary">
                {p.model}
              </h3>
            </div>
            <span
              className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] font-bold ${
                isVerified
                  ? 'border-success-border bg-success-bg text-success'
                  : 'border-warning-border bg-warning-bg text-warning'
              }`}
            >
              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {isVerified ? 'Verified' : 'Reviewing'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${starRating} out of 5 rating`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" style={{ opacity: i < starRating ? 1 : 0.24 }} />
              ))}
            </div>
            <span className="rounded-md bg-ts-secondary px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-theme-secondary">
              {scoreLabel(p.specsScore)} score
            </span>
          </div>
        </div>

        {/* Specs Highlights (2-column compact on mobile) */}
        {!compact && (
          <ul className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {specsHighlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex min-w-0 items-center gap-1.5 text-[11px] sm:text-xs leading-tight text-theme-secondary">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md bg-ts-secondary text-theme-primary">
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
                <span className="truncate font-medium">{label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Card Footer: Price & Buttons */}
        <div className="mt-auto space-y-2.5 sm:space-y-3 border-t border-theme pt-3 sm:pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-theme-secondary">Starts at</p>
              <p className="font-mono text-base sm:text-lg font-extrabold tabular-nums text-theme-primary">{formatPrice(price)}</p>
            </div>
            <p className="text-right text-[9px] sm:text-[10px] font-semibold text-theme-secondary">
              Live Verified
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCompareClick}
              className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? 'var(--color-accent-bg)' : 'var(--ts-secondary)',
                borderColor: isSelected ? 'var(--ts-primary)' : 'transparent',
                color: isSelected ? 'var(--ts-primary)' : 'var(--ts-fg-muted)',
              }}
            >
              {isSelected ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              <span>{isSelected ? 'Added' : 'Compare'}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/phones/${p.slug}`);
              }}
              className="inline-flex h-9 sm:h-10 items-center justify-center gap-1 rounded-lg bg-ts-primary px-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-ts-primary-hover cursor-pointer"
            >
              <span>Details</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
