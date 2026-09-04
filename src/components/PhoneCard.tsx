'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Phone } from '@/types/phone';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';
import SpecsScoreGauge from './SpecsScoreGauge';
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

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
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
        { icon: Laptop, label: `${p.specs.performance.ramSize}GB RAM / ${p.specs.performance.storageCapacity}` },
        { icon: BatteryCharging, label: `${p.specs.battery.capacityWh} Wh battery` },
      ]
    : [
        { icon: Monitor, label: `${p.specs.display.size}" ${p.specs.display.type}` },
        { icon: Cpu, label: p.specs.performance.chipset },
        {
          icon: Smartphone,
          label: `${p.specs.performance.ram?.join('/')}GB RAM / ${p.specs.performance.storage?.join('/')}GB`,
        },
        { icon: BatteryCharging, label: `${p.specs.battery.capacity} mAh battery` },
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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-ts-border bg-ts-card shadow-ts-shadow transition-all duration-200 hover:-translate-y-0.5 hover:border-ts-border-strong hover:shadow-ts-shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-ts-border bg-ts-secondary">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--ts-primary),var(--ts-accent-2),var(--ts-accent-3))]" />
        <img
          src={p.images[0] || '/placeholder.png'}
          alt={p.model}
          className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              isLaptop
                ? 'border-ts-accent-2/25 bg-ts-accent-2-bg text-ts-accent-2'
                : 'border-accent/20 bg-accent-bg text-accent'
            }`}
          >
            {isLaptop ? <Laptop className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
            {isLaptop ? 'Laptop' : 'Phone'}
          </span>
          {configCount && configCount > 1 && (
            <span className="rounded-md border border-ts-border bg-ts-card/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ts-muted backdrop-blur">
              {configCount} configs
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
          aria-pressed={isLiked}
          aria-label={isLiked ? 'Remove from saved products' : 'Save product'}
          title={isLiked ? 'Remove from saved products' : 'Save product'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md border border-ts-border bg-ts-card/95 text-ts-muted shadow-ts-shadow transition-all hover:text-ts-wishlist"
          style={{
            backgroundColor: isLiked ? 'var(--ts-wishlist)' : undefined,
            color: isLiked ? '#fff' : undefined,
          }}
        >
          <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute bottom-3 right-3 rounded-lg border border-ts-border bg-ts-card/95 p-1 shadow-ts-shadow backdrop-blur">
          <SpecsScoreGauge score={p.specsScore} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ts-subtle">
                {p.brand}
              </p>
              <h3 className="mt-1 truncate font-display text-base font-extrabold leading-tight text-ts-fg">
                {p.model}
              </h3>
            </div>
            <span
              className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold ${
                isVerified
                  ? 'border-success-border bg-success-bg text-success'
                  : 'border-warning-border bg-warning-bg text-warning'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              {isVerified ? 'Verified' : 'Reviewing'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-ts-accent-3" aria-label={`${starRating} out of 5 rating`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="h-3.5 w-3.5" fill="currentColor" style={{ opacity: i < starRating ? 1 : 0.24 }} />
              ))}
            </div>
            <span className="rounded-md bg-ts-secondary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-ts-muted">
              {scoreLabel(p.specsScore)} score
            </span>
          </div>
        </div>

        {!compact && (
          <ul className="grid gap-2">
            {specsHighlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex min-w-0 items-center gap-2 text-xs leading-snug text-ts-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ts-secondary text-ts-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto space-y-3 border-t border-ts-border pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ts-subtle">Starts at</p>
              <p className="font-mono text-lg font-bold tabnum text-ts-fg">{formatPrice(price)}</p>
            </div>
            <p className="text-right text-[10px] font-semibold text-ts-muted">
              Updated specs, price, and variants
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCompareClick}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--color-accent-bg)' : 'var(--ts-secondary)',
                borderColor: isSelected ? 'var(--ts-primary)' : 'transparent',
                color: isSelected ? 'var(--ts-primary)' : 'var(--ts-fg-muted)',
              }}
            >
              {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              Compare
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/phones/${p.slug}`);
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-ts-primary px-3 text-xs font-bold text-white shadow-ts-shadow transition-all hover:bg-ts-primary-hover"
            >
              Details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
