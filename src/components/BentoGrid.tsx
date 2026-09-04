'use client';

import React from 'react';
import { Phone } from '@/types/phone';
import { 
  Battery, 
  Cpu, 
  Maximize, 
  Monitor, 
  HardDrive, 
  Usb, 
  Scale, 
  Settings, 
  ShieldCheck, 
  Globe, 
  CreditCard 
} from 'lucide-react';

interface BentoGridProps {
  phone: Phone;
}

export default function BentoGrid({ phone }: BentoGridProps) {
  const isLaptop = phone.category === 'laptop';

  // Bento Card Layout Wrapper
  const BentoCard = ({ 
    children, 
    className = "", 
    colSpan = "col-span-1" 
  }: { 
    children: React.ReactNode; 
    className?: string; 
    colSpan?: string;
  }) => (
    <div className={`rounded-xl sm:rounded-2xl border border-theme bg-theme-surface shadow-sm overflow-hidden p-4 sm:p-5 flex flex-col justify-between ${colSpan} ${className}`}>
      {children}
    </div>
  );

  const renderPhoneCards = () => {
    const s = phone.specs;
    return (
      <>
        {/* Core Display Card */}
        <BentoCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex items-center gap-1.5 mb-1.5 text-blue-500">
            <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Display</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-theme-primary">{s.display.size}&quot;</span>
            <p className="text-xs sm:text-sm font-medium text-theme-secondary mt-0.5">{s.display.type}</p>
          </div>
        </BentoCard>

        {/* Battery Card */}
        <BentoCard className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <div className="flex items-center gap-1.5 mb-1.5 text-emerald-500">
            <Battery className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Battery</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-theme-primary">{s.battery.capacity}</span>
            <span className="text-sm sm:text-base font-bold text-theme-secondary ml-1">mAh</span>
            <p className="text-xs sm:text-sm font-medium text-theme-secondary mt-0.5">{s.battery.chargingSpeedWatts || s.battery.chargingSpeed}W Charging</p>
          </div>
        </BentoCard>

        {/* Dimensions Card */}
        <BentoCard className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 mb-1.5 text-theme-secondary">
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Dimensions</span>
          </div>
          <div className="flex sm:flex-col justify-between sm:justify-start gap-1">
            <div className="flex items-end gap-1">
              <span className="text-xl sm:text-2xl font-bold text-theme-primary">{s.build.weight}</span>
              <span className="text-xs text-theme-secondary mb-0.5">g</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-xl sm:text-2xl font-bold text-theme-primary">{s.build.thickness}</span>
              <span className="text-xs text-theme-secondary mb-0.5">mm</span>
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-theme-secondary mt-1.5 line-clamp-1">{s.build.materials}</p>
        </BentoCard>

        {/* Performance & Storage (Full Width) */}
        <BentoCard colSpan="col-span-2 md:col-span-2 lg:col-span-3" className="bg-theme-elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-accent">
                <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Processing Power</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-theme-primary font-display">{s.performance.chipset}</h3>
              {s.performance.antutuScore && (
                <p className="text-xs sm:text-sm font-medium text-theme-secondary mt-0.5">
                  AnTuTu: {s.performance.antutuScore.toLocaleString()}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 border-t md:border-t-0 md:border-l border-theme pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="text-[9px] sm:text-[10px] text-theme-secondary font-bold uppercase">RAM Options</span>
                <p className="text-sm sm:text-base font-extrabold text-theme-primary">{(s.performance.ram || []).join(' / ')} GB</p>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-theme-secondary font-bold uppercase">Storage</span>
                <p className="text-sm sm:text-base font-extrabold text-theme-primary">{(s.performance.storage || []).join(' / ')} GB</p>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Mini Feature Squares (2x2 on mobile) */}
        <div className="col-span-2 md:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface">
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mb-1.5 text-indigo-500" />
            <span className="text-xs sm:text-sm font-bold text-theme-primary">{s.display.resolution}</span>
            <span className="text-[9px] sm:text-[10px] text-theme-secondary uppercase font-bold mt-0.5">Resolution</span>
          </div>
          <div className={`rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface ${s.connectivity?.network5G ? 'ring-1 ring-inset ring-accent/30 bg-accent-bg' : ''}`}>
            <Globe className={`w-4 h-4 sm:w-5 sm:h-5 mb-1.5 ${s.connectivity?.network5G ? 'text-accent' : 'text-theme-secondary'}`} />
            <span className="text-xs sm:text-sm font-bold text-theme-primary">5G Network</span>
            <span className="text-[9px] sm:text-[10px] text-theme-secondary uppercase font-bold mt-0.5">{s.connectivity?.network5G ? 'Supported' : '4G Only'}</span>
          </div>
          <div className={`rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface ${s.connectivity?.nfc ? 'ring-1 ring-inset ring-blue-500/30 bg-blue-500/10' : ''}`}>
            <CreditCard className={`w-4 h-4 sm:w-5 sm:h-5 mb-1.5 ${s.connectivity?.nfc ? 'text-blue-500' : 'text-theme-secondary'}`} />
            <span className="text-xs sm:text-sm font-bold text-theme-primary">NFC Payments</span>
            <span className="text-[9px] sm:text-[10px] text-theme-secondary uppercase font-bold mt-0.5">{s.connectivity?.nfc ? 'Tap to Pay' : 'Not Supported'}</span>
          </div>
          <div className={`rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface ${s.build?.ipRating ? 'ring-1 ring-inset ring-cyan-500/30 bg-cyan-500/10' : ''}`}>
            <ShieldCheck className={`w-4 h-4 sm:w-5 sm:h-5 mb-1.5 ${s.build?.ipRating ? 'text-cyan-500' : 'text-theme-secondary'}`} />
            <span className="text-xs sm:text-sm font-bold text-theme-primary">{s.build?.ipRating || 'Standard'}</span>
            <span className="text-[9px] sm:text-[10px] text-theme-secondary uppercase font-bold mt-0.5">Durability</span>
          </div>
        </div>
      </>
    );
  };

  const renderLaptopCards = () => {
    const s = phone.specs;
    return (
      <>
        {/* Core Display */}
        <BentoCard className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
          <div className="flex items-center gap-1.5 mb-1.5 text-indigo-500">
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Display</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-theme-primary">{s.display.size}&quot;</span>
            <p className="text-xs sm:text-sm font-medium text-theme-secondary mt-0.5">{s.display.resolution}</p>
            <p className="text-[9px] sm:text-[10px] font-semibold text-theme-secondary mt-0.5 uppercase">{s.display.panelType} • {s.display.refreshRate}Hz</p>
          </div>
        </BentoCard>

        {/* OS Card */}
        <BentoCard className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center gap-1.5 mb-1.5 text-blue-500">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">OS</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold text-theme-primary">{s.os?.preinstalledOS || 'Windows / macOS'}</span>
          </div>
        </BentoCard>

        {/* Battery Card */}
        <BentoCard className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <div className="flex items-center gap-1.5 mb-1.5 text-emerald-500">
            <Battery className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Battery</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-theme-primary">{s.battery.capacityWh}</span>
            <span className="text-sm sm:text-base font-bold text-theme-secondary ml-1">Wh</span>
            <p className="text-xs sm:text-sm font-medium text-theme-secondary mt-0.5">Up to {s.battery.claimedBatteryHours} hrs</p>
          </div>
        </BentoCard>

        {/* Processor & Graphics */}
        <BentoCard colSpan="col-span-2 md:col-span-2 lg:col-span-3" className="bg-theme-elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1 text-accent">
                <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Processor</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-theme-primary font-display">
                {s.performance.cpuBrand} {s.performance.cpuModel}
              </h3>
            </div>
            
            <div className="flex-1 border-t md:border-t-0 md:border-l border-theme pt-3 md:pt-0 md:pl-6">
              <div className="flex items-center gap-1.5 mb-1 text-purple-500">
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Graphics</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-theme-primary font-display">
                {s.performance.gpuModel}
              </h3>
            </div>
          </div>
        </BentoCard>

        {/* RAM, Storage, Ports Row */}
        <BentoCard>
          <div className="flex items-center gap-1.5 mb-1.5 text-theme-secondary">
            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Memory</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-theme-primary">{s.performance.ramSize} GB</span>
            <p className="text-xs font-medium text-theme-secondary mt-0.5">{s.performance.ramType}</p>
          </div>
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-1.5 mb-1.5 text-theme-secondary">
            <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Storage</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-theme-primary">{s.performance.storageCapacity}</span>
            <p className="text-xs font-medium text-theme-secondary mt-0.5">{s.performance.storageType}</p>
          </div>
        </BentoCard>

        <BentoCard className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 mb-1.5 text-theme-secondary">
            <Usb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Ports</span>
          </div>
          <p className="text-xs font-bold text-theme-primary">{s.ports?.thunderboltSupport ? 'Thunderbolt 4 / Type-C' : 'USB-C & USB-A'}</p>
        </BentoCard>
      </>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-base sm:text-lg font-extrabold text-theme-primary tracking-tight font-display flex items-center gap-2">
        <span>Visual Intelligence Breakdown</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {isLaptop ? renderLaptopCards() : renderPhoneCards()}
      </div>
    </div>
  );
}
