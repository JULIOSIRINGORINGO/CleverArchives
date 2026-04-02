"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeftRight, Plus, CheckCircle, Clock, 
  BookOpen, Loader2, Sparkles, Layers,
  ChevronRight, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiService } from "@/services/api";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { WorkspacePanel, WorkspacePanelContent } from "@/components/ui/WorkspacePanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
      const borrowingsData = await apiService.borrowings.list({ status: 'active' });
      setBorrowings(Array.isArray(borrowingsData) ? borrowingsData : borrowingsData.data || []);
    } catch (err) {
      console.error("Failed to request return:", err);
    }
  };

  return (
    <DashboardPage
      title={t("title") || "Aktifitas Pinjam"}
      icon={<BookOpen className="text-primary" size={22} />}
      headerActions={
        <Link href={`/${locale}/catalog`}>
          <Button size="sm" className="rounded-2xl font-bold gap-2.5 bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/20 px-6 h-11 border-none transition-all active:scale-95 text-xs">
            <Plus size={18} strokeWidth={3} />
            {t("borrow_btn") || "Pinjam Buku Baru"}
          </Button>
        </Link>
      }
    >
      <div className="space-y-10 pb-16">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ArrowLeftRight, color: "blue", label: "Aktif", value: stats.activeCount, desc: "Buku di tangan" },
            { icon: Clock, color: "amber", label: "Pending", value: borrowings.filter(b => b.status === 'pending').length, desc: "Menunggu verifikasi" },
            { icon: CheckCircle, color: "emerald", label: "Selesai", value: stats.historyCount, desc: "Total koleksi terbaca" }
          ].map((stat, i) => (
            <WorkspacePanel key={i} className="flex-row items-center gap-5 p-6 border-primary/5 hover:translate-y-[-4px] transition-all duration-500 shadow-xl shadow-primary/[0.02]">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", 
                stat.color === 'blue' ? "bg-blue-50 text-blue-500" : 
                stat.color === 'amber' ? "bg-amber-50 text-amber-500" : 
                "bg-emerald-50 text-emerald-500"
              )}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className={cn("text-3xl font-bold tracking-tight", 
                    stat.color === 'blue' ? "text-slate-800" : 
                    stat.color === 'amber' ? "text-amber-600" : 
                    "text-emerald-600"
                  )}>
                    {loading ? "..." : stat.value}
                  </h2>
                  <span className="text-[10px] font-bold text-slate-300 italic truncate opacity-60">{stat.desc}</span>
                </div>
              </div>
            </WorkspacePanel>
          ))}
        </div>

        {/* List Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 ml-2">
             <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
             <h3 className="text-[12px] font-bold tracking-widest text-muted-foreground uppercase opacity-60">Daftar Peminjaman</h3>
             <div className="flex-1 h-[1px] bg-gradient-to-r from-border/50 to-transparent" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-50">
              <div className="relative">
                <Loader2 className="animate-spin text-primary/10" size={64} strokeWidth={1} />
                <Loader2 className="animate-spin text-primary absolute inset-0" size={64} strokeWidth={3} style={{ clipPath: 'inset(0 0 50% 0)' }} />
              </div>
              <p className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase italic">Mensinkronisasi Data Koleksi...</p>
            </div>
          ) : borrowings.length === 0 ? (
            <div className="flex flex-col items-center py-32 gap-6 opacity-40 border-2 border-dashed rounded-[3.5rem] border-border/30 bg-muted/5 group/empty">
              <div className="w-24 h-24 rounded-[3rem] bg-muted/10 flex items-center justify-center shadow-inner group-hover/empty:scale-110 transition-transform duration-1000">
                <BookOpen size={48} strokeWidth={1} className="text-muted-foreground/30" />
              </div>
              <p className="font-bold text-sm text-center max-w-[240px] leading-relaxed uppercase tracking-widest text-slate-400">Belum ada buku dalam genggaman Anda.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {groupBorrowings(borrowings).map((group, gIdx) => (
                  <motion.div 
                    key={group.groupId || group.borrowings[0].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gIdx * 0.1 }}
                  >
                    <WorkspacePanel className="overflow-hidden border-primary/5 shadow-2xl shadow-primary/[0.02]">
                      {group.type === 'group' && (
                        <div className="bg-muted/[0.04] px-8 py-5 border-b border-border/20 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white flex items-center justify-center shadow-lg shadow-primary/20">
                              <Layers size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-800 block leading-none mb-1">Peminjaman Kolektif</span>
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                {group.borrowings.length} Buku Terpilih
                              </span>
                            </div>
                          </div>
                          {group.groupId && <span className="text-[10px] font-bold font-mono text-slate-300 italic bg-white px-4 py-2 rounded-xl border border-border/50">#{group.groupId}</span>}
                        </div>
                      )}
                      
                      <WorkspacePanelContent className="p-0">
                        <div className="divide-y divide-border/20">
                          {group.borrowings.map((b, idx) => (
                            <div key={b.id} className="p-8 flex flex-col sm:flex-row sm:items-center gap-10 hover:bg-muted/[0.02] transition-colors group/item">
                              <div className="w-24 aspect-[3/4] rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.1)] shrink-0 bg-muted border border-border/20 group-hover/item:scale-[1.05] transition-all duration-700">
                                {b.book_copy?.book?.cover_url ? (
                                  <img src={b.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/10 gap-2 bg-muted/20 italic text-[10px] font-bold uppercase"><BookOpen size={24} /> No Cover</div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0 space-y-4">
                                <div>
                                  <h4 className="font-bold text-xl tracking-tight text-slate-800 leading-none mb-2">{b.book_copy?.book?.title}</h4>
                                  <p className="text-[11px] font-bold text-slate-400 italic tracking-tight">{b.book_copy?.book?.author?.name}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                                      <BarcodeIcon size={14} />
                                    </div>
                                    <span className="text-[11px] font-bold font-mono text-slate-400 tracking-tighter uppercase">{b.book_copy?.barcode}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                                      <Calendar size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Durasi Pinjam</span>
                                       <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                          {b.borrow_date ? new Date(b.borrow_date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '-'}
                                          <ChevronRight size={10} className="text-slate-300" />
                                          <span className="text-amber-600">
                                            {b.due_date ? new Date(b.due_date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '-'}
                                          </span>
                                       </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-6 w-full sm:w-auto pt-6 sm:pt-0 border-t sm:border-0 border-border/10">
                                <StatusBadge status={b.status} className="scale-125" />
                                
                                {b.status === 'borrowed' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-2xl font-bold text-[11px] uppercase tracking-widest h-11 px-8 bg-emerald-50/50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-600 hover:text-white shadow-xl shadow-emerald-500/[0.05] transition-all active:scale-95 border-2"
                                    onClick={() => handleRequestReturn(b.id)}
                                  >
                                    <RotateCcw size={16} strokeWidth={3} className="mr-2" />
                                    Kembalikan
                                  </Button>
                                )}
                                {b.status === 'pending' && (
                                  <div className="flex items-center gap-2 group/pending">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 opacity-60">Menunggu Verifikasi</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </WorkspacePanelContent>
                    </WorkspacePanel>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </DashboardPage>
  );
}

const RotateCcw = ({ size, className, strokeWidth }: { size: number, className: string, strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || "2"} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const BarcodeIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14" />
  </svg>
);
