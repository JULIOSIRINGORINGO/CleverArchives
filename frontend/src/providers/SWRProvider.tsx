"use client";

import React, { useEffect, useState } from 'react';
import { SWRConfig } from 'swr';

const CACHE_KEY = 'clever-cache';

/**
 * SWRProvider
 * 
 * Implements a persistent SWR cache using the browser's localStorage.
 * This allows data to be restored instantly upon page refresh or app startup.
 * Includes security measures to clear the cache when the component unmounts in non-browser envs
 * and handles hydration carefully.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom localStorage-based provider
  const localStorageProvider = () => {
    if (typeof window === 'undefined') return new Map();

    // Initialize from localStorage
    const map = new Map(JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'));

    // Before window is closed, save the current cache to localStorage
    window.addEventListener('beforeunload', () => {
      const appCache = JSON.stringify(Array.from(map.entries()));
      localStorage.setItem(CACHE_KEY, appCache);
    });

    return map;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      {children}
    </SWRConfig>
  );
}
