"use client";

import { useEffect } from "react";
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

  // 1. Books - Must match TenantCatalog default: ['', null, '', 'all']
  useSWR(
    isAuthenticated ? ['/books', null, '', 'all'] : null,
    () => apiService.books.list({ updated_after: '', q: '' }),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // 2. Members
  useSWR(
    isAuthenticated ? ['/members', null, '', 'all'] : null,
    () => apiService.members.list({ updated_after: '', q: '' }),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // 3. Active Loans
  useSWR(
    isAuthenticated ? ['/loans/active', null, ''] : null,
    () => apiService.borrowings.list({ status: 'borrowed', updated_after: '', q: '' }),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // 4. Pending Returns
  useSWR(
    isAuthenticated ? ['/loans/return_pending', null] : null,
    () => apiService.borrowings.list({ status: 'return_pending', updated_after: '' }),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // 5. Loan Requests (Process)
  useSWR(
    isAuthenticated ? ['/loans/pending', null] : null,
    () => apiService.borrowings.list({ status: 'pending', updated_after: '' }),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // 6. Activity Logs
  useSWR(
    isAuthenticated ? ['/activity_logs', null, '', '', '', ''] : null,
    () => apiService.auditLogs.list({ updated_after: '' }),
    { refreshInterval: 60000, revalidateOnFocus: true }
  );

  // 7. Categories
  useSWR(
    isAuthenticated ? '/categories' : null,
    () => apiService.categories.list(),
    { refreshInterval: 60000, revalidateOnFocus: true }
  );

  return null; // Background component
}
