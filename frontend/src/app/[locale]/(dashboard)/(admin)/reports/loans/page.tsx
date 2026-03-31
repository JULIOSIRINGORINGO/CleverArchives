"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  FileText, Search, Printer, Calendar,
  ArrowRight, User, BookOpen, Clock,
  Filter, Download
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { id, enUS } from "date-fns/locale";

export default function LoanReportPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const dateLocale = locale === 'id' ? id : enUS;
  
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState("returned");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use existing index with status returned for report
      const res = await apiService.borrowings.list({ 
        status: statusFilter,
        start_date: startDate,
        end_date: endDate,
        items: "100"
      });
      const data = res.data || res.borrowings || (Array.isArray(res) ? res : []);
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const validLoans = Array.isArray(loans) ? loans : [];
  const totalFine = validLoans.reduce((acc, loan) => acc + (parseFloat(loan.fine_amount) || 0), 0);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="text-primary" size={32} />
            Laporan Peminjaman
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-border/50 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
            <Printer size={18} />
            Cetak PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all">
            <Download size={18} />
            Excel
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl shadow-black/5 border border-white/20">
        <div className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="space-y-1.5">
              <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-1">Mulai</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-1">Selesai</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-1">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
              >
                <option value="returned">Selesai</option>
                <option value="borrowed">Masih Dipinjam</option>
                <option value="all">Semua</option>
              </select>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="px-8 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all whitespace-nowrap"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <div className="text-xs font-bold  tracking-widest text-primary/60 mb-1">Total Transaksi</div>
          <div className="text-2xl font-black text-primary">{validLoans.length}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-500/20">
          <div className="text-xs font-bold  tracking-widest text-emerald-600/60 mb-1">Total Denda</div>
          <div className="text-2xl font-black text-emerald-600">Rp {totalFine.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/5 border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="px-8 py-6 text-xs font-bold  tracking-widest text-muted-foreground">Member</th>
                <th className="px-8 py-6 text-xs font-bold  tracking-widest text-muted-foreground">Buku</th>
                <th className="px-8 py-6 text-xs font-bold  tracking-widest text-muted-foreground">Pinjam</th>
                <th className="px-8 py-6 text-xs font-bold  tracking-widest text-muted-foreground">Kembali</th>
                <th className="px-8 py-6 text-xs font-bold  tracking-widest text-muted-foreground">Denda</th>
                <th className="px-8 py-6 text-xs font-bold  tracking-widest text-muted-foreground text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 w-32 bg-muted rounded-lg" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-48 bg-muted rounded-lg" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-20 bg-muted rounded-lg" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-20 bg-muted rounded-lg" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-16 bg-muted rounded-lg" /></td>
                    <td className="px-8 py-6"><div className="h-6 w-16 bg-muted rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : validLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground italic font-medium">Tidak ada data untuk periode ini.</td>
                </tr>
              ) : (
                validLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-8 py-6 font-bold">{loan.member?.name}</td>
                    <td className="px-8 py-6">
                       <div className="font-bold">{loan.book_copy?.book?.title}</div>
                       <div className="text-xs text-muted-foreground font-black  tracking-tighter">{loan.book_copy?.barcode}</div>
                    </td>
                    <td className="px-8 py-6 text-muted-foreground font-medium">
                       {format(new Date(loan.borrow_date), 'dd/MM/yy')}
                    </td>
                    <td className="px-8 py-6 text-muted-foreground font-medium">
                       {loan.return_date ? format(new Date(loan.return_date), 'dd/MM/yy') : '-'}
                    </td>
                    <td className="px-8 py-6">
                       <span className={parseFloat(loan.fine_amount) > 0 ? 'text-red-600 font-black' : 'text-muted-foreground font-medium'}>
                         {parseFloat(loan.fine_amount) > 0 ? `Rp ${parseFloat(loan.fine_amount).toLocaleString('id-ID')}` : '-'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-3 py-1 text-[9px] font-black  rounded-full border shadow-sm ${
                         loan.status === 'returned' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         loan.status === 'borrowed' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                         'bg-gray-50 text-gray-500 border-gray-100'
                       }`}>
                         {loan.status}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
