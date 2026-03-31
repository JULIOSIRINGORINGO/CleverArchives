"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  ArrowLeftRight, Search, Clock, AlertCircle, 
  CheckCircle2, User, BookOpen, Calendar,
  MoreVertical, ChevronRight, Filter, Database
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { id, enUS } from "date-fns/locale";

import { ManualBorrowModal } from "@/components/loans/ManualBorrowModal";

export default function ActiveLoansPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const dateLocale = locale === 'id' ? id : enUS;
  
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.borrowings.list({ status: 'borrowed' });
      setLoans(res.data || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.member?.name?.toLowerCase().includes(search.toLowerCase()) || 
      loan.book_copy?.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      loan.book_copy?.barcode?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "overdue") {
      return matchesSearch && isAfter(new Date(), new Date(loan.due_date));
    }
    return matchesSearch;
  });

  const handleReturn = async (id: number) => {
    if (!confirm("Proses pengembalian buku ini?")) return;
    try {
      await apiService.borrowings.return(id.toString());
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="text-primary" size={22} />
            Peminjaman Aktif
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <Button 
             onClick={() => setIsModalOpen(true)}
             size="sm"
             className="gap-1.5 h-9 font-bold bg-primary text-white shadow-sm"
           >
             <ArrowLeftRight size={14} /> Tambah
           </Button>
           <div className="flex items-center gap-1.5 px-3 py-0 bg-muted/50 rounded-lg border border-border/50 text-xs font-bold  tracking-wider text-muted-foreground shadow-sm h-9">
            <Clock size={12} /> Total: {loans.length}
          </div>
        </div>
      </div>

      <ManualBorrowModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder="Cari Member, Buku, Barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground hidden md:block" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold min-w-[140px]"
          >
            <option value="all">Semua Aktif</option>
            <option value="overdue">Terlambat</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground">Member</th>
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground">Buku</th>
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground hidden sm:table-cell">Tgl Pinjam</th>
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground">Batas Kembali</th>
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-8 w-24 bg-muted rounded-md" /></td>
                    <td className="px-4 py-3"><div className="h-8 w-40 bg-muted rounded-md" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-16 bg-muted rounded-md" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-muted rounded-md" /></td>
                    <td className="px-4 py-3 text-center"><div className="h-5 w-14 bg-muted rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-xs font-medium">Tidak ada peminjaman aktif.</td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isOverdue = isAfter(new Date(), new Date(loan.due_date));
                  return (
                    <tr 
                      key={loan.id} 
                      onClick={() => router.push(`/${locale}/loans/${loan.id}`)}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{loan.member?.name}</div>
                            <div className="text-[9px] text-muted-foreground font-bold  tracking-widest truncate">ID: {loan.member?.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 aspect-[3/4] bg-muted rounded-md overflow-hidden shrink-0 border border-border/50">
                             {loan.book_copy?.book?.cover_url && <img src={loan.book_copy.book.cover_url} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{loan.book_copy?.book?.title}</div>
                            <div className="text-xs text-muted-foreground font-bold flex items-center gap-1 mt-0.5 truncate">
                              <Database size={10} className="text-primary/50 shrink-0" /> {loan.book_copy?.barcode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                         {format(new Date(loan.borrow_date), 'dd MMM yy', { locale: dateLocale })}
                      </td>
                      <td className="px-4 py-3">
                         <div className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-primary'}`}>
                           {format(new Date(loan.due_date), 'dd MMM yy', { locale: dateLocale })}
                         </div>
                         {isOverdue && (
                           <div className="text-[9px] font-bold  text-red-500 mt-0.5">Terlambat!</div>
                         )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold  rounded-md border ${
                          isOverdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {isOverdue ? 'Terlambat' : 'Dipinjam'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
