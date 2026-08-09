'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import phonesData from '@/data/phones.json';

interface CompareContextType {
  selectedIds: string[];
  isMounted: boolean;
  addPhone: (id: string) => boolean;
  removePhone: (id: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Load from localStorage on mount (runs client-side only after initial render pass)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const saved = localStorage.getItem('truespecs_compare');
      if (saved) {
        try {
          setSelectedIds(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading compare state', e);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when changed
  const updateSelected = (ids: string[]) => {
    setSelectedIds(ids);
    localStorage.setItem('truespecs_compare', JSON.stringify(ids));
  };

  const addPhone = (id: string): boolean => {
    if (selectedIds.includes(id)) return true;
    if (selectedIds.length >= 4) {
      return false; // limit exceeded
    }

    const product = (phonesData as any[]).find(p => p.id === id);
    if (!product) return false;

    if (selectedIds.length > 0) {
      const firstProduct = (phonesData as any[]).find(p => p.id === selectedIds[0]);
      if (firstProduct && (firstProduct.category || 'phone') !== (product.category || 'phone')) {
        alert("You can only compare items within the same category");
        return false;
      }
    }

    updateSelected([...selectedIds, id]);
    return true;
  };

  const removePhone = (id: string) => {
    updateSelected(selectedIds.filter(x => x !== id));
  };

  const clearCompare = () => {
    updateSelected([]);
  };

  return (
    <CompareContext.Provider value={{ selectedIds, isMounted, addPhone, removePhone, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
