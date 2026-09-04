'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import BrandLogo from '@/components/BrandLogo';
import { ArrowRight, ChevronDown, ChevronUp, Scale, Trash2, X } from 'lucide-react';

export default function CompareTray() {
  const pathname = usePathname();
  const { selectedIds, isMounted, removePhone, clearCompare } = useCompare();
  const [isMinimized, setIsMinimized] = useState(false);

  if (pathname === '/compare' || !isMounted || selectedIds.length === 0) return null;

  // Filter selected phones from the seed database
  const selectedPhones = (phonesData as Phone[]).filter((phone) =>
    selectedIds.includes(phone.id)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pb-3 pointer-events-auto">
        {/* Minimized Pill Mode (Especially useful on mobile screens) */}
        {isMinimized ? (
          <div className="flex justify-end">
            <button
              onClick={() => setIsMinimized(false)}
              className="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-theme-elevated/95 px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer text-theme-primary"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-white">
                {selectedIds.length}
              </div>
              <span className="text-xs font-bold font-display">Compare Selected</span>
              <ChevronUp className="h-4 w-4 text-accent" />
            </button>
          </div>
        ) : (
          /* Full Compare Tray Bar */
          <div className="rounded-2xl border border-theme bg-theme-elevated/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl animate-slide-up transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Left: Heading & Count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-bg text-accent font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-theme-primary font-display">Compare Tray</h4>
                      <span className="text-[10px] font-bold bg-accent-bg text-accent px-2 py-0.5 rounded-full border border-accent/20">
                        {selectedIds.length}/4
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-theme-secondary">
                      Side-by-side specs comparison ready
                    </p>
                  </div>
                </div>

                {/* Minimize Toggle (Mobile Only) */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
                  title="Minimize tray"
                  aria-label="Minimize compare tray"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Center: Selected Products Chips */}
              <div className="flex flex-wrap items-center gap-2 max-h-24 overflow-y-auto py-1">
                {selectedPhones.map((phone) => (
                  <div
                    key={phone.id}
                    className="group relative flex items-center gap-1.5 pl-2 pr-7 py-1.5 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover transition-colors"
                  >
                    <BrandLogo brand={phone.brand} size="xs" />
                    <span className="text-xs font-semibold text-theme-primary max-w-[120px] truncate">
                      {phone.model}
                    </span>
                    <button
                      onClick={() => removePhone(phone.id)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
                      title="Remove product"
                      aria-label={`Remove ${phone.model} from comparison`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {selectedIds.length > 0 && (
                  <button
                    onClick={clearCompare}
                    className="text-[11px] text-danger hover:text-danger/80 transition-colors font-bold px-2 py-1 rounded hover:bg-danger-bg flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="hidden md:flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-bold text-theme-secondary hover:text-theme-primary hover:bg-theme-surface transition-colors cursor-pointer"
                  title="Minimize tray"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Minimize</span>
                </button>

                <Link
                  href="/compare"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs shadow-md transition-all bg-accent hover:bg-accent-hover text-white shadow-accent/20 hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Compare Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
