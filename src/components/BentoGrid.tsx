'use client';

import React from 'react';
import { Phone } from '@/types/phone';
import { 
  Battery, 
  Cpu, 
  Maximize, 
  Wifi, 
  Smartphone, 
  Laptop, 
  Bluetooth, 
  CreditCard,
  Monitor,
  HardDrive,
  Usb,
  Scale,
  Settings,
  ShieldCheck,
  Zap,
  Globe
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
    <div className={`rounded-2xl border border-theme bg-theme-surface shadow-sm overflow-hidden p-5 flex flex-col justify-between ${colSpan} ${className}`}>
      {children}
    </div>
  );

  const renderPhoneCards = () => {
    const s = phone.specs;
    return (
      <>
        {/* Core Display & Dimensions Row */}
        <BentoCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Maximize className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Display Size</span>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-theme-primary">{s.display.size}"</span>
            <p className="text-sm font-medium text-theme-secondary mt-1">{s.display.type}</p>
          </div>
        </BentoCard>

        <BentoCard className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
            <Battery className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Battery</span>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-theme-primary">{s.battery.capacity}</span>
            <span className="text-lg font-bold text-theme-secondary ml-1">mAh</span>
            <p className="text-sm font-medium text-theme-secondary mt-1">{s.battery.chargingSpeedWatts}W Fast Charging</p>
          </div>
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-2 mb-2 text-theme-secondary">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Dimensions</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-bold text-theme-primary">{s.build.weight}</span>
              <span className="text-sm text-theme-secondary mb-0.5">g</span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-bold text-theme-primary">{s.build.thickness}</span>
              <span className="text-sm text-theme-secondary mb-0.5">mm thick</span>
            </div>
            <p className="text-[11px] font-semibold text-theme-secondary mt-2 line-clamp-1">{s.build.materials}</p>
          </div>
        </BentoCard>

        {/* Performance & Storage (Full Width) */}
        <BentoCard colSpan="col-span-1 md:col-span-2 lg:col-span-3" className="bg-theme-elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-accent-secondary">
                <Cpu className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Processing Power</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-theme-primary">{s.performance.chipset}</h3>
              {s.performance.antutu && (
                <p className="text-sm font-medium text-theme-secondary mt-1">
                  AnTuTu: {s.performance.antutu.toLocaleString()}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div>
                <span className="text-[10px] text-theme-secondary font-bold uppercase">RAM Options</span>
                <p className="text-lg font-bold text-theme-primary">{s.performance.ram.join(' / ')} GB</p>
              </div>
              <div>
                <span className="text-[10px] text-theme-secondary font-bold uppercase">Storage Options</span>
                <p className="text-lg font-bold text-theme-primary">{s.performance.storage.join(' / ')} GB</p>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Mini Feature Squares */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface`}>
            <Monitor className="w-6 h-6 mb-2 text-indigo-500" />
            <span className="text-lg font-bold text-theme-primary">{s.display.resolution}</span>
            <span className="text-[10px] text-theme-secondary uppercase font-bold mt-1">Resolution</span>
          </div>
          <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface ${s.connectivity.network5G ? 'ring-1 ring-inset ring-accent/30 bg-accent-bg' : ''}`}>
            <Globe className={`w-6 h-6 mb-2 ${s.connectivity.network5G ? 'text-accent' : 'text-theme-secondary'}`} />
            <span className="text-sm font-bold text-theme-primary">5G Ready</span>
            <span className="text-[10px] text-theme-secondary uppercase font-bold mt-1">{s.connectivity.network5G ? 'Supported' : '4G Only'}</span>
          </div>
          <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface ${s.connectivity.nfc ? 'ring-1 ring-inset ring-blue-500/30 bg-blue-500/10' : ''}`}>
            <CreditCard className={`w-6 h-6 mb-2 ${s.connectivity.nfc ? 'text-blue-500' : 'text-theme-secondary'}`} />
            <span className="text-sm font-bold text-theme-primary">NFC</span>
            <span className="text-[10px] text-theme-secondary uppercase font-bold mt-1">{s.connectivity.nfc ? 'Tap to Pay' : 'Not Supported'}</span>
          </div>
          <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center border border-theme bg-theme-surface ${s.build.ipRating ? 'ring-1 ring-inset ring-cyan-500/30 bg-cyan-500/10' : ''}`}>
            <ShieldCheck className={`w-6 h-6 mb-2 ${s.build.ipRating ? 'text-cyan-500' : 'text-theme-secondary'}`} />
            <span className="text-sm font-bold text-theme-primary">{s.build.ipRating || 'None'}</span>
            <span className="text-[10px] text-theme-secondary uppercase font-bold mt-1">Durability</span>
          </div>
        </div>
      </>
    );
  };

  const renderLaptopCards = () => {
    const s = phone.specs;
    return (
      <>
        {/* Core Display & OS */}
        <BentoCard className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2 text-indigo-500">
            <Monitor className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Display</span>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-theme-primary">{s.display.size}"</span>
            <p className="text-sm font-medium text-theme-secondary mt-1">{s.display.resolution}</p>
            <p className="text-[10px] font-semibold text-theme-secondary mt-1 uppercase">{s.display.panelType} • {s.display.refreshRate}Hz</p>
          </div>
        </BentoCard>

        <BentoCard className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Settings className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">OS</span>
          </div>
          <div className="flex flex-col justify-center h-full pb-6">
            <span className="text-2xl font-extrabold text-theme-primary">{s.os.preinstalledOS}</span>
          </div>
        </BentoCard>

        <BentoCard className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
            <Battery className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Battery</span>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-theme-primary">{s.battery.capacityWh}</span>
            <span className="text-lg font-bold text-theme-secondary ml-1">Wh</span>
            <p className="text-sm font-medium text-theme-secondary mt-1">Up to {s.battery.claimedBatteryHours} hrs</p>
          </div>
        </BentoCard>

        {/* Performance (Full Width) */}
        <BentoCard colSpan="col-span-1 md:col-span-2 lg:col-span-3" className="bg-theme-elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-accent-secondary">
                <Cpu className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Processor</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-theme-primary">
                {s.performance.cpuBrand} {s.performance.cpuModel}
              </h3>
              <p className="text-sm font-medium text-theme-secondary mt-1">
                {s.performance.cpuCores} Cores • {s.performance.cpuGeneration}
              </p>
            </div>
            
            <div className="flex-1 border-t md:border-t-0 md:border-l border-theme pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2 mb-2 text-purple-500">
                <Maximize className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Graphics</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-theme-primary">
                {s.performance.gpuModel}
              </h3>
              <p className="text-sm font-medium text-theme-secondary mt-1 capitalize">
                {s.performance.gpuType} • {s.performance.gpuVRAM}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* RAM, Storage, Ports Row */}
        <BentoCard>
          <div className="flex items-center gap-2 mb-2 text-theme-secondary">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Memory</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-theme-primary">{s.performance.ramSize} GB</span>
            <p className="text-sm font-medium text-theme-secondary mt-1">{s.performance.ramType}</p>
            <p className="text-[10px] font-semibold text-theme-secondary mt-1 uppercase">
              Upgradeable: {s.performance.ramUpgradeable}
            </p>
          </div>
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-2 mb-2 text-theme-secondary">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Storage</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-theme-primary">{s.performance.storageCapacity}</span>
            <p className="text-sm font-medium text-theme-secondary mt-1">{s.performance.storageType}</p>
            <p className="text-[10px] font-semibold text-theme-secondary mt-1 uppercase">
              Upgradeable: {s.performance.storageUpgradeable}
            </p>
          </div>
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-2 mb-2 text-theme-secondary">
            <Usb className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Key Ports</span>
          </div>
          <ul className="text-sm font-medium text-theme-primary space-y-1 mt-1">
            {s.ports.usbCCount > 0 && <li>• {s.ports.usbCCount}x USB-C {s.ports.thunderboltSupport === 'yes' ? '(Thunderbolt)' : ''}</li>}
            {s.ports.usbACount > 0 && <li>• {s.ports.usbACount}x USB-A</li>}
            {s.ports.hdmiPort === 'yes' && <li>• HDMI</li>}
            {s.ports.sdCardSlot === 'yes' && <li>• SD Card Reader</li>}
          </ul>
        </BentoCard>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 mt-12">
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-between mb-2">
        <h2 className="text-xl font-extrabold text-theme-primary tracking-tight font-display">At a Glance Specs</h2>
      </div>

      {isLaptop ? renderLaptopCards() : renderPhoneCards()}
      
      {/* Universal Pricing Card */}
      <BentoCard colSpan="col-span-1 md:col-span-2 lg:col-span-3">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-theme-primary uppercase tracking-wider">Pricing & Availability</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-theme bg-theme-surface p-4 flex flex-col justify-center items-center text-center">
               <span className="text-[10px] font-bold text-theme-secondary uppercase mb-1">MSRP</span>
               <span className="text-xl font-bold text-theme-primary tabular-nums">
                 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(phone.price.mrp)}
               </span>
            </div>
            
            <a href={phone.affiliateLinks.amazon} target="_blank" rel="sponsored noopener" className="rounded-lg border border-theme bg-theme-surface hover:bg-amber-500/5 hover:border-amber-500/30 p-4 flex flex-col justify-center items-center text-center transition-all group cursor-pointer">
               <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 mb-2">Amazon</span>
               <span className="text-xl font-black text-theme-primary tabular-nums group-hover:text-amber-500 transition-colors">
                 {phone.price.amazonPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(phone.price.amazonPrice) : 'Out of Stock'}
               </span>
               <span className="text-[10px] text-theme-secondary mt-2 underline decoration-theme-secondary/30 underline-offset-2">Buy on Amazon →</span>
            </a>

            <a href={phone.affiliateLinks.flipkart} target="_blank" rel="sponsored noopener" className="rounded-lg border border-theme bg-theme-surface hover:bg-blue-500/5 hover:border-blue-500/30 p-4 flex flex-col justify-center items-center text-center transition-all group cursor-pointer">
               <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30 mb-2">Flipkart</span>
               <span className="text-xl font-black text-theme-primary tabular-nums group-hover:text-blue-500 transition-colors">
                 {phone.price.flipkartPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(phone.price.flipkartPrice) : 'Out of Stock'}
               </span>
               <span className="text-[10px] text-theme-secondary mt-2 underline decoration-theme-secondary/30 underline-offset-2">Buy on Flipkart →</span>
            </a>
         </div>
      </BentoCard>
    </div>
  );
}
