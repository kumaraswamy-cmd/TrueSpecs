'use client';

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollRestoration({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset scroll position to top on every route change
    window.scrollTo(0, 0);

    // Timeout ensures scroll is reset after React finishes DOM layout calculation
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
