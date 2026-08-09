'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlistIds: string[];
  isMounted: boolean;
  toggleWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Load from localStorage on mount (runs client-side only after initial render pass)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const saved = localStorage.getItem('truespecs_wishlist');
      if (saved) {
        try {
          setWishlistIds(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading wishlist state', e);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when changed
  const updateSelected = (ids: string[]) => {
    setWishlistIds(ids);
    localStorage.setItem('truespecs_wishlist', JSON.stringify(ids));
  };

  const toggleWishlist = (id: string) => {
    if (wishlistIds.includes(id)) {
      updateSelected(wishlistIds.filter(x => x !== id));
    } else {
      updateSelected([...wishlistIds, id]);
    }
  };

  const clearWishlist = () => {
    updateSelected([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isMounted, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
