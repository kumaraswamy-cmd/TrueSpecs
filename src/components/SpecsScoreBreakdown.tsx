'use client';

import React, { useState } from 'react';
import { SpecsScoreBreakdown as ScoreBreakdownType } from '@/utils/specsScore';
import SpecsScoreDial from '@/components/SpecsScoreDial';

interface SpecsScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
}

export default function SpecsScoreBreakdown({ breakdown }: SpecsScoreBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success border-success-border bg-success-bg';
    if (score >= 35) return 'text-warning border-warning-border bg-warning-bg';
    return 'text-danger border-danger-border bg-danger-bg';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 75) return 'bg-success';
    if (score >= 35) return 'bg-warning';
    return 'bg-danger';
  };

  const subScores = [
    { label: 'Performance', val: breakdown.performance.score, desc: breakdown.performance.details, weight: '30%' },
    { label: 'Display Quality', val: breakdown.display.score, desc: breakdown.display.details, weight: '20%' },
    { label: 'Camera Capability', val: breakdown.camera.score, desc: breakdown.camera.details, weight: '25%' },
    { label: 'Battery & Power', val: breakdown.battery.score, desc: breakdown.battery.details, weight: '15%' },
    { label: 'Build & Connectivity', val: breakdown.buildConnectivity.score, desc: breakdown.buildConnectivity.details, weight: '10%' },
  ];

  return (
    <div className="rounded-xl border border-theme bg-theme-surface p-6 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-8 flex-wrap md:flex-nowrap">
        {/* Radial overall score */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <SpecsScoreDial score={breakdown.overall} size="lg" />
        </div>
 
        {/* Text information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold text-theme-primary font-display">TrueSpecs Computed Score</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getScoreColor(breakdown.overall)}`}>
              {breakdown.overall >= 75 ? 'Excellent' : breakdown.overall >= 35 ? 'Average' : 'Subpar'}
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-2 leading-relaxed font-normal">
            {breakdown.explanation}
          </p>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mt-3.5 flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-bold transition-colors"
          >
            <span>{isOpen ? 'Hide' : 'Expand'} sub-score breakdown</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Subscores breakdown list */}
      {isOpen && (
        <div className="mt-6 border-t border-theme pt-5 space-y-5 animate-slide-up">
          {subScores.map((sub, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-theme-primary">{sub.label}</span>
                  <span className="text-[10px] text-theme-secondary font-semibold">({sub.weight} weight)</span>
                </div>
                <span className="font-extrabold text-theme-primary tabular-nums">{sub.val}/100</span>
              </div>
              <div className="h-1.5 w-full rounded bg-theme-elevated overflow-hidden border border-theme">
                <div
                  className={`h-full rounded transition-all duration-500 ${getScoreProgressColor(sub.val)}`}
                  style={{ width: `${sub.val}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-theme-secondary leading-normal pl-0.5 font-normal">{sub.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
