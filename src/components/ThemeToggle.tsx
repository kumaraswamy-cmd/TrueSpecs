'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 p-2 rounded-lg border border-theme bg-theme-surface/50 opacity-50 flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-theme-secondary/30" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors flex items-center justify-center border border-theme cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="w-4.5 h-4.5 text-amber-400 stroke-[1.8]" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-accent stroke-[1.8]" />
      )}
    </button>
  );
}
