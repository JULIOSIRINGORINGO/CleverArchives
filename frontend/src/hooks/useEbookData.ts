"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { apiService } from "@/services/api";

export interface Category {
  id: number;
  name: string;
}

export interface Ebook {
  id: number;
  book?: {
    id: number;
    title: string;
    cover_url?: string;
    author?: { name: string };
    category_id?: number;
    category?: Category;
  };
  file_format: string;
  file_size?: string;
  created_at?: string;
}

/**
 * useEbookData - Logic Tier for Ebook Library.
 * Handles state, data fetching, filtering, and navigation.
 */
export function useEbookData() {
  const router = useRouter();
  const locale = useLocale();

  // 1. Data States
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Filter & View States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');

  // 3. Fetching Logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, cRes] = await Promise.all([
        apiService.ebooks.list(),
        apiService.categories.list()
      ]);
      setEbooks(Array.isArray(eRes) ? eRes : []);
      // Handle different API response structures for categories
      setCategories(cRes?.data || cRes || []);
    } catch (err) {
      console.error("Ebook Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 4. Filtering Logic (Memoized)
  const filtered = useMemo(() => {
    return ebooks.filter(e => {
      const q = search.toLowerCase();
      const title = e.book?.title?.toLowerCase() || "";
      const author = e.book?.author?.name?.toLowerCase() || "";
      
      const matchesSearch = title.includes(q) || author.includes(q);
      const matchesFilter = filter === 'all' || 
                           String(e.book?.category_id) === filter || 
                           e.file_format?.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [ebooks, search, filter]);

  // 5. Category Organization
  const { topCategories, restCategories } = useMemo(() => {
    const rawTop = categories.slice(0, 3);
    const rawRest = categories.slice(3);

    return {
      topCategories: rawTop.map(c => ({ id: String(c.id), label: c.name })),
      restCategories: rawRest.map(c => ({ id: String(c.id), label: c.name }))
    };
  }, [categories]);

  // 6. Action Handlers
  const handleRead = useCallback((id: number) => {
    router.push(`/${locale}/ebooks/${id}/viewer`);
  }, [locale, router]);

  const handleResetSearch = useCallback(() => {
    setSearch("");
  }, []);

  return {
    // Data
    ebooks: filtered,
    loading,
    
    // Filters & View
    search,
    setSearch,
    filter,
    setFilter,
    viewMode,
    setViewMode,
    
    // Categories
    topCategories,
    restCategories,
    
    // Actions
    handleRead,
    handleResetSearch,
    refresh: fetchData
  };
}
