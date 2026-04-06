"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
 * Encapsulates Logic, Lifecycle, and Persistence as per SOP v5.6.0.
 */
export function useBorrowingHistory() {
  const [borrowingsData, setBorrowingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [viewMode, setInnerViewMode] = useState<HistoryViewMode>('compact');

  // Persistence Tier
  const setViewMode = useCallback((mode: HistoryViewMode) => {
    setInnerViewMode(mode);
    localStorage.setItem('h_view', mode);
  }, []);

  // Logic Tier: API Actions
  const fetch = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Fetch only returned books for history
      const res = await apiService.borrowings.list({ status: 'returned', items: "100" });
      setBorrowingsData(res);
    } catch (e) {
      console.error("Failed to fetch borrowing history:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lifecycle Tier
  useEffect(() => {
    fetch();
    const stored = localStorage.getItem('h_view');
    if (stored === 'standard' || stored === 'compact') {
      setInnerViewMode(stored);
    }
  }, [fetch]);

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
    refresh: fetch
  };
}
