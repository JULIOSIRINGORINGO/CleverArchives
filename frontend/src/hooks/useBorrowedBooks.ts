"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
 * Encapsulates: Logic (onReturn), Lifecycle (useEffect), and Persistence (localStorage).
 */
export function useBorrowedBooks() {
  const t = useTranslations("Borrowed");
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [borrowingsData, setBorrowingsData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "overdue">("all");
  const [viewMode, setInnerViewMode] = useState<'standard' | 'compact'>('standard');

  // Persistence Tier
  const setViewMode = useCallback((mode: 'standard' | 'compact') => {
    setInnerViewMode(mode);
    localStorage.setItem('v', mode);
  }, []);

  // Logic Tier: API Actions
  const fetch = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await apiService.borrowings.list();
      setBorrowingsData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReturn = useCallback(async (id: string) => {
    try {
      await apiService.borrowings.requestReturn(id);
      toast(t("returnSuccess"), "success");
      fetch(true); // Silent refresh
    } catch (e: any) {
      toast(e.message || "Failed to request return", "error");
    }
  }, [fetch, t, toast]);

  // Lifecycle Tier
  useEffect(() => {
    fetch();
    const stored = localStorage.getItem('v');
    if (stored === 'standard' || stored === 'compact') {
      setInnerViewMode(stored);
    }
  }, [fetch]);

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
      
      // Categorization Logic:
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
    fetch,
    handleReturn
  };
}
