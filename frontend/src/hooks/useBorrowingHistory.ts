"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { apiService } from "@/services/api";

export type HistoryViewMode = 'standard' | 'compact';
export type HistoryFilter = 'all' | 'oldest';

interface Book { 
  id: string; 
  title: string; 
  cover_url?: string; 
  author?: { name: string }; 
}

interface Borrowing { 
  id: string; 
  created_at: string; 
  updated_at?: string; 
  status: string; 
  book_copy?: { book?: Book }; 
}

/**
 * useBorrowingHistory - Domain Hook for member borrowing history.
 * 
 * MIGRATED to SWR for automatic request deduplication.
 * This prevents the "Request Storm" where multiple components
 * or the GlobalDataPrefetcher trigger duplicate API calls.
 * 
 * SWR Key: '/borrowings?status=returned&items=100'
 * Deduplication: 30s window — identical requests within 30s are merged.
 */
export function useBorrowingHistory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [viewMode, setInnerViewMode] = useState<HistoryViewMode>(() => {
    if (typeof window === 'undefined') return 'compact';
    const stored = localStorage.getItem('h_view');
    return (stored === 'standard' || stored === 'compact') ? stored : 'compact';
  });

  // SWR Fetch — Deduplicated, cached, and shared across components
  const { data: borrowingsData, isLoading: loading, mutate } = useSWR(
    '/borrowings?status=returned&items=100',
    () => apiService.borrowings.list({ status: 'returned', items: "100" }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30s — prevent duplicate requests
    }
  );

  // Persistence Tier
  const setViewMode = useCallback((mode: HistoryViewMode) => {
    setInnerViewMode(mode);
    localStorage.setItem('h_view', mode);
  }, []);

  // Data Extraction Tier (Safe handling of various API response shapes)
  const allBorrowings = useMemo(() => {
    if (!borrowingsData) return [];
    const data = Array.isArray(borrowingsData) 
      ? borrowingsData 
      : (borrowingsData.data || borrowingsData.borrowings || []);
    return data as Borrowing[];
  }, [borrowingsData]);

  // Transformation Tier (Filtering & Sorting)
  const history = useMemo(() => {
    return [...allBorrowings]
      .filter(b => {
        const query = search.toLowerCase();
        const book = b.book_copy?.book;
        if (!query) return true;
        
        return (
          book?.title?.toLowerCase().includes(query) || 
          book?.author?.name?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return filter === 'oldest' ? dateA - dateB : dateB - dateA;
      });
  }, [allBorrowings, search, filter]);

  return {
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    viewMode,
    setViewMode,
    history,
    refresh: () => mutate()
  };
}
