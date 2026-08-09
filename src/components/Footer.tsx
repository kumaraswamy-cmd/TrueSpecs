import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-theme bg-theme-elevated py-8 px-4 sm:px-6 lg:px-8 mt-auto text-theme-secondary text-sm transition-colors duration-200">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-white shadow-md shadow-accent/10 text-xs font-display">
            TS
          </span>
          <span className="text-base font-bold text-theme-primary font-display">
            TrueSpecs
          </span>
        </div>
        
        <p className="text-center md:text-left max-w-md text-xs text-theme-secondary">
          Disclaimer: As an Amazon and Flipkart Associate, we earn from qualifying purchases. We track and list outbound links to maintain and support the site.
        </p>

        <div className="flex gap-6 text-xs font-semibold text-theme-secondary">
          <Link href="/phones" className="hover:text-theme-primary transition-colors">Browse Products</Link>
          <Link href="/compare" className="hover:text-theme-primary transition-colors">Compare Tool</Link>
          <span className="opacity-40">|</span>
          <span className="text-theme-secondary">&copy; {new Date().getFullYear()} TrueSpecs</span>
        </div>
      </div>
    </footer>
  );
}
