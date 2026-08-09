'use client';

import { useEffect } from 'react';

export default function ScrollToTop() {
  useEffect(() => {
    // Reset scroll position to top
    window.scrollTo(0, 0);
  }, []);

  return null;
}
