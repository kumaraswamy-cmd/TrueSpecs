import React from 'react';

interface TrueSpecsLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

export default function TrueSpecsLogo({
  size = 'md',
  showWordmark = true,
  className = '',
}: TrueSpecsLogoProps) {
  const sizeMap = {
    xs: { box: 'h-6 w-6', text: 'text-sm' },
    sm: { box: 'h-7 w-7', text: 'text-base' },
    md: { box: 'h-8 w-8 sm:h-9 sm:w-9', text: 'text-lg sm:text-xl' },
    lg: { box: 'h-10 w-10 sm:h-11 sm:w-11', text: 'text-2xl' },
    xl: { box: 'h-12 w-12 sm:h-14 sm:w-14', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 2D Vector Symbol Badge */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-md shadow-blue-500/20 border border-blue-400/30 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300 ${currentSize.box}`}
        aria-label="TrueSpecs Logo"
      >
        {/* Subtle geometric precision grid & optics crosshair */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Outer Optics Crosshairs */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line
            x1="16"
            y1="2.5"
            x2="16"
            y2="6"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="16"
            y1="26"
            x2="16"
            y2="29.5"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="2.5"
            y1="16"
            x2="6"
            y2="16"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="16"
            x2="29.5"
            y2="16"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Geometric 'T' & 'S' Interlocking Monogram */}
          {/* 'T' Horizontal Bar */}
          <path
            d="M 8 10 H 24"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* 'T' Stem merged with 'S' flow */}
          <path
            d="M 16 10 V 16 C 16 19 21.5 19 21.5 22.5 C 21.5 25 19 26 16 26 C 12.5 26 10.5 24.5 10 23"
            stroke="#93C5FD"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Precision Focus Dot */}
          <circle cx="16" cy="10" r="1.2" fill="#FFFFFF" />
        </svg>

        {/* Dynamic ambient highlight */}
        <span className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white/20 blur-xs pointer-events-none" />
      </div>

      {/* Modern Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight text-theme-primary font-display flex items-center ${currentSize.text}`}
          >
            True
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent ml-0.5">
              Specs
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
