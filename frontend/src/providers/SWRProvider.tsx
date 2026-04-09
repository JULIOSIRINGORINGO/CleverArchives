"use client";

import React, { useEffect, useState, useRef } from 'react';
import { SWRConfig } from 'swr';
import { apiService } from '@/services/api';

const CACHE_KEY = 'clever-cache';
const MAX_CACHE_SIZE = 4000000; // 4MB safety limit

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const cacheRef = useRef<Map<any, any> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize cache provider - only once
  const getProvider = () => {
    if (typeof window === 'undefined') return new Map();
    if (cacheRef.current) return cacheRef.current;

    let map: Map<any, any>;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      map = new Map(JSON.parse(stored || '[]'));
    } catch (e) {
      console.error('SWR Cache Init Failed:', e);
      map = new Map();
    }

    cacheRef.current = map;

    // Efficient persistence: Save on visibility change or beforeunload
    const persistCache = () => {
      if (!cacheRef.current) return;
      try {
        const appCache = JSON.stringify(Array.from(cacheRef.current.entries()));
        if (appCache.length > MAX_CACHE_SIZE) {
          localStorage.removeItem(CACHE_KEY);
        } else {
          localStorage.setItem(CACHE_KEY, appCache);
        }
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    };

    window.addEventListener('beforeunload', persistCache);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') persistCache();
    });

    return map;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SWRConfig
      value={{
        provider: getProvider,
        fetcher: apiService.fetcher, // GLOBAL FETCHER: Injected for all SWR calls
        revalidateOnFocus: false,     // Performance: Only manually refresh or on component mount
        revalidateIfStale: true,     // User Experience: Show old data while fetching
        revalidateOnReconnect: true,
        dedupingInterval: 10000,      // Performance: Prevention of duplicate requests within 10s
        errorRetryCount: 2,
        shouldRetryOnError: true,
        compare: (a, b) => JSON.stringify(a) === JSON.stringify(b) // Stability: Prevent re-renders on identical data
      }}
    >
      {children}
    </SWRConfig>
  );
}
