"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import useSWR, { useSWRConfig, unstable_serialize } from "swr";
import {
  ArrowLeftRight, Search, User, BookOpen,
  CheckCircle2, AlertCircle, Loader2,
  ScanLine, Database, Calendar, BadgeAlert,
  History, ArrowRight, CornerUpLeft, Check, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter, useParams } from "next/navigation";
import { format, isAfter, differenceInDays } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useToast } from "@/components/ui/Toast";

export default function ProcessReturnPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  const dateLocale = locale === 'id' ? id : enUS;

  const { toast } = useToast();
  const { cache } = useSWRConfig();

  // Try to get initial returns from cache to avoid flicker
  const initialKey = unstable_serialize(['/loans/return_pending', null]);
  const cachedReturns = cache.get(initialKey)?.data;
  const initialReturnsData = cachedReturns?.data || cachedReturns || [];

  const [returnPendingBorrowings, setReturnPendingBorrowings] = useState<any[]>(Array.isArray(initialReturnsData) ? initialReturnsData : []);
  const [loading, setLoading] = useState(!cachedReturns);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const lastSyncRef = useRef<string | null>(null);

  // useSWR for return pending borrowings - Stable key
  const { mutate: mutateReturns } = useSWR(
    ['/loans/return_pending'],
    () => apiService.borrowings.list({
      status: 'return_pending',
      updated_after: lastSyncRef.current || ''
    }),
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onSuccess: (newData) => {
        const data = newData?.data || newData || [];
        const newItems = Array.isArray(data) ? data : [];
        if (newItems.length > 0) {
          setReturnPendingBorrowings(prev => {
            const merged = [...prev];
            newItems.forEach((item: any) => {
              const idx = merged.findIndex(l => l.id === item.id);
              if (idx > -1) {
                // If status changed from return_pending, remove it
                if (item.status !== 'return_pending') {
                  merged.splice(idx, 1);
                } else {
                  merged[idx] = item;
                }
              } else if (item.status === 'return_pending') {
                merged.unshift(item);
              }
            });
            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          lastSyncRef.current = new Date().toISOString();
        }
        setLoading(false);
      }
    }
  );

  const fetchReturns = async () => {
    mutateReturns();
  };

  useEffect(() => {
    lastSyncRef.current = null;
    // No-clear: we leave the old data shown until SWR gets a fresh list.
  }, []);

  const handleConfirmReturn = async (id: string) => {
    setProcessingId(id);
    try {
      await apiService.borrowings.return(id);
      toast("Pengembalian buku berhasil dikonfirmasi!", "success");
      fetchReturns();
    } catch (err: any) {
      toast(err.message || "Gagal mengonfirmasi pengembalian.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <CornerUpLeft className="text-emerald-500" size={22} />
            Konfirmasi Pengembalian
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg font-bold h-9 gap-1.5" onClick={fetchReturns} disabled={loading}>
            <Clock size={14} /> Segarkan
          </Button>
        </div>
      </div>

      {/* Alerts removed in favor of Toasts */}

      {/* Content */}
      <div className="space-y-3">
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : returnPendingBorrowings.length === 0 ? (
          <Card className="rounded-xl border-dashed border-2 bg-transparent">
            <CardContent className="py-12 text-center flex flex-col items-center justify-center gap-3 opacity-40">
              <CornerUpLeft size={36} className="text-emerald-500" />
              <div>
                <h3 className="text-base font-bold">Tidak ada antrean pengembalian</h3>
                <p className="text-xs font-medium">Semua permintaan telah diproses.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
              {returnPendingBorrowings.map((b) => {
                const isOverdue = isAfter(new Date(), new Date(b.due_date));
                const overdueDays = Math.max(0, differenceInDays(new Date(), new Date(b.due_date)));

                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="rounded-xl border shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                        {/* Book Details */}
                        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                          <div className="w-12 aspect-[3/4] bg-muted rounded-lg overflow-hidden shrink-0 border border-border/50">
                            {b.book_copy?.book?.cover_url && <img src={b.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold  px-2 py-0.5 rounded-full tracking-wider">Siap Kembali</span>
                              {isOverdue && (
                                <span className="bg-red-100 text-red-700 text-[9px] font-bold  px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                                  <BadgeAlert size={10} /> Terlambat {overdueDays} Hari
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground font-bold">BC: {b.book_copy?.barcode}</span>
                            </div>
                            <h3 className="text-sm font-bold truncate">{b.book_copy?.book?.title || "Buku"}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground font-medium">
                                <User size={12} className="text-emerald-500" /> {b.member?.name || "Anggota"}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground font-medium">
                                <Clock size={12} className="text-emerald-500" /> JT: {format(new Date(b.due_date), 'dd MMM yy', { locale: dateLocale })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:w-auto h-9 px-3 rounded-lg text-xs font-bold text-muted-foreground border-muted-foreground/20 hover:bg-muted/30"
                            onClick={() => router.push(`/${locale}/members/${b.member?.id}`)}
                          >
                            Profil Member
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 sm:w-auto h-9 px-4 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 gap-1.5"
                            onClick={() => handleConfirmReturn(b.id)}
                            disabled={processingId === b.id}
                          >
                            {processingId === b.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                            Konfirmasi
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-emerald-600">Verifikasi Fisik</h4>
          <p className="text-[11px] font-medium text-muted-foreground">Pastikan fisik dan barcode buku sesuai sebelum konfirmasi.</p>
        </div>
        <Button variant="ghost" size="sm" className="font-bold text-emerald-600 hover:bg-emerald-500/10 rounded-lg text-xs gap-1" onClick={() => router.push(`/${locale}/loans/active`)}>
          Ke Riwayat <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
