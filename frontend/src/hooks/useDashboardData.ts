"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";

/**
 * useDashboardStats — Fetch KPI stats and incremental borrowings.
 */
export function useDashboardStats() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const { data: statsData, isLoading: statsLoading } = useSWR('/borrowings/stats', apiService.fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  useSWR(
    `/borrowings?status=active${lastSync ? `&updated_after=${lastSync}` : ''}`, 
    apiService.fetcher, 
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onSuccess: (newData) => {
        if (newData?.data) {
          setBorrowings(prev => {
            const merged = [...prev];
            newData.data.forEach((item: any) => {
              const idx = merged.findIndex(p => p.id === item.id);
              if (idx > -1) merged[idx] = item;
              else merged.unshift(item);
            });
            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          setLastSync(new Date().toISOString());
        }
      }
    }
  );

  const dueSoonCount = useMemo(() => {
    return borrowings.filter((b: any) => {
      if (!b.due_date) return false;
      const diffDays = Math.ceil((new Date(b.due_date).getTime() - new Date().getTime()) / 86400000);
      return diffDays >= 0 && diffDays <= 2;
    }).length;
  }, [borrowings]);

  return {
    stats: {
      activeBorrowings: statsData?.activeCount || 0,
      historyCount: statsData?.historyCount || 0,
      dueSoonCount
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
  const { data: historyData } = useSWR('/borrowings?status=returned', apiService.fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000
  });

  const { data: allBooksData, isLoading: loading } = useSWR('/books?limit=100', apiService.fetcher, {
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
