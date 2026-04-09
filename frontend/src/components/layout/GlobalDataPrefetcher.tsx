"use client";

import useSWR from "swr";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

/**
 * GlobalDataPrefetcher
 * 
 * This component runs in the background of the dashboard layout.
 * It prefetches core application data into the SWR cache so that 
 * navigating between menus is instantaneous and "no-reload".
 */
export function GlobalDataPrefetcher() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !authLoading && !!user;
  const isAdmin = isAuthenticated && ['admin', 'tenant_owner'].includes(user.role.name);
  const isMember = isAuthenticated && user.role.name === 'member';

  // Constants for stable prefetching
  const prefetchOptions = { 
    refreshInterval: 0, // No auto-refresh for background prefetch
    revalidateOnFocus: false, 
    dedupingInterval: 60000 
  };

  // 1. Admin/Tenant Owner Core Lists
  useSWR(
    isAdmin ? `/books?q=&category_id=&page=1` : null,
    () => apiService.books.list({ updated_after: '', q: '' }),
    prefetchOptions
  );

  useSWR(
    isAdmin ? ['/members', '', 'all'] : null,
    () => apiService.members.list({ updated_after: '', q: '' }),
    prefetchOptions
  );

  useSWR(
    isAdmin ? ['/loans/active', ''] : null,
    () => apiService.borrowings.list({ status: 'borrowed', updated_after: '', q: '' }),
    prefetchOptions
  );

  // 2. Member/Common Dashboard Stats
  useSWR(
    isAuthenticated ? '/borrowings/stats' : null,
    apiService.fetcher,
    prefetchOptions
  );

  useSWR(
    isMember ? '/borrowings?status=active&limit=50' : null,
    apiService.fetcher,
    prefetchOptions
  );

  // 2b. Pre-warm Borrowed Books page (shared key with useBorrowedBooks)
  useSWR(
    isMember ? '/borrowings' : null,
    () => apiService.borrowings.list(),
    prefetchOptions
  );

  // 2c. Pre-warm History page (shared key with useBorrowingHistory)
  useSWR(
    isMember ? '/borrowings?status=returned&items=100' : null,
    () => apiService.borrowings.list({ status: 'returned', items: "100" }),
    prefetchOptions
  );

  // 3. Communications & Categories
  useSWR(
    isAuthenticated ? '/categories' : null,
    () => apiService.categories.list(),
    prefetchOptions
  );

  // 4. Pre-warm common recommendations for Dashboard
  useSWR(
    isMember ? '/borrowings?status=returned&limit=20' : null,
    apiService.fetcher,
    prefetchOptions
  );

  useSWR(
    isMember ? '/books?limit=50' : null,
    apiService.fetcher,
    prefetchOptions
  );

  return null;
}
