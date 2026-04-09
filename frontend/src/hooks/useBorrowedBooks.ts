"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import { useToast } from "@/components/ui/Toast";

export const BORROW_STATUS = {
  PENDING: "pending",
  RETURN_PENDING: "returning",
  BORROWED: "borrowed",
  OVERDUE: "overdue",
} as const;

/**
 * useBorrowedBooks - Domain-Specific Hook for Member Borrowings.
 * 
 * MIGRATED to SWR for automatic request deduplication.
 * This prevents the "Request Storm" where the GlobalDataPrefetcher
 * and this hook both fire separate requests to the same endpoint.
 * 
 * SWR Key: '/borrowings'
 * Deduplication: 30s window — identical requests within 30s are merged.
 */
export function useBorrowedBooks() {
  const t = useTranslations("Borrowed");
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "overdue">("all");
  const [viewMode, setInnerViewMode] = useState<'standard' | 'compact'>(() => {
    if (typeof window === 'undefined') return 'compact';
    const stored = localStorage.getItem('v');
    return (stored === 'standard' || stored === 'compact') ? stored : 'compact';
  });

  // SWR Fetch — Deduplicated, cached, and shared across components
  const { data: borrowingsData, isLoading: loading, mutate } = useSWR(
    '/borrowings',
    () => apiService.borrowings.list(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30s — prevent duplicate requests
    }
  );

  // Persistence Tier
  const setViewMode = useCallback((mode: 'standard' | 'compact') => {
    setInnerViewMode(mode);
    localStorage.setItem('v', mode);
  }, []);

  // Logic Tier: API Actions
  const handleReturn = useCallback(async (id: string) => {
    try {
      await apiService.borrowings.requestReturn(id);
      toast(t("returnSuccess"), "success");
      mutate(); // SWR revalidation — no manual setState needed
    } catch (e: any) {
      toast(e.message || "Failed to request return", "error");
    }
  }, [mutate, t, toast]);

  // Data Extraction Tier (Safe Array Extraction)
  const borrowings = useMemo(() => {
    if (!borrowingsData) return [];
    const data = Array.isArray(borrowingsData) 
      ? borrowingsData 
      : (borrowingsData.data || borrowingsData.borrowings || []);
    return data as any[];
  }, [borrowingsData]);

  // Transformation Tier (Filtering & Grouping)
  const filtered = useMemo(() => {
    return borrowings.filter((b: any) => {
      const title = b.book_copy?.book?.title || b.book?.title || "";
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
      
      const status = b.status?.toLowerCase() || "";

      if (filter === "all") return matchesSearch;
      
      // PENDING/TERJADWAL: Includes initial requests and return requests
      if (filter === "pending") {
        const isScheduled = matchesSearch && (
          status === "pending" || 
          status === "returning" || 
          status === "return_pending" || 
          status === "request_return" ||
          status === "request"
        );
        return isScheduled;
      }
      
      // ACTIVE/AKTIF: Currently borrowed books
      if (filter === "active") {
        return matchesSearch && status === "borrowed";
      }
      
      // OVERDUE/TERLAMBAT: Overdue books
      if (filter === "overdue") {
        return matchesSearch && status === "overdue";
      }
      
      return matchesSearch;
    });
  }, [borrowings, search, filter]);

  const groups = useMemo(() => {
    const result: any[] = [];
    const processedBatchIds = new Set();

    filtered.forEach((b: any) => {
      if (b.batch_id && !processedBatchIds.has(b.batch_id)) {
        const batchItems = filtered.filter((item: any) => item.batch_id === b.batch_id);
        result.push({
          type: 'group',
          groupId: b.batch_id,
          borrowings: batchItems
        });
        processedBatchIds.add(b.batch_id);
      } else if (!b.batch_id) {
        result.push({
          type: 'single',
          borrowings: [b]
        });
      }
    });

    return result;
  }, [filtered]);

  return {
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    viewMode,
    setViewMode,
    groups,
    fetch: () => mutate(), // Compatible API — now triggers SWR revalidation
    handleReturn
  };
}
