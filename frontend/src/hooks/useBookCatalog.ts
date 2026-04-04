"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { apiService } from "@/services/api";

interface UseBookCatalogOptions {
  initialFilter?: string;
  initialSearch?: string;
}

/**
 * useBookCatalog — Encapsulates book fetching, searching, filtering, and pagination.
 */
export function useBookCatalog(options: UseBookCatalogOptions = {}) {
  const [search, setSearch] = useState(options.initialSearch || "");
  const [filter, setFilter] = useState(options.initialFilter || "all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Categories
  const { data: categoriesData, isLoading: loadingCategories } = useSWR('/categories', apiService.fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  });

  const categories = useMemo(() => {
    const data = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoriesData]);

  // Fetch Books with searching/filtering/pagination
  const fetchUrl = useMemo(() => {
    let url = `/books?page=${page}`;
    if (search) url += `&query=${encodeURIComponent(search)}`;
    if (filter === 'physical' || filter === 'ebook') {
      url += `&filter=${filter}`;
    } else if (filter !== 'all') {
      url += `&category_id=${filter}`;
    }
    return url;
  }, [page, search, filter]);

  const { data: booksResponse, isLoading: loading, error, mutate } = useSWR(fetchUrl, apiService.fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 500
  });

  const books = useMemo(() => {
    return Array.isArray(booksResponse) ? booksResponse : (booksResponse?.data || []);
  }, [booksResponse]);

  // Handle Total Pages (requires custom extraction from response headers if available via apiService)
  // For now, we'll try to extract it from the response if the backend includes it in the body, 
  // or default to 1 if we can't see the headers here.
  useEffect(() => {
    if (booksResponse?.meta?.total_pages) {
      setTotalPages(booksResponse.meta.total_pages);
    }
  }, [booksResponse]);

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  }, []);

  return {
    books,
    categories,
    loading,
    loadingCategories,
    error: error?.message || null,
    search,
    setSearch: handleSearchChange,
    filter,
    setFilter: handleFilterChange,
    page,
    setPage,
    totalPages,
    viewMode,
    setViewMode,
    refresh: mutate
  };
}

// Internal helper for useMemo
import { useMemo } from "react";
