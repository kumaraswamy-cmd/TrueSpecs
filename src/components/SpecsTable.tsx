/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Phone } from '@/types/phone';
import { useCompare } from '@/context/CompareContext';
import { X } from 'lucide-react';
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
  sectionKey: string; // matches verifiedFields keys like "display", "performance", etc.
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
    title: 'Display Specifications',
    sectionKey: 'display',
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
        label: 'AnTuTu Benchmark',
        fieldKey: 'performance.antutu',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.antutu || null,
        getValue: (p) => p.specs.performance.antutu,
        formatValue: (v) => (v ? new Intl.NumberFormat('en-IN').format(v) : 'N/A'),
      },
      {
        label: 'Cooling System',
        fieldKey: 'performance.coolingSystem',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.coolingSystem,
        formatValue: (v) => v || 'N/A',
      },
    ],
  },
  {
    title: 'Camera Setup',
    sectionKey: 'camera',
    rows: [
      {
        label: 'Rear Cameras',
        fieldKey: 'camera.rear',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseMp(p.specs.camera.rear),
        getValue: (p) => p.specs.camera.rear,
        formatValue: (v) =>
          (v as Array<{ megapixel: number; type: string; ois?: boolean }>)
            .map(
              (lens) =>
                `${lens.megapixel}MP ${lens.type}${lens.ois ? ' (OIS)' : ''}`
            )
            .join(' + '),
      },
      {
        label: 'Front Camera',
        fieldKey: 'camera.front',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseMp(p.specs.camera.front),
        getValue: (p) => p.specs.camera.front,
        formatValue: (v) => v,
      },
      {
        label: 'Video Capabilities',
        fieldKey: 'camera.video',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.camera.video,
        formatValue: (v) => v,
      },
    ],
  },
  {
    title: 'Battery & Charging',
    sectionKey: 'battery',
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
        label: 'Charging Speed',
        fieldKey: 'battery.chargingSpeedWatts',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.battery.chargingSpeedWatts,
        getValue: (p) => p.specs.battery.chargingSpeedWatts,
        formatValue: (v) => `${v}W Wired`,
      },
      {
        label: 'Wireless Charging',
        fieldKey: 'battery.wirelessCharging',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => (p.specs.battery.wirelessCharging ? 1 : 0),
        getValue: (p) => p.specs.battery.wirelessCharging,
        formatValue: (v) => (v ? 'Supported' : 'No'),
      },
      {
        label: 'Reverse Charging',
        fieldKey: 'battery.reverseCharging',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => (p.specs.battery.reverseCharging ? 1 : 0),
        getValue: (p) => p.specs.battery.reverseCharging,
        formatValue: (v) => (v ? 'Supported' : 'No'),
      },
    ],
  },
  {
    title: 'Design & Build',
    sectionKey: 'build',
    rows: [
      {
        label: 'Weight',
        fieldKey: 'build.weight',
        compareDirection: 'lower-is-better',
        getNumericValue: (p) => p.specs.build.weight,
        getValue: (p) => p.specs.build.weight,
        formatValue: (v) => `${v}g`,
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
        label: 'Materials',
        fieldKey: 'build.materials',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.build.materials,
        formatValue: (v) => v,
      },
      {
        label: 'IP Water Rating',
        fieldKey: 'build.ipRating',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.build.ipRating,
        formatValue: (v) => v || 'None',
      },
      {
        label: 'Stereo Speakers',
        fieldKey: 'build.stereoSpeakers',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => (p.specs.build.stereoSpeakers ? 1 : 0),
        getValue: (p) => p.specs.build.stereoSpeakers,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
    ],
  },
  {
    title: 'Connectivity & Sensors',
    sectionKey: 'connectivity',
    rows: [
      {
        label: '5G Support',
        fieldKey: 'connectivity.network5G',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.network5G,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
      {
        label: 'Carrier Aggregation',
        fieldKey: 'connectivity.carrierAggregationBands',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.carrierAggregationBands,
        formatValue: (v) => v || 'N/A',
      },
      {
        label: 'SIM Configurations',
        fieldKey: 'connectivity.sim',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.sim,
        formatValue: (v) => v,
      },
      {
        label: 'NFC Support',
        fieldKey: 'connectivity.nfc',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.nfc,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
      {
        label: 'USB Interface Type',
        fieldKey: 'connectivity.usbType',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.usbType,
        formatValue: (v) => v,
      },
      {
        label: 'VoWiFi Calling',
        fieldKey: 'connectivity.vowifi',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.vowifi,
        formatValue: (v) => (v ? 'Yes' : 'No'),
      },
      {
        label: 'Bluetooth Version',
        fieldKey: 'connectivity.bluetoothVersion',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => parseBluetooth(p.specs.connectivity.bluetoothVersion),
        getValue: (p) => p.specs.connectivity.bluetoothVersion,
        formatValue: (v) => v,
      },
    ],
  },
];

const LAPTOP_SPEC_SECTIONS: SpecSection[] = [
  {
    title: 'Display Specifications',
    sectionKey: 'display',
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
        getNumericValue: (p) => {
          const match = (p.specs.display.resolution || '').match(/(\d+)\s*[x×]\s*(\d+)/i);
          return match ? parseInt(match[1], 10) * parseInt(match[2], 10) : null;
        },
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
        label: 'Brightness',
        fieldKey: 'display.brightness',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.brightness,
        getValue: (p) => p.specs.display.brightness,
        formatValue: (v) => `${v} nits`,
      },
      {
        label: 'Color Gamut',
        fieldKey: 'display.colorGamutSRGBPercent',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.display.colorGamutSRGBPercent,
        getValue: (p) => p.specs.display.colorGamutSRGBPercent,
        formatValue: (v) => `${v}% sRGB`,
      },
      {
        label: 'Touchscreen',
        fieldKey: 'display.touchscreen',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.display.touchscreen,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
    ],
  },
  {
    title: 'Performance & Hardware',
    sectionKey: 'performance',
    rows: [
      {
        label: 'CPU Brand',
        fieldKey: 'performance.cpuBrand',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.cpuBrand,
        formatValue: (v) => v,
      },
      {
        label: 'CPU Model',
        fieldKey: 'performance.cpuModel',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.cpuModel,
        formatValue: (v) => v,
      },
      {
        label: 'CPU Generation',
        fieldKey: 'performance.cpuGeneration',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.cpuGeneration,
        formatValue: (v) => v,
      },
      {
        label: 'CPU Cores',
        fieldKey: 'performance.cpuCores',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.cpuCores,
        getValue: (p) => p.specs.performance.cpuCores,
        formatValue: (v) => `${v} Cores`,
      },
      {
        label: 'GPU Model',
        fieldKey: 'performance.gpuModel',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.gpuModel,
        formatValue: (v) => v,
      },
      {
        label: 'GPU Type',
        fieldKey: 'performance.gpuType',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.gpuType,
        formatValue: (v) => v.charAt(0).toUpperCase() + v.slice(1),
      },
      {
        label: 'GPU VRAM',
        fieldKey: 'performance.gpuVRAM',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.gpuVRAM,
        formatValue: (v) => v,
      },
      {
        label: 'RAM Size',
        fieldKey: 'performance.ramSize',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.performance.ramSize,
        getValue: (p) => p.specs.performance.ramSize,
        formatValue: (v) => `${v} GB`,
      },
      {
        label: 'RAM Type',
        fieldKey: 'performance.ramType',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.ramType,
        formatValue: (v) => v,
      },
      {
        label: 'RAM Upgradeable',
        fieldKey: 'performance.ramUpgradeable',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.ramUpgradeable,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
      {
        label: 'Storage Capacity',
        fieldKey: 'performance.storageCapacity',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.storageCapacity,
        formatValue: (v) => v,
      },
      {
        label: 'Storage Type',
        fieldKey: 'performance.storageType',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.storageType,
        formatValue: (v) => v,
      },
      {
        label: 'Storage Upgradeable',
        fieldKey: 'performance.storageUpgradeable',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.performance.storageUpgradeable,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
    ],
  },
  {
    title: 'Battery & Power',
    sectionKey: 'battery',
    rows: [
      {
        label: 'Battery Capacity',
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
      {
        label: 'Fast Charging',
        fieldKey: 'battery.fastCharging',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.battery.fastCharging,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
    ],
  },
  {
    title: 'Design & Build',
    sectionKey: 'build',
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
        formatValue: (v) => v,
      },
      {
        label: 'Hinge Type',
        fieldKey: 'build.hingeType',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.build.hingeType,
        formatValue: (v) => v,
      },
    ],
  },
  {
    title: 'Ports & Expansion',
    sectionKey: 'ports',
    rows: [
      {
        label: 'USB-A Ports Count',
        fieldKey: 'ports.usbACount',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.ports.usbACount,
        getValue: (p) => p.specs.ports.usbACount,
        formatValue: (v) => `${v} Ports`,
      },
      {
        label: 'USB-C Ports Count',
        fieldKey: 'ports.usbCCount',
        compareDirection: 'higher-is-better',
        getNumericValue: (p) => p.specs.ports.usbCCount,
        getValue: (p) => p.specs.ports.usbCCount,
        formatValue: (v) => `${v} Ports`,
      },
      {
        label: 'Thunderbolt Support',
        fieldKey: 'ports.thunderboltSupport',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.ports.thunderboltSupport,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
      {
        label: 'HDMI Port',
        fieldKey: 'ports.hdmiPort',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.ports.hdmiPort,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
      {
        label: 'SD Card Slot',
        fieldKey: 'ports.sdCardSlot',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.ports.sdCardSlot,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
      {
        label: 'Headphone Jack',
        fieldKey: 'ports.headphoneJack',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.ports.headphoneJack,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
    ],
  },
  {
    title: 'Connectivity & Wireless',
    sectionKey: 'connectivity',
    rows: [
      {
        label: 'Wi-Fi Standard',
        fieldKey: 'connectivity.wifiStandard',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.wifiStandard,
        formatValue: (v) => v,
      },
      {
        label: 'Bluetooth Version',
        fieldKey: 'connectivity.bluetoothVersion',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.connectivity.bluetoothVersion,
        formatValue: (v) => v,
      },
    ],
  },
  {
    title: 'Operating System',
    sectionKey: 'os',
    rows: [
      {
        label: 'Preinstalled OS',
        fieldKey: 'os.preinstalledOS',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.os.preinstalledOS,
        formatValue: (v) => v,
      },
      {
        label: 'OS Upgradeable',
        fieldKey: 'os.osUpgradeable',
        compareDirection: 'neutral',
        getValue: (p) => p.specs.os.osUpgradeable,
        formatValue: (v) => (v === 'yes' ? 'Yes' : 'No'),
      },
    ],
  },
];

function calculateWinner(
  phones: Phone[],
  row: SpecRow
): {
  isDifferent: boolean;
  winningIndices: Set<number>;
  direction: CompareDirection;
} {
  const direction = row.compareDirection || 'neutral';
  const phoneValues = phones.map((p) => row.getValue(p));

  const isDifferent = phoneValues.some(
    (val) => JSON.stringify(val) !== JSON.stringify(phoneValues[0])
  );

  const winningIndices = new Set<number>();

  if (!isDifferent || direction === 'neutral' || !row.getNumericValue || phones.length < 2) {
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

export default function SpecsTable({ phones, highlightDifferences = false, showEmptySlots = false, remainingPhones = [] }: SpecsTableProps) {
  const { removePhone, addPhone } = useCompare();
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (idx: number) => {
    setCollapsedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isCompareMode = phones.length > 1 || showEmptySlots;
  const category = phones[0]?.category || 'phone';
  const currentSections = category === 'laptop' ? LAPTOP_SPEC_SECTIONS : PHONE_SPEC_SECTIONS;

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);
  };

  return (
    <div className="w-full border border-theme rounded-2xl bg-theme-surface shadow-sm transition-colors duration-200 overflow-x-auto">
      <div className="overflow-x-auto w-full pb-4 scroll-smooth">
        <table className="w-full border-collapse text-left text-sm text-theme-primary table-fixed">
          {/* Table Header (Sticky top-14 below site Navbar) */}
          <thead className="sticky top-14 z-30 shadow-sm" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
            <tr>
              <th className="sticky left-0 z-40 p-3 sm:p-4 font-bold text-theme-secondary w-[35vw] sm:w-56 shrink-0 align-bottom border-r border-theme border-b" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                <div className="flex flex-col justify-end">
                  <span className="text-[10px] uppercase font-bold text-theme-secondary tracking-widest">Side-by-Side</span>
                  <h3 className="text-sm font-black text-theme-primary tracking-tight">Specifications</h3>
                </div>
              </th>
              {phones.map((phone) => {
                const isVerified = !phone.dataCompleteness.unverifiedFields || phone.dataCompleteness.unverifiedFields.length === 0;
                return (
                  <th key={phone.id} className="p-3 sm:p-4 font-bold text-theme-primary border-l border-theme border-b align-top w-[55vw] sm:w-64 min-w-[140px]" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                    <div className="relative flex flex-col items-center text-center group">
                      {/* Remove button if in compare mode */}
                      {isCompareMode && (
                        <button
                          onClick={() => removePhone(phone.id)}
                          className="absolute -right-1 -top-1 sm:right-0 sm:top-0 h-6 w-6 rounded-full border border-danger-border bg-danger-bg text-danger hover:bg-danger/15 transition-colors flex items-center justify-center cursor-pointer shadow-sm z-10"
                          title="Remove from comparison"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}

                      {/* Phone Image */}
                      <div className="h-16 sm:h-20 w-14 sm:w-16 flex-shrink-0 bg-theme-surface rounded-xl overflow-hidden p-1.5 flex items-center justify-center border border-theme mb-2 shadow-inner">
                        <img src={phone.images[0] || '/placeholder.png'} alt={phone.model} className="h-full object-contain group-hover:scale-105 transition-transform" />
                      </div>

                      {/* Brand & Model */}
                      <span className="text-[9px] sm:text-[10px] text-theme-secondary uppercase font-bold tracking-wider truncate max-w-full">
                        {phone.brand}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-theme-primary leading-tight truncate max-w-full mt-0.5 whitespace-normal">
                        {phone.model}
                      </h4>

                      {/* Price & Score dial grouped */}
                      <div className="mt-2.5 flex flex-col items-center gap-1.5 bg-theme-surface w-full p-2 rounded-lg border border-theme/50">
                        <span className="text-[10px] sm:text-xs font-black text-theme-primary tabular-nums">
                          {formatPrice(phone.price.amazonPrice || phone.price.flipkartPrice)}
                        </span>
                        <div className="flex items-center gap-1.5 justify-center">
                          <SpecsScoreDial score={phone.specsScore} size="sm" />
                          <div className="flex flex-col text-left leading-[1.1]">
                            <span className="text-[8px] text-theme-secondary uppercase font-bold tracking-wider">Score</span>
                            <span className={`text-[8px] sm:text-[9px] font-bold ${isVerified ? 'text-success' : 'text-warning'}`}>
                              {isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </th>
                );
              })}
              
              {showEmptySlots && Array.from({ length: 4 - phones.length }).map((_, idx) => (
                <th key={`empty-${idx}`} className="p-3 sm:p-4 font-bold text-theme-secondary border-l border-theme border-b align-top w-[55vw] sm:w-64 min-w-[140px]" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div className="rounded-xl border border-dashed border-theme bg-theme-surface/40 p-4 flex flex-col items-center justify-center text-center h-full min-h-[10rem] cursor-pointer hover:border-accent/40 hover:bg-theme-surface-hover/10 transition-colors group">
                    <div className="h-8 w-8 rounded-full border border-theme flex items-center justify-center text-theme-secondary group-hover:text-accent group-hover:border-accent/30 transition-all mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <h4 className="text-[11px] font-bold text-theme-secondary group-hover:text-theme-primary">Add Product</h4>
                    
                    {remainingPhones.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addPhone(e.target.value);
                          }
                        }}
                        defaultValue=""
                        className="mt-3 text-[9px] bg-theme-surface border border-theme rounded-md px-1 py-1 text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 cursor-pointer w-full max-w-[120px]"
                      >
                        <option value="" disabled>+ Quick Add...</option>
                        {remainingPhones.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.model}
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
            {currentSections.map((section, secIdx) => {
              const isCollapsed = !!collapsedSections[secIdx];
              return (
                <React.Fragment key={section.title}>
                  {/* Section Title Header (Sticky top-[178px] below Phone Header) */}
                  <tr
                    onClick={() => toggleSection(secIdx)}
                    className="cursor-pointer select-none"
                  >
                    <td
                      colSpan={phones.length + (showEmptySlots ? 4 - phones.length : 0) + 1}
                      className="sticky top-[188px] sm:top-[206px] z-20 border-y border-theme p-3 sm:p-4 font-extrabold text-theme-primary text-xs uppercase tracking-wider shadow-sm hover:bg-theme-surface-hover transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{section.title}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`w-4.5 h-4.5 text-theme-secondary transition-transform ${
                            isCollapsed ? '' : 'rotate-180'
                          }`}
                        >
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
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
                        <tr
                          key={row.label}
                          className={`border-b border-theme transition-all ${rowHighlightClass}`}
                        >
                          {/* Spec Name / Label */}
                          <td className="sticky left-0 z-10 p-3 sm:p-4 font-semibold text-theme-secondary text-[11px] sm:text-xs border-r border-theme" style={{ backgroundColor: 'var(--bg-surface)' }}>
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
                            // Check verification status
                            const sectionVerified =
                              phone.dataCompleteness.verifiedFields?.includes(section.sectionKey);
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
                                  <div className="flex flex-col gap-1.5 items-start">
                                    <span className="text-theme-secondary font-medium">
                                      {formattedValues[pIdx]}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-warning bg-warning-bg border border-warning-border px-1.5 py-0.5 rounded-md w-max">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                      </svg>
                                      Not verified
                                    </span>
                                  </div>
                                ) : isWinner ? (
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 flex-wrap items-start">
                                    <span className="font-bold text-success">{formattedValues[pIdx]}</span>
                                    <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-extrabold text-success bg-success-bg border border-success-border px-1.5 py-0.5 rounded-md shadow-sm w-max">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-success">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                      </svg>
                                      Best
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-medium text-theme-primary">{formattedValues[pIdx]}</span>
                                )}
                              </td>
                            );
                          })}
                          
                          {showEmptySlots && Array.from({ length: 4 - phones.length }).map((_, idx) => (
                            <td key={`empty-cell-${idx}`} className="p-3 sm:p-4 text-xs border-l border-theme bg-theme-surface/10">
                              <span className="text-theme-secondary/40 italic text-[10px]">Empty</span>
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
