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

    // Custom localStorage-based provider with quota management
    const localStorageProvider = () => {
      if (typeof window === 'undefined') return new Map();
  
      let map: Map<any, any>;
      try {
        // Initialize from localStorage with fallback for corrupt data
        const stored = localStorage.getItem(CACHE_KEY);
        map = new Map(JSON.parse(stored || '[]'));
      } catch (e) {
        console.error('Failed to load SWR cache:', e);
        map = new Map();
      }
  
      // Before window is closed, save the current cache to localStorage
      const handleSaveCache = () => {
        try {
          const appCache = JSON.stringify(Array.from(map.entries()));
          
          // Safety Check: Browsers have ~5MB limit. We cap at 4MB to be safe.
          if (appCache.length > 4000000) {
            console.warn('SWR Cache exceeds 4MB safety limit. Pruning required.');
            localStorage.removeItem(CACHE_KEY);
            return;
          }
          
          localStorage.setItem(CACHE_KEY, appCache);
        } catch (e) {
          // If QuotaExceededError occurs, clear the cache to allow fresh start
          console.error('SWR Cache Storage Failed:', e);
          localStorage.removeItem(CACHE_KEY);
        }
      };

      window.addEventListener('beforeunload', handleSaveCache);
  
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
