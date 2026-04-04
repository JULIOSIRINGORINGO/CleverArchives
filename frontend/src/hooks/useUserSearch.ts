"use client";

import { useState, useCallback, useEffect } from "react";
import { apiService } from "@/services/api";

export interface UserSearchResult {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

/**
 * useUserSearch - Standardized hook for searching users in the system.
 * Extracted from ComposeForm to comply with "No Direct Fetching in UI" rules.
 */
export function useUserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.users.search(q);
      setResults(response.data || []);
    } catch (error) {
      console.error("User search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) search(query);
      else setResults([]);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    clearResults: () => setResults([])
  };
}
