"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, Plus, CheckCircle, Clock, AlertCircle, History, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import { apiService } from "@/services/api";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Package } from "lucide-react";

interface GroupedBorrowing {
  type: 'group' | 'individual';
  groupId: string | null;
  borrowings: any[];
  createdAt: string;
}

function groupBorrowings(borrowings: any[]): GroupedBorrowing[] {
  const result: GroupedBorrowing[] = [];
  const groups: Record<string, any[]> = {};
  
  borrowings.forEach(b => {
    if (b.group_id) {
      if (!groups[b.group_id]) groups[b.group_id] = [];
      groups[b.group_id].push(b);
    } else {
      result.push({
        type: 'individual',
        groupId: null,
        borrowings: [b],
        createdAt: b.created_at,
      });
    }
  });

  Object.entries(groups).forEach(([groupId, items]) => {
    result.push({
      type: 'group',
      groupId,
      borrowings: items,
      createdAt: items[0].created_at,
    });
  });

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}
export default function BorrowingPage() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeCount: 0, lateCount: 0, returnedToday: 0, historyCount: 0 });
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const t = useTranslations("Borrowings");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [borrowingsData, statsData] = await Promise.all([
          apiService.borrowings.list({ status: 'active' }),
          apiService.borrowings.stats()
        ]);
        
        setBorrowings(Array.isArray(borrowingsData) ? borrowingsData : borrowingsData.data || []);
        setStats({
          activeCount: statsData.activeCount || 0,
          lateCount: statsData.lateCount || 0,
          returnedToday: statsData.returnedToday || 0,
          historyCount: statsData.historyCount || 0
        });
      } catch (err) {
        console.error("Failed to fetch borrowings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestReturn = async (id: string) => {
    try {
      await apiService.borrowings.requestReturn(id);
      // Refresh data
      const borrowingsData = await apiService.borrowings.list({ status: 'active' });
      setBorrowings(Array.isArray(borrowingsData) ? borrowingsData : borrowingsData.data || []);
    } catch (err) {
      console.error("Failed to request return:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 px-2 md:px-0">
      <div className="sticky top-0 z-20 bg-[--color-background] -mx-6 px-6 pt-10 pb-6 border-b border-border/50 shadow-sm transition-all overflow-visible mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="text-primary" size={22} />
              {t("title")}
            </h1>
          </div>
          <Link href={`/${locale}/catalog`}>
            <Button size="sm" className="px-4 py-2 h-9 rounded-lg font-medium shadow-sm gap-1.5 bg-primary">
              <Plus size={16} className="transition-transform" />
              Pinjam Buku
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowLeftRight size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-widest">Sedang Dipinjam</p>
              <h2 className="text-2xl font-bold mt-0.5">{loading ? "..." : stats.activeCount}</h2>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-widest">Menunggu Antrean</p>
              <h2 className="text-2xl font-bold mt-0.5 text-amber-600">{loading ? "..." : (borrowings.filter(b => b.status === 'pending').length)}</h2>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-widest">Selesai Kembali</p>
              <h2 className="text-2xl font-bold mt-0.5 text-emerald-600">{loading ? "..." : (stats.historyCount || 0)}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="font-bold text-[10px] tracking-widest text-muted-foreground">MEMUAT...</p>
        </div>
      ) : borrowings.length === 0 ? (
         <div className="flex flex-col items-center py-16 gap-3 opacity-40 border border-dashed rounded-xl border-border bg-card">
            <BookOpen size={40} />
            <p className="font-medium text-sm">Belum ada peminjaman aktif.</p>
         </div>
      ) : (
         <div className="space-y-4">
            {groupBorrowings(borrowings).map(group => (
               <div key={group.groupId || group.borrowings[0].id} className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                  {/* If group, show group header */}
                  {group.type === 'group' && (
                     <div className="bg-muted/30 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center">
                             <span className="font-bold text-sm">Peminjaman Grup</span>
                             <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{group.borrowings.length} Buku</span>
                           </div>
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground hidden sm:block">ID: {group.groupId}</span>
                     </div>
                  )}
                  
                  {/* Render the individual borrowings */}
                  <div className="divide-y divide-border/50">
                     {group.borrowings.map(b => (
                        <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors">
                            <div className="w-16 aspect-[3/4] bg-muted rounded-md border border-border/50 overflow-hidden shrink-0 hidden sm:block">
                               {b.book_copy?.book?.cover_url && <img src={b.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-bold text-sm sm:text-base truncate">{b.book_copy?.book?.title}</h4>
                               <p className="text-[10px] font-mono font-medium text-muted-foreground mt-0.5 tracking-tight">{b.book_copy?.barcode}</p>
                               <div className="flex items-center gap-x-4 gap-y-1 mt-2">
                                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap"><span className="font-bold">Pinjam:</span> {b.borrow_date ? new Date(b.borrow_date).toLocaleDateString() : '-'}</span>
                                  <span className="text-[10px] font-medium text-amber-600 whitespace-nowrap"><span className="font-bold">Tempo:</span> {b.due_date ? new Date(b.due_date).toLocaleDateString() : '-'}</span>
                               </div>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                               {/* Status Badge */}
                               <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold inline-flex items-center gap-1.5 shadow-sm border ${
                                  b.status === 'borrowed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  b.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  b.status === 'return_pending' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  b.status === 'late' ? 'bg-red-50 text-red-600 border-red-100' :
                                  'bg-slate-50 text-slate-600 border-slate-100'
                               }`}>
                                  {b.status === 'return_pending' ? 'Proses Kembali' : 
                                   b.status === 'pending' ? 'Menunggu' :
                                   b.status === 'borrowed' ? 'Dipinjam' : b.status}
                               </span>
                               {/* Action Button */}
                               {b.status === 'borrowed' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-lg font-medium text-xs h-7 px-3 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                    onClick={() => handleRequestReturn(b.id)}
                                  >
                                    Kembalikan
                                  </Button>
                               )}
                               {b.status === 'pending' && <span className="text-[9px] font-bold tracking-widest text-muted-foreground/50">Dapat Dibatalkan</span>}
                            </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
