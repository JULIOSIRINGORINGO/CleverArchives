"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, BookOpen, Clock, AlertCircle, 
  ArrowUpRight, ArrowDownRight, CheckCircle2,
  Calendar, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import { Card, CardContent } from "@/components/ui/Card";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import useSWR from "swr";

import { useApi } from "@/hooks/useApi";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AdminDashboard() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const locale = useLocale();
  const dateLocale = locale === 'id' ? id : enUS;
  
  const { data: dashboardData, mutate, isValidating } = useSWR('/dashboard/admin_stats', apiService.fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const loading = !dashboardData;

  if (loading) return (
    <div className="space-y-gr-5 pb-gr-7 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded skeleton" />
        <div className="h-4 w-48 rounded skeleton opacity-60" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gr-5">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gr-6">
        <div className="h-80 rounded-2xl skeleton" />
        <div className="h-80 rounded-2xl skeleton" />
      </div>
    </div>
  );

  const stats = dashboardData?.stats || {};
  const recentLoans = dashboardData?.recent_borrowings || [];
  const dueToday = dashboardData?.due_today || [];

  const statCards = [
    { label: "Pinjam Hari Ini", value: stats.borrowed_today, icon: ArrowUpRight, color: "text-blue-600 bg-blue-50" },
    { label: "Kembali Hari Ini", value: stats.returned_today, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Terlambat", value: stats.overdue_count, icon: AlertCircle, color: "text-red-600 bg-red-50" },
    { label: "Member Baru Hari Ini", value: stats.new_members_today, icon: Users, color: "text-violet-600 bg-violet-50" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
      <PageHeader
        title={t("welcome", { name: user?.name?.split(' ')[0] || "" }) + " 👋"}
        subtitle={format(new Date(), 'EEEE, dd MMMM yyyy', { locale: dateLocale })}
        badge={t("summary")}
        icon={<Users size={24} strokeWidth={2.5} />}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-6 px-4 md:px-6 space-y-gr-5">

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gr-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-gr border-none shadow-xl shadow-black/5 bg-[--color-surface]/80 backdrop-blur-xl overflow-hidden group">
              <CardContent className="p-gr-4 flex items-center gap-gr-3">
                <div className={`w-gr-6 h-gr-6 rounded-gr flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
                  <stat.icon size={24} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-gr-xs font-bold text-muted-foreground leading-none mb-gr-2">{stat.label}</div>
                  <div className="text-gr-xl font-bold">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gr-6">
        {/* Recent Borrowings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[--color-surface]/80 backdrop-blur-xl rounded-gr p-gr-5 shadow-2xl shadow-black/5 border border-[--color-border]/20"
        >
          <h3 className="text-gr-lg font-bold mb-gr-5 flex items-center gap-gr-3">
            <div className="p-gr-2 bg-[--color-primary]/10 rounded-gr text-[--color-primary]"><Clock size={20} strokeWidth={2} /></div>
            5 Peminjaman Terbaru
          </h3>
          <div className="space-y-gr-3">
            {recentLoans.length > 0 ? recentLoans.map((loan: any, i: number) => (
              <div key={i} className="flex items-center gap-gr-3 p-gr-3 rounded-gr bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="w-12 h-16 bg-muted rounded-gr shrink-0 overflow-hidden shadow-sm">
                   {loan.book_copy?.book?.cover_url && (
                     <img src={loan.book_copy.book.cover_url} className="w-full h-full object-cover" alt="" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-gr-sm">{loan.book_copy?.book?.title}</div>
                  <div className="text-gr-xs text-muted-foreground font-bold flex items-center gap-1.5 mt-gr-1">
                    <Users size={12} className="text-primary/60" /> {loan.member?.name}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-gr-xs font-bold text-[--color-muted-foreground]">Tgl Pinjam</div>
                  <div className="text-gr-sm font-bold text-[--color-primary]">
                    {loan.borrow_date ? format(new Date(loan.borrow_date), 'dd MMM', { locale: dateLocale }) : '-'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-40 flex flex-col items-center justify-center text-[--color-muted-foreground] gap-gr-2 opacity-60">
                <Info size={32} strokeWidth={2} />
                <p className="font-bold text-gr-sm">Belum ada peminjaman</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Due Today */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[--color-surface]/80 backdrop-blur-xl rounded-gr p-gr-5 shadow-2xl shadow-black/5 border border-[--color-border]/20"
        >
          <h3 className="text-gr-lg font-bold mb-gr-5 flex items-center gap-gr-3">
             <div className="p-gr-2 bg-amber-500/10 rounded-gr text-amber-600"><AlertCircle size={20} strokeWidth={2} /></div>
             Harus Kembali Hari Ini
          </h3>
          <div className="space-y-gr-3">
            {dueToday.length > 0 ? dueToday.map((loan: any, i: number) => (
              <div key={i} className="flex items-center gap-gr-3 p-gr-3 rounded-gr bg-muted/20 hover:bg-muted/40 transition-colors group">
                 <div className="w-12 h-16 bg-muted rounded-gr shrink-0 overflow-hidden shadow-sm">
                   {loan.book_copy?.book?.cover_url && (
                     <img src={loan.book_copy.book.cover_url} className="w-full h-full object-cover" alt="" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-gr-sm">{loan.book_copy?.book?.title}</div>
                  <div className="text-gr-xs text-muted-foreground font-bold flex items-center gap-1.5 mt-gr-1">
                    <Users size={12} className="text-primary/60" /> {loan.member?.name}
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-600 text-[9px] font-bold rounded-gr border border-amber-500/20">
                    Jatuh Tempo
                  </span>
                </div>
              </div>
            )) : (
              <div className="h-40 flex flex-col items-center justify-center text-[--color-muted-foreground] gap-gr-2 opacity-60">
                <CheckCircle2 size={32} strokeWidth={2} />
                <p className="font-bold text-gr-sm">Semua aman untuk hari ini</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
     </div>
    </div>
  );
}
