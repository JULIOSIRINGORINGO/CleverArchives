"use client";

import { useMemo, useState, useRef } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";

const DEFAULT_TARGET_READING_GOAL = 12;

/**
 * useDashboardStats — Fetch KPI stats and incremental borrowings.
 * Optimized with Stable Keys to prevent Infinite Request Loops.
 */
export function useDashboardStats() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const syncLock = useRef(false);

  // 1. Static Stats
  const { data: statsData, isLoading: statsLoading } = useSWR('/borrowings/stats', apiService.fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000, // 10s deduplication
  });

  // 2. Active Borrowings - STABLE KEY (No more lastSync dependency in URL)
  useSWR(
    '/borrowings?status=active&limit=50', 
    apiService.fetcher, 
    {
      refreshInterval: 30000, // Sync every 30s instead of storming
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onSuccess: (newData) => {
        // Prevent infinite loop by not using any reactive triggers in the key
        if (newData?.data && !syncLock.current) {
          syncLock.current = true;
          setBorrowings(newData.data);
          // Release lock on next tick if needed, but here we just replace the whole array 
          // to keep it simple and fast for dashboard
          setTimeout(() => { syncLock.current = false; }, 100);
        }
      }
    }
  );

  const { dueSoonCount, overdueCount } = useMemo(() => {
    // Prefer server-side counts for instant response
    if (statsData?.dueSoonCount !== undefined && statsData?.overdueCount !== undefined) {
      return { 
        dueSoonCount: statsData.dueSoonCount, 
        overdueCount: statsData.overdueCount 
      };
    }

    // Fallback to client-side calc if server doesn't provide it yet
    let soon = 0;
    let overdue = 0;
    const now = new Date().getTime();
    
    borrowings.forEach((b: any) => {
      if (!b.due_date) return;
      const diffDays = Math.ceil((new Date(b.due_date).getTime() - now) / 86400000);
      
      if (diffDays < 0) overdue++;
      else if (diffDays <= 2) soon++;
    });

    return { dueSoonCount: soon, overdueCount: overdue };
  }, [borrowings, statsData]);

  const mustReturnTotal = dueSoonCount + overdueCount;
  const historyCount = statsData?.historyCount || 0;
  
  const readingGoal = DEFAULT_TARGET_READING_GOAL;
  const readingGoalProgress = useMemo(() => {
    if (readingGoal <= 0) return 0;
    return Math.min((historyCount / readingGoal) * 100, 100);
  }, [historyCount, readingGoal]);

  return {
    stats: {
      activeBorrowings: statsData?.activeCount || 0,
      historyCount,
      dueSoonCount,
      overdueCount,
      mustReturnTotal,
      readingGoal,
      readingGoalProgress
    },
    borrowings,
    loading: !statsData && borrowings.length === 0,
    statsLoading
  };
}

/**
 * useSmartRecommendations — Personalized book logic.
 */
export function useSmartRecommendations() {
  const { data: historyData } = useSWR('/borrowings?status=returned&limit=20', apiService.fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000
  });

  const { data: allBooksData, isLoading: loading } = useSWR('/books?limit=50', apiService.fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000
  });

  const recommendations = useMemo(() => {
    const rawBooks = Array.isArray(allBooksData) ? allBooksData : (allBooksData?.data || []);
    const history = Array.isArray(historyData) ? historyData : (historyData?.data || []);

    if (rawBooks.length === 0) return [];
    if (history.length === 0) return [...rawBooks].sort((a, b) => (b.rent_count || 0) - (a.rent_count || 0)).slice(0, 8);

    const catCounts: Record<string, number> = {};
    history.forEach((h: any) => {
      const catName = h.book?.category?.name || "Uncategorized";
      catCounts[catName] = (catCounts[catName] || 0) + 1;
    });

    const top4Cats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0]);
    const recs: any[] = [];
    const seenIds = new Set();

    top4Cats.forEach(catName => {
      rawBooks
        .filter((b: any) => (b.category?.name || "Uncategorized") === catName)
        .sort((a: any, b: any) => (b.rent_count || 0) - (a.rent_count || 0))
        .slice(0, 2)
        .forEach((b: any) => {
          if (!seenIds.has(b.id)) { recs.push(b); seenIds.add(b.id); }
        });
    });

    if (recs.length < 8) {
      rawBooks
        .sort((a: any, b: any) => (b.rent_count || 0) - (a.rent_count || 0))
        .filter((b: any) => !seenIds.has(b.id))
        .slice(0, 8 - recs.length)
        .forEach((b: any) => recs.push(b));
    }
    return recs.slice(0, 10);
  }, [allBooksData, historyData]);

  return { recommendations, loading };
}

/**
 * useReadingActivity — Chart processing logic.
 */
export function useReadingActivity(borrowings: any[]) {
  const t = useTranslations("Dashboard");
  const [timeRange, setTimeRange] = useState("week");

  const chartData = useMemo(() => {
    const today = new Date();
    if (timeRange === "month") {
      const weekCounts = [0, 0, 0, 0];
      borrowings.forEach((b: any) => {
        if (b.borrow_date) {
           const diffDays = Math.ceil((today.getTime() - new Date(b.borrow_date).getTime()) / 86400000);
           if (diffDays >= 0 && diffDays <= 28) {
             const wIdx = Math.floor((28 - diffDays) / 7);
             if (wIdx >= 0 && wIdx <= 3) weekCounts[wIdx]++;
           }
        }
      });
      return [1, 2, 3, 4].map((num, i) => ({ name: t("week_format", { num, fallback: `W${num}` }), count: weekCounts[i] }));
    } else if (timeRange === "year") {
      const monthlyCounts: Record<string, number> = {};
      const monNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthlyCounts[monNames[d.getMonth()]] = 0;
      }
      borrowings.forEach((b: any) => {
        if (b.borrow_date) {
           const d = new Date(b.borrow_date);
           if (d >= new Date(today.getFullYear(), today.getMonth() - 11, 1)) {
             const key = monNames[d.getMonth()];
             if (monthlyCounts[key] !== undefined) monthlyCounts[key]++;
           }
        }
      });
      return Object.keys(monthlyCounts).map(k => ({ name: t(`month_${k}`, { fallback: k }), count: monthlyCounts[k] }));
    } else { 
      const dailyCounts: Record<string, { name: string, count: number }> = {};
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dailyCounts[d.toISOString().split('T')[0]] = { name: t(`day_${dayNames[d.getDay()]}`, { fallback: dayNames[d.getDay()] }), count: 0 };
      }
      borrowings.forEach((b: any) => {
        if (b.borrow_date) {
           const dateStr = b.borrow_date.split('T')[0];
           if (dailyCounts[dateStr]) dailyCounts[dateStr].count++;
        }
      });
      return Object.values(dailyCounts);
    }
  }, [timeRange, borrowings, t]);

  const timeRangeOptions = [
    { id: "week", label: t("range_week") },
    { id: "month", label: t("range_month") },
    { id: "year", label: t("range_year") },
  ];

  return { chartData, timeRange, setTimeRange, timeRangeOptions };
}
