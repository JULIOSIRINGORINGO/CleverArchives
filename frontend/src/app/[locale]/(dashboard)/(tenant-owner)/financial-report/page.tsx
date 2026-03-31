"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Wallet, Download, TrendingUp, Calendar, 
  BarChart3, FileText, ArrowRight,
  ChevronDown, Filter, Search, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useTranslations, useLocale } from "next-intl";

interface FinancialSummary {
  total_fine_collected: number;
  pending_fines: number;
  monthly_revenue: { month: string; amount: number }[];
  recent_payments: {
    id: number;
    member_name: string;
    amount: number;
    date: string;
    description: string;
  }[];
}

export default function FinancialReportPage() {
  const t = useTranslations("FinancialReport");
  const locale = useLocale();
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.financial.getReport({
        month: monthFilter.toString(),
        year: yearFilter.toString()
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [monthFilter, yearFilter]);

  const handleExportCSV = () => {
    const url = apiService.financial.exportCSV({
      month: monthFilter.toString(),
      year: yearFilter.toString()
    });
    window.open(url, '_blank');
  };

  if (loading && !data) return <div className="p-8 animate-pulse space-y-8">
    <div className="h-10 w-48 bg-muted rounded-lg" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
    </div>
    <div className="h-96 bg-muted rounded-2xl" />
  </div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Wallet className="text-primary" size={32} />
            {t("title")}
          </h1>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
        >
          <Download size={18} />
          {t("export_csv")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border/50 p-4 rounded-2xl flex items-center gap-4 shadow-sm w-fit">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-muted-foreground" />
          <select 
            value={monthFilter}
            onChange={(e) => setMonthFilter(parseInt(e.target.value))}
            className="bg-muted px-3 py-1.5 rounded-lg text-sm font-bold outline-none"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value))}
            className="bg-muted px-3 py-1.5 rounded-lg text-sm font-bold outline-none"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <div className="relative z-10">
            <div className="text-indigo-200 text-xs font-bold tracking-widest mb-2">{t("total_fine")}</div>
            <div className="text-4xl font-black mb-6">
              Rp {(data?.total_fine_collected ?? 0).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t("current_month")}: {new Date(0, monthFilter-1).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long' })}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/50 p-8 rounded-[2rem] flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest mb-1">{t("pending_fine")}</div>
            <div className="text-4xl font-black text-amber-500">
              Rp {(data?.pending_fines ?? 0).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-600">
            <Clock size={14} /> {t("pending_desc")}
          </div>
        </motion.div>

        <div className="hidden lg:block bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-8 rounded-[2rem]">
          <h3 className="font-bold flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-4">
            <FileText size={18} /> {t("insights_title")}
          </h3>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed italic">
            &quot;{t("insights_desc")}&quot;
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm">
        <h3 className="font-bold text-sm tracking-widest mb-8 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" /> {t("chart_title")}
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(val: any) => `Rp ${(val ?? 0).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}`}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-border/10 bg-muted/20">
          <h3 className="font-bold text-sm tracking-widest">{t("recent_transactions")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/10">
                <th className="px-8 py-4 font-bold text-xs tracking-widest text-muted-foreground">{t("table_time")}</th>
                <th className="px-8 py-4 font-bold text-xs tracking-widest text-muted-foreground">{t("table_member")}</th>
                <th className="px-8 py-4 font-bold text-xs tracking-widest text-muted-foreground">{t("table_desc")}</th>
                <th className="px-8 py-4 font-bold text-xs tracking-widest text-muted-foreground text-right">{t("table_amount")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_payments?.map((p, i) => (
                <tr key={i} className="border-b border-border/5 hover:bg-muted/5 transition-colors">
                  <td className="px-8 py-4 text-xs font-medium text-muted-foreground">{new Date(p.date).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="px-8 py-4">
                    <div className="font-bold tracking-tight">{p.member_name}</div>
                  </td>
                  <td className="px-8 py-4 text-muted-foreground text-xs italic">{p.description}</td>
                  <td className="px-8 py-4 text-right font-black text-emerald-600">Rp {(p.amount ?? 0).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}</td>
                </tr>
              ))}
              {data?.recent_payments?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground italic">{t("no_transactions")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
