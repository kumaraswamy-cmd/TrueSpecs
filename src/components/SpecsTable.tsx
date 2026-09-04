/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo } from 'react';
import { Phone } from '@/types/phone';
import { useCompare } from '@/context/CompareContext';
import {
  BatteryCharging,
  Camera,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Layers,
  Monitor,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import SpecsScoreDial from '@/components/SpecsScoreDial';

interface SpecsTableProps {
  phones: Phone[];
  highlightDifferences?: boolean;
  showEmptySlots?: boolean;
  remainingPhones?: Phone[];
}

type CompareDirection = 'higher-is-better' | 'lower-is-better' | 'neutral';

interface SpecRow {
  label: string;
  fieldKey: string;
  compareDirection?: CompareDirection;
  getNumericValue?: (phone: Phone) => number | null;
  getValue: (phone: Phone) => any;
  formatValue: (val: any) => string;
}

interface SpecSection {
  title: string;
  sectionKey: string;
  icon: React.ElementType;
  description?: string;
  rows: SpecRow[];
}

const parseResolutionPixels = (resStr: string): number | null => {
  if (!resStr) return null;
  const match = resStr.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (match) {
    const w = parseInt(match[1], 10);
    const h = parseInt(match[2], 10);
    return w * h;
  }
  return null;
};

const parseMp = (cam: unknown): number | null => {
  if (Array.isArray(cam) && cam.length > 0) {
    return (cam[0] as { megapixel?: number })?.megapixel || null;
  }
  if (typeof cam === 'string') {
    const match = cam.match(/(\d+)\s*MP/i);
    if (match) return parseInt(match[1], 10);
  }
  return null;
};

const parseBluetooth = (bt: string): number | null => {
  if (!bt) return null;
  const match = bt.match(/(\d+(?:\.\d+)?)/);
  if (match) return parseFloat(match[1]);
  return null;
};

const PHONE_SPEC_SECTIONS: SpecSection[] = [
  {
    title: 'Display & Screen',
    sectionKey: 'display',
    icon: Monitor,
    description: 'Panel tech, peak brightness, resolution, and refresh rate.',
    rows: [
      {
        label: 'Screen Size',
        fieldKey: 'display.size',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.size,
        getValue: (p) => p.specs.display.size,
        formatValue: (v) => `${v} inches`,
      },
      {
        label: 'Resolution',
        fieldKey: 'display.resolution',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseResolutionPixels(p.specs.display.resolution),
        getValue: (p) => p.specs.display.resolution,
        formatValue: (v) => v,
      },
      {
        label: 'Panel Type',
        fieldKey: 'display.type',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.display.type,
        formatValue: (v) => v,
      },
      {
        label: 'Refresh Rate',
        fieldKey: 'display.refreshRate',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.refreshRate,
        getValue: (p) => p.specs.display.refreshRate,
        formatValue: (v) => `${v} Hz`,
      },
      {
        label: 'Peak Brightness',
        fieldKey: 'display.peakBrightness',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.peakBrightness,
        getValue: (p) => p.specs.display.peakBrightness,
        formatValue: (v) => `${v} nits`,
      },
      {
        label: 'HDR Support',
        fieldKey: 'display.hdrSupport',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.display.hdrSupport,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
      {
        label: 'Widevine Level',
        fieldKey: 'display.widevineLevel',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.display.widevineLevel,
        formatValue: (v) => v || 'N/A',
      },
    ],
  },
  {
    title: 'Performance & Hardware',
    sectionKey: 'performance',
    icon: Cpu,
    description: 'Processor, GPU, RAM speeds, thermal design, and storage tiers.',
    rows: [
      {
        label: 'Processor (Chipset)',
        fieldKey: 'performance.chipset',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.chipset,
        formatValue: (v) => v,
      },
      {
        label: 'RAM Options',
        fieldKey: 'performance.ram',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => Math.max(...p.specs.performance.ram),
        getValue: (p) => p.specs.performance.ram,
        formatValue: (v) => v.map((x: number) => `${x}GB`).join(' / '),
      },
      {
        label: 'Storage Options',
        fieldKey: 'performance.storage',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => Math.max(...p.specs.performance.storage),
        getValue: (p) => p.specs.performance.storage,
        formatValue: (v) => v.map((x: number) => `${x}GB`).join(' / '),
      },
      {
        label: 'Storage Type',
        fieldKey: 'performance.storageType',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.storageType,
        formatValue: (v) => v,
      },
      {
        label: 'AnTuTu Score',
        fieldKey: 'performance.antutuScore',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.antutuScore,
        getValue: (p) => p.specs.performance.antutuScore,
        formatValue: (v) => (v ? v.toLocaleString() : 'N/A'),
      },
      {
        label: 'Geekbench Single-Core',
        fieldKey: 'performance.geekbenchSingle',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.geekbenchSingle,
        getValue: (p) => p.specs.performance.geekbenchSingle,
        formatValue: (v) => (v ? v.toLocaleString() : 'N/A'),
      },
      {
        label: 'Geekbench Multi-Core',
        fieldKey: 'performance.geekbenchMulti',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.geekbenchMulti,
        getValue: (p) => p.specs.performance.geekbenchMulti,
        formatValue: (v) => (v ? v.toLocaleString() : 'N/A'),
      },
      {
        label: 'Sustained Performance (Throttle)',
        fieldKey: 'performance.throttlingPercent',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.throttlingPercent,
        getValue: (p) => p.specs.performance.throttlingPercent,
        formatValue: (v) => (v ? `${v}% Stability` : 'N/A'),
      },
    ],
  },
  {
    title: 'Camera System',
    sectionKey: 'camera',
    icon: Camera,
    description: 'Main sensor, OIS, video recording capabilities, and selfie specs.',
    rows: [
      {
        label: 'Main Camera MP',
        fieldKey: 'camera.rear',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseMp(p.specs.camera.rear),
        getValue: (p) => p.specs.camera.rear,
        formatValue: (v) => {
          if (Array.isArray(v)) {
            return v.map((cam: any) => `${cam.megapixel}MP (${cam.type || 'Main'}, f/${cam.aperture || '1.8'})`).join(' + ');
          }
          return typeof v === 'string' ? v : 'N/A';
        },
      },
      {
        label: 'Optical Image Stabilization (OIS)',
        fieldKey: 'camera.ois',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.camera.ois,
        formatValue: (v) => (v ? 'Yes (Hardware OIS)' : 'No'),
      },
      {
        label: 'Front (Selfie) Camera',
        fieldKey: 'camera.front',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseMp(p.specs.camera.front),
        getValue: (p) => p.specs.camera.front,
        formatValue: (v) => {
          if (typeof v === 'object' && v !== null && 'megapixel' in v) {
            return `${(v as any).megapixel}MP`;
          }
          return typeof v === 'string' ? v : 'N/A';
        },
      },
      {
        label: 'Max Video Recording',
        fieldKey: 'camera.videoResolution',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.camera.videoResolution,
        formatValue: (v) => v || '4K @ 60fps',
      },
    ],
  },
  {
    title: 'Battery & Charging',
    sectionKey: 'battery',
    icon: BatteryCharging,
    description: 'Battery capacity, wired charging speed, wireless charging, and endurance.',
    rows: [
      {
        label: 'Battery Capacity',
        fieldKey: 'battery.capacity',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.battery.capacity,
        getValue: (p) => p.specs.battery.capacity,
        formatValue: (v) => `${v} mAh`,
      },
      {
        label: 'Charging Speed (W)',
        fieldKey: 'battery.chargingSpeed',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.battery.chargingSpeed,
        getValue: (p) => p.specs.battery.chargingSpeed,
        formatValue: (v) => `${v}W Fast Charging`,
      },
      {
        label: 'Wireless Charging',
        fieldKey: 'battery.wirelessCharging',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.battery.wirelessCharging,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
      {
        label: 'Screen-On Time (Estimated)',
        fieldKey: 'battery.screenOnTimeHours',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.battery.screenOnTimeHours,
        getValue: (p) => p.specs.battery.screenOnTimeHours,
        formatValue: (v) => (v ? `~${v} Hours` : 'N/A'),
      },
    ],
  },
  {
    title: 'Connectivity & Ports',
    sectionKey: 'connectivity',
    icon: Wifi,
    description: '5G network support, Wi-Fi standard, Bluetooth, NFC, and USB ports.',
    rows: [
      {
        label: '5G Support',
        fieldKey: 'connectivity.network5G',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.network5G,
        formatValue: (v) => (v ? 'Yes (Multiple Bands)' : 'No (4G LTE)'),
      },
      {
        label: 'Wi-Fi Version',
        fieldKey: 'connectivity.wifiVersion',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.wifiVersion,
        formatValue: (v) => v || 'Wi-Fi 6',
      },
      {
        label: 'Bluetooth',
        fieldKey: 'connectivity.bluetooth',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseBluetooth(p.specs.connectivity.bluetooth),
        getValue: (p) => p.specs.connectivity.bluetooth,
        formatValue: (v) => v || 'v5.3',
      },
      {
        label: 'NFC Support',
        fieldKey: 'connectivity.nfc',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.nfc,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
      {
        label: 'USB Connector',
        fieldKey: 'connectivity.usbPort',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.usbPort,
        formatValue: (v) => v || 'USB Type-C',
      },
    ],
  },
  {
    title: 'Build & Software',
    sectionKey: 'build',
    icon: ShieldCheck,
    description: 'IP rating, dimensions, weight, frame materials, and OS update guarantee.',
    rows: [
      {
        label: 'IP Rating (Water/Dust)',
        fieldKey: 'build.ipRating',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.build.ipRating,
        formatValue: (v) => v || 'None',
      },
      {
        label: 'Weight',
        fieldKey: 'build.weight',
        compareDirection: 'lower-is-better',
        getNumericValue: (p) => p.specs.build.weight,
        getValue: (p) => p.specs.build.weight,
        formatValue: (v) => `${v} grams`,
      },
      {
        label: 'Thickness',
        fieldKey: 'build.thickness',
        compareDirection: 'lower-is-better',
        getNumericValue: (p) => p.specs.build.thickness,
        getValue: (p) => p.specs.build.thickness,
        formatValue: (v) => `${v} mm`,
      },
      {
        label: 'Operating System',
        fieldKey: 'software.os',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.software?.os,
        formatValue: (v) => v || 'Android / iOS',
      },
      {
        label: 'Guaranteed OS Updates',
        fieldKey: 'software.updateYears',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.software?.updateYears,
        getValue: (p) => p.specs.software?.updateYears,
        formatValue: (v) => (v ? `${v} Years of OS Updates` : 'N/A'),
      },
    ],
  },
];

const LAPTOP_SPEC_SECTIONS: SpecSection[] = [
  {
    title: 'Display & Visuals',
    sectionKey: 'display',
    icon: Monitor,
    description: 'Panel tech, screen resolution, peak brightness, and refresh rate.',
    rows: [
      {
        label: 'Screen Size',
        fieldKey: 'display.size',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.size,
        getValue: (p) => p.specs.display.size,
        formatValue: (v) => `${v} inches`,
      },
      {
        label: 'Resolution',
        fieldKey: 'display.resolution',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseResolutionPixels(p.specs.display.resolution),
        getValue: (p) => p.specs.display.resolution,
        formatValue: (v) => v,
      },
      {
        label: 'Panel Type',
        fieldKey: 'display.panelType',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.display.panelType,
        formatValue: (v) => v,
      },
      {
        label: 'Refresh Rate',
        fieldKey: 'display.refreshRate',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.refreshRate,
        getValue: (p) => p.specs.display.refreshRate,
        formatValue: (v) => `${v} Hz`,
      },
      {
        label: 'Peak Brightness',
        fieldKey: 'display.brightnessNits',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.brightnessNits,
        getValue: (p) => p.specs.display.brightnessNits,
        formatValue: (v) => `${v} nits`,
      },
      {
        label: 'Touchscreen',
        fieldKey: 'display.touchscreen',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.display.touchscreen,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
    ],
  },
  {
    title: 'CPU, GPU & Performance',
    sectionKey: 'performance',
    icon: Cpu,
    description: 'Processor generation, core count, graphics, and RAM configuration.',
    rows: [
      {
        label: 'CPU Model',
        fieldKey: 'performance.cpuModel',
        compareDirection: 'neutral',
        getValue: (p) => `${p.specs.performance.cpuBrand} ${p.specs.performance.cpuModel}`,
        formatValue: (v) => v,
      },
      {
        label: 'GPU',
        fieldKey: 'performance.gpuModel',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.gpuModel,
        formatValue: (v) => v,
      },
      {
        label: 'Installed RAM',
        fieldKey: 'performance.ramSize',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.ramSize,
        getValue: (p) => p.specs.performance.ramSize,
        formatValue: (v) => `${v}GB RAM`,
      },
      {
        label: 'Storage Capacity',
        fieldKey: 'performance.storageCapacity',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.storageCapacity,
        formatValue: (v) => v,
      },
    ],
  },
  {
    title: 'Battery & Power',
    sectionKey: 'battery',
    icon: BatteryCharging,
    description: 'Battery capacity, fast charging, and manufacturer endurance ratings.',
    rows: [
      {
        label: 'Battery Capacity (Wh)',
        fieldKey: 'battery.capacityWh',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.battery.capacityWh,
        getValue: (p) => p.specs.battery.capacityWh,
        formatValue: (v) => `${v} Wh`,
      },
      {
        label: 'Claimed Battery Life',
        fieldKey: 'battery.claimedBatteryHours',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.battery.claimedBatteryHours,
        getValue: (p) => p.specs.battery.claimedBatteryHours,
        formatValue: (v) => `${v} Hours`,
      },
    ],
  },
  {
    title: 'Design & Build',
    sectionKey: 'build',
    icon: ShieldCheck,
    description: 'Weight, dimensions, chassis material, and build durability.',
    rows: [
      {
        label: 'Weight',
        fieldKey: 'build.weight',
        compareDirection: 'lower-is-better',
        getNumericValue: (p) => p.specs.build.weight,
        getValue: (p) => p.specs.build.weight,
        formatValue: (v) => `${v} kg`,
      },
      {
        label: 'Thickness',
        fieldKey: 'build.thickness',
        compareDirection: 'lower-is-better',
        getNumericValue: (p) => p.specs.build.thickness,
        getValue: (p) => p.specs.build.thickness,
        formatValue: (v) => `${v} mm`,
      },
      {
        label: 'Chassis Material',
        fieldKey: 'build.chassisMaterial',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.build.chassisMaterial,
        formatValue: (v) => v || 'Aluminum Unibody',
      },
    ],
  },
];

function calculateWinner(
  phones: Phone[],
  row: SpecRow
): { isDifferent: boolean; winningIndices: Set<number>; direction: CompareDirection } {
  const values = phones.map((p) => {
    try {
      const v = row.getValue(p);
      return typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
    } catch {
      return '';
    }
  });

  const isDifferent = values.length > 1 && new Set(values).size > 1;
  const winningIndices = new Set<number>();
  const direction = row.compareDirection || 'neutral';

  if (!isDifferent || direction === 'neutral' || !row.getNumericValue) {
    return { isDifferent, winningIndices, direction };
  }

  const numericValues = phones.map((p) => {
    try {
      return row.getNumericValue!(p);
    } catch {
      return null;
    }
  });

  const validNumbers = numericValues.filter((v): v is number => v !== null && !isNaN(v));
  if (validNumbers.length < 2) {
    return { isDifferent, winningIndices, direction };
  }

  const allEqual = validNumbers.every((v) => v === validNumbers[0]);
  if (allEqual) {
    return { isDifferent, winningIndices, direction };
  }

  let bestVal: number;
  if (direction === 'higher-is-better') {
    bestVal = Math.max(...validNumbers);
  } else {
    bestVal = Math.min(...validNumbers);
  }

  numericValues.forEach((val, idx) => {
    if (val === bestVal) {
      winningIndices.add(idx);
    }
  });

  return { isDifferent, winningIndices, direction };
}

export default function SpecsTable({
  phones,
  highlightDifferences = false,
  showEmptySlots = false,
  remainingPhones = [],
}: SpecsTableProps) {
  const { removePhone, addPhone } = useCompare();
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');

  const isCompareMode = phones.length > 1 || showEmptySlots;
  const singlePhone = phones[0];
  const category = singlePhone?.category || 'phone';
  const sections = category === 'laptop' ? LAPTOP_SPEC_SECTIONS : PHONE_SPEC_SECTIONS;

  const toggleSection = (idx: number) => {
    setCollapsedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);
  };

  // Filter sections for Single Product View
  const filteredSections = useMemo(() => {
    let result = sections;
    if (activeTab !== 'all') {
      result = result.filter((s) => s.sectionKey === activeTab);
    }

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      result = result
        .map((sec) => ({
          ...sec,
          rows: sec.rows.filter((r) => {
            const labelMatch = r.label.toLowerCase().includes(q);
            const valMatch = singlePhone ? r.formatValue(r.getValue(singlePhone)).toLowerCase().includes(q) : false;
            return labelMatch || valMatch;
          }),
        }))
        .filter((sec) => sec.rows.length > 0);
    }

    return result;
  }, [sections, activeTab, filterQuery, singlePhone]);

  // =========================================================================
  // VIEW 1: PREMIUM SINGLE-PRODUCT SPECIFICATION SUITE
  // =========================================================================
  if (!isCompareMode && singlePhone) {
    const verifiedFields = singlePhone.dataCompleteness?.verifiedFields || [];
    const isOverallVerified = !singlePhone.dataCompleteness?.unverifiedFields || singlePhone.dataCompleteness.unverifiedFields.length === 0;

    return (
      <div className="space-y-6">
        {/* Top Control Bar: Category Quick Tabs & Spec Search */}
        <div className="rounded-2xl border border-theme bg-theme-elevated p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Quick Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-accent text-white shadow-sm shadow-accent/20'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Specs</span>
            </button>

            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.sectionKey;
              return (
                <button
                  key={sec.sectionKey}
                  type="button"
                  onClick={() => setActiveTab(sec.sectionKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-accent text-white shadow-sm shadow-accent/20'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Specs Filter Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter specs (e.g. OLED, RAM, OIS)..."
              className="w-full h-10 pl-10 pr-8 rounded-xl border border-theme bg-theme-surface text-xs text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all font-sans"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Specification Bento Grid Cards */}
        {filteredSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isSectionVerified = verifiedFields.includes(sec.sectionKey) || isOverallVerified;

              return (
                <div
                  key={sec.title}
                  className="rounded-2xl border border-theme bg-theme-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-theme pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg text-accent font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-theme-primary font-display">
                            {sec.title}
                          </h3>
                          {sec.description && (
                            <p className="text-[11px] text-theme-secondary">
                              {sec.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Verification Status Pill */}
                      {isSectionVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success-bg border border-success-border px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning-bg border border-warning-border px-2 py-0.5 rounded-full shrink-0">
                          <span>In Review</span>
                        </span>
                      )}
                    </div>

                    {/* Section Spec Rows */}
                    <div className="divide-y divide-theme/60">
                      {sec.rows.map((row) => {
                        const val = row.formatValue(row.getValue(singlePhone));

                        return (
                          <div
                            key={row.label}
                            className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-theme-surface-hover/50 px-2 rounded-lg transition-colors"
                          >
                            <span className="font-semibold text-theme-secondary shrink-0 max-w-[45%]">
                              {row.label}
                            </span>
                            <span className="font-bold text-theme-primary text-right font-sans break-words tabular-nums">
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-theme bg-theme-elevated p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-theme-secondary mx-auto" />
            <h4 className="text-sm font-bold text-theme-primary">No matching specifications found</h4>
            <p className="text-xs text-theme-secondary">
              No specs matched your search &quot;{filterQuery}&quot;. Try clearing the search.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterQuery('');
                setActiveTab('all');
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold"
            >
              Clear Spec Filter
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MULTI-PRODUCT COMPARISON MATRIX (FOR /compare & SIDE-BY-SIDE)
  // =========================================================================
  return (
    <div className="w-full border border-theme rounded-2xl bg-theme-surface shadow-sm transition-colors duration-200 overflow-x-auto">
      <div className="overflow-x-auto w-full pb-4 scroll-smooth">
        <table className="w-full border-collapse text-left text-sm text-theme-primary table-fixed">
          {/* Table Header */}
          <thead className="sticky top-14 z-30 shadow-sm" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
            <tr>
              <th
                className="sticky left-0 z-40 p-4 font-bold text-theme-secondary w-[35vw] sm:w-56 shrink-0 align-bottom border-r border-theme border-b"
                style={{ backgroundColor: 'var(--bg-surface-elevated)' }}
              >
                <div className="flex flex-col justify-end">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Comparison
                  </span>
                  <h3 className="text-sm font-black text-theme-primary tracking-tight font-display">
                    Technical Specifications
                  </h3>
                </div>
              </th>

              {phones.map((phone) => {
                const isVerified = !phone.dataCompleteness.unverifiedFields || phone.dataCompleteness.unverifiedFields.length === 0;
                return (
                  <th
                    key={phone.id}
                    className="p-3 sm:p-4 font-bold text-theme-primary border-l border-theme border-b align-top w-[55vw] sm:w-64 min-w-[150px]"
                    style={{ backgroundColor: 'var(--bg-surface-elevated)' }}
                  >
                    <div className="relative flex flex-col items-center text-center group">
                      {/* Remove button if in compare mode */}
                      {isCompareMode && (
                        <button
                          onClick={() => removePhone(phone.id)}
                          className="absolute -right-1 -top-1 sm:right-0 sm:top-0 h-6 w-6 rounded-full border border-danger-border bg-danger-bg text-danger hover:bg-danger/15 transition-colors flex items-center justify-center cursor-pointer shadow-sm z-10"
                          title="Remove from comparison"
                          aria-label={`Remove ${phone.model}`}
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}

                      {/* Phone Image */}
                      <div className="h-16 sm:h-20 w-14 sm:w-16 flex-shrink-0 bg-theme-surface rounded-xl overflow-hidden p-1.5 flex items-center justify-center border border-theme mb-2 shadow-inner">
                        <img
                          src={phone.images[0] || '/placeholder.png'}
                          alt={phone.model}
                          className="h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Brand & Model */}
                      <span className="text-[9px] sm:text-[10px] text-theme-secondary uppercase font-bold tracking-wider truncate max-w-full">
                        {phone.brand}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-theme-primary leading-tight truncate max-w-full mt-0.5 whitespace-normal font-display">
                        {phone.model}
                      </h4>

                      {/* Price & Score dial grouped */}
                      <div className="mt-2.5 flex flex-col items-center gap-1.5 bg-theme-surface w-full p-2 rounded-xl border border-theme/60">
                        <span className="text-[11px] sm:text-xs font-black text-theme-primary tabular-nums">
                          {formatPrice(phone.price.amazonPrice || phone.price.flipkartPrice || phone.price.mrp)}
                        </span>
                        <div className="flex items-center gap-1.5 justify-center">
                          <SpecsScoreDial score={phone.specsScore} size="sm" />
                          <div className="flex flex-col text-left leading-[1.1]">
                            <span className="text-[8px] text-theme-secondary uppercase font-bold tracking-wider">Score</span>
                            <span className={`text-[8px] sm:text-[9px] font-bold ${isVerified ? 'text-success' : 'text-warning'}`}>
                              {isVerified ? 'Verified' : 'Reviewing'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </th>
                );
              })}

              {/* Empty slot picker columns */}
              {showEmptySlots &&
                Array.from({ length: 4 - phones.length }).map((_, idx) => (
                  <th
                    key={`empty-${idx}`}
                    className="p-3 sm:p-4 font-bold text-theme-secondary border-l border-theme border-b align-top w-[55vw] sm:w-64 min-w-[150px]"
                    style={{ backgroundColor: 'var(--bg-surface-elevated)' }}
                  >
                    <div className="rounded-xl border border-dashed border-theme bg-theme-surface/40 p-4 flex flex-col items-center justify-center text-center h-full min-h-[10rem] cursor-pointer hover:border-accent/40 hover:bg-theme-surface-hover/10 transition-colors group">
                      <div className="h-8 w-8 rounded-full border border-theme flex items-center justify-center text-theme-secondary group-hover:text-accent group-hover:border-accent/30 transition-all mb-2">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="text-[11px] font-bold text-theme-secondary group-hover:text-theme-primary">
                        + Add to Compare
                      </h4>

                      {remainingPhones.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addPhone(e.target.value);
                            }
                          }}
                          defaultValue=""
                          className="mt-3 text-[10px] bg-theme-surface border border-theme rounded-lg px-2 py-1 text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer w-full max-w-[130px]"
                        >
                          <option value="" disabled>
                            Select Device...
                          </option>
                          {remainingPhones.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.brand} {p.model}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {sections.map((section, secIdx) => {
              const isCollapsed = !!collapsedSections[secIdx];
              const SectionIcon = section.icon;

              return (
                <React.Fragment key={section.title}>
                  {/* Section Title Header */}
                  <tr onClick={() => toggleSection(secIdx)} className="cursor-pointer select-none">
                    <td
                      colSpan={phones.length + (showEmptySlots ? 4 - phones.length : 0) + 1}
                      className="sticky top-[188px] sm:top-[206px] z-20 border-y border-theme p-3 sm:p-4 font-extrabold text-theme-primary text-xs uppercase tracking-wider shadow-sm hover:bg-theme-surface-hover transition-colors font-display"
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SectionIcon className="w-4 h-4 text-accent" />
                          <span>{section.title}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-theme-secondary transition-transform ${
                            isCollapsed ? '' : 'rotate-180'
                          }`}
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Rows in Section */}
                  {!isCollapsed &&
                    section.rows.map((row) => {
                      const { isDifferent, winningIndices } = calculateWinner(phones, row);
                      const formattedValues = phones.map((p) => row.formatValue(row.getValue(p)));

                      const rowHighlightClass =
                        highlightDifferences && isDifferent
                          ? 'bg-accent-bg/30 hover:bg-accent-bg/50 border-l-2 border-l-accent'
                          : 'hover:bg-theme-surface-hover';

                      return (
                        <tr key={row.label} className={`border-b border-theme transition-all ${rowHighlightClass}`}>
                          {/* Spec Name / Label */}
                          <td
                            className="sticky left-0 z-10 p-3 sm:p-4 font-semibold text-theme-secondary text-[11px] sm:text-xs border-r border-theme"
                            style={{ backgroundColor: 'var(--bg-surface)' }}
                          >
                            <div className="flex flex-col gap-1 items-start">
                              <span>{row.label}</span>
                              {highlightDifferences && isDifferent && (
                                <span className="text-[8px] sm:text-[9px] text-accent font-bold bg-accent-bg border border-accent/20 px-1.5 py-0.5 rounded-md w-max mt-0.5 uppercase tracking-wider">
                                  Differs
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Values per Phone */}
                          {phones.map((phone, pIdx) => {
                            const sectionVerified = phone.dataCompleteness.verifiedFields?.includes(section.sectionKey);
                            const unverifiedBadge = !sectionVerified;
                            const isWinner = isCompareMode && winningIndices.has(pIdx);

                            const cellClass = isWinner
                              ? 'p-4 text-xs bg-success-bg border-l border-theme relative font-semibold text-theme-primary'
                              : 'p-4 text-xs text-theme-primary border-l border-theme relative';

                            return (
                              <td key={phone.id} className={cellClass}>
                                {isWinner && (
                                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-success z-10 pointer-events-none" />
                                )}
                                {unverifiedBadge ? (
                                  <div className="flex flex-col gap-1 items-start">
                                    <span className="text-theme-secondary font-medium">
                                      {formattedValues[pIdx]}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-warning bg-warning-bg border border-warning-border px-1.5 py-0.5 rounded-md w-max">
                                      Reviewing
                                    </span>
                                  </div>
                                ) : isWinner ? (
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 flex-wrap items-start">
                                    <span className="font-bold text-success">{formattedValues[pIdx]}</span>
                                    <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-extrabold text-success bg-success-bg border border-success-border px-1.5 py-0.5 rounded-md shadow-sm w-max">
                                      Best
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-medium text-theme-primary">{formattedValues[pIdx]}</span>
                                )}
                              </td>
                            );
                          })}

                          {showEmptySlots &&
                            Array.from({ length: 4 - phones.length }).map((_, idx) => (
                              <td
                                key={`empty-cell-${idx}`}
                                className="p-3 sm:p-4 text-xs border-l border-theme bg-theme-surface/10 text-center"
                              >
                                <span className="text-theme-secondary/40 italic text-[10px]">—</span>
                              </td>
                            ))}
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
