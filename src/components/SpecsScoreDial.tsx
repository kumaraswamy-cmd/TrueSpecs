'use client';

import React, { useEffect, useState } from 'react';

interface SpecsScoreDialProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function SpecsScoreDial({ score, size = 'md' }: SpecsScoreDialProps) {
  // Use state to track progress for the on-load animation
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // A small delay ensures the animation triggers after initial render
    const timer = setTimeout(() => {
      setProgress(score);
    }, 50);
    return () => clearTimeout(timer);
  }, [score]);

  // Standardized configuration for different sizes
  const config = {
    sm: { size: 60, strokeWidth: 4.5, fontSize: 'text-[16px]' },
    md: { size: 80, strokeWidth: 6, fontSize: 'text-[24px]' },
    lg: { size: 130, strokeWidth: 9, fontSize: 'text-[40px]' },
  }[size];

  const getDialColor = (s: number) => {
    if (s >= 75) return 'stroke-success';
    if (s >= 35) return 'stroke-warning';
    return 'stroke-danger';
  };
  
  const strokeColor = getDialColor(score);

  const center = config.size / 2;
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Calculate the animated offset based on the current progress state
  const animatedOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center font-display select-none">
      <svg 
        width={config.size} 
        height={config.size} 
        className="transform -rotate-90 overflow-visible"
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="stroke-theme/10"
          strokeWidth={config.strokeWidth}
          fill="none"
        />

        {/* Progress Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className={strokeColor}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animatedOffset}
          style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`${config.fontSize} font-black text-theme-primary leading-none tracking-tight tabular-nums`}>
          {score}
        </span>
        {size === 'lg' && (
          <span className="text-[10px] text-theme-secondary font-bold uppercase tracking-wider mt-1.5">
            SCORE
          </span>
        )}
      </div>
    </div>
  );
}

