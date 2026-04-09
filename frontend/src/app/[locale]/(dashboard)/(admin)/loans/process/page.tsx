"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import useSWR, { useSWRConfig, unstable_serialize } from "swr";
import { 
  ScanLine, User, Database, 
  CheckCircle2, AlertCircle, Loader2,
  ArrowRight, Clock, Check, ChevronDown, ChevronUp, Package, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter, useParams } from "next/navigation";

interface GroupedBorrowing {
  type: 'individual' | 'group';
  groupId: string | null;
  member: any;
  borrowings: any[];
  createdAt: string;
}

function groupBorrowings(items: any[]): GroupedBorrowing[] {
  const groups: Record<string, any[]> = {};
  const individuals: any[] = [];

  items.forEach(b => {
    if (b.group_id) {
      if (!groups[b.group_id]) groups[b.group_id] = [];
      groups[b.group_id].push(b);
    } else {
      individuals.push(b);
    }
  });

  const result: GroupedBorrowing[] = [];

  Object.entries(groups).forEach(([gid, borrowings]) => {
    result.push({
      type: 'group',
      groupId: gid,
      member: borrowings[0]?.member,
      borrowings,
      createdAt: borrowings[0]?.created_at,
    });
  });

  individuals.forEach(b => {
    result.push({
      type: 'individual',
      groupId: null,
      member: b.member,
      borrowings: [b],
      createdAt: b.created_at,
    });
  });

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}

function BorrowingBookRow({ b }: { b: any }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 aspect-[3/4] bg-muted rounded-md overflow-hidden shrink-0 border border-black/5">
        {b.book_copy?.book?.cover_url && (
          <img src={b.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-xs truncate">{b.book_copy?.book?.title || "Buku"}</h4>
        <span className="text-xs text-muted-foreground font-medium">
          {b.book_copy?.barcode || "—"}
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-bold shrink-0">
        #{b.id}
      </span>
    </div>
  );
}

function GroupCard({ group, onApprove, onReject, processingId }: {
  group: GroupedBorrowing;
  onApprove: (group: GroupedBorrowing) => void;
  onReject: (group: GroupedBorrowing) => void;
  processingId: string | null;
}) {
  const [expanded, setExpanded] = useState(group.type === 'individual');
  const isGroup = group.type === 'group';
  const cardId = isGroup ? `group-${group.groupId}` : `ind-${group.borrowings[0]?.id}`;
  const isProcessing = processingId === cardId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card className="rounded-xl border shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          {/* Card row */}
          <div className="px-4 py-3 flex items-center gap-4">
            {/* Icon / cover */}
            {isGroup ? (
              <div className="relative w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Package size={18} className="text-primary" />
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {group.borrowings.length}
                </span>
              </div>
            ) : (
              <div className="w-10 aspect-[3/4] bg-muted rounded-md overflow-hidden shrink-0 border border-black/5">
                {group.borrowings[0]?.book_copy?.book?.cover_url && (
                  <img src={group.borrowings[0].book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="bg-amber-100 text-amber-700 text-[9px] font-bold  px-2 py-0.5 rounded-full tracking-wide">
                  Pending
                </span>
                {isGroup && (
                  <span className="bg-primary/10 text-primary text-[9px] font-bold  px-2 py-0.5 rounded-full tracking-wide">
                    Grup • {group.borrowings.length} buku
                  </span>
                )}
                {!isGroup && (
                  <span className="text-xs text-muted-foreground font-bold">#{group.borrowings[0]?.id}</span>
                )}
              </div>

              <h3 className="text-sm font-bold truncate leading-tight">
                {isGroup
                  ? `Peminjaman Grup (${group.borrowings.length} buku)`
                  : (group.borrowings[0]?.book_copy?.book?.title || "Buku")}
              </h3>

              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <User size={12} className="text-primary/60" />
                  {group.member?.name || "Anggota"}
                </span>
                {!isGroup && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Database size={12} className="text-primary/60" />
                    {group.borrowings[0]?.book_copy?.barcode || "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-bold rounded-lg text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => onReject(group)}
                disabled={isProcessing}
              >
                Tolak
              </Button>
              <Button
                size="sm"
                className="h-8 px-4 text-xs font-bold rounded-lg bg-primary text-white gap-1"
                onClick={() => onApprove(group)}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                {isGroup ? `Approve All` : `Approve`}
              </Button>
            </div>
          </div>

          {/* Expandable book list for groups */}
          {isGroup && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-1.5 border-t border-dashed border-muted flex items-center justify-center gap-1.5 text-xs font-bold  tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <BookOpen size={12} />
                {expanded ? 'Tutup' : 'Lihat'} Daftar
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 divide-y divide-muted">
                      {group.borrowings.map(b => (
                        <BorrowingBookRow key={b.id} b={b} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProcessLoanPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  
  const { cache } = useSWRConfig();
  
  // Try to get initial pending from cache to avoid flicker
  const initialKey = unstable_serialize(['/loans/pending', null]);
  const cachedPending = cache.get(initialKey)?.data;
  const initialPendingData = cachedPending?.data || cachedPending || [];

  const [pendingBorrowings, setPendingBorrowings] = useState<any[]>(Array.isArray(initialPendingData) ? initialPendingData : []);
  const [loading, setLoading] = useState(!cachedPending);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const lastSyncRef = useRef<string | null>(null);
  
  // useSWR for pending borrowings - Stable key
  const { mutate: mutatePending } = useSWR(
    ['/loans/pending'],
    () => apiService.borrowings.list({ 
      status: 'pending',
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
          setPendingBorrowings(prev => {
            const merged = [...prev];
            newItems.forEach((item: any) => {
              const idx = merged.findIndex(l => l.id === item.id);
              if (idx > -1) {
                // If status changed from pending, remove it
                if (item.status !== 'pending') {
                   merged.splice(idx, 1);
                } else {
                   merged[idx] = item;
                }
              } else if (item.status === 'pending') {
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

  const fetchPending = async () => {
    mutatePending();
  };

  useEffect(() => { 
    lastSyncRef.current = null;
    // No-clear: we leave the old data shown until SWR gets a fresh list.
  }, []);

  const grouped = groupBorrowings(pendingBorrowings);

  const handleApprove = async (group: GroupedBorrowing) => {
    const cardId = group.type === 'group' ? `group-${group.groupId}` : `ind-${group.borrowings[0]?.id}`;
    setProcessingId(cardId);
    setError(null);
    try {
      if (group.type === 'group' && group.groupId) {
        await apiService.borrowings.approveGroup(group.groupId);
        setSuccess(`${group.borrowings.length} peminjaman grup disetujui!`);
      } else {
        await apiService.borrowings.approve(group.borrowings[0].id.toString());
        setSuccess("Peminjaman disetujui!");
      }
      setTimeout(() => setSuccess(null), 3000);
      fetchPending();
    } catch (err: any) {
      setError(err.message || "Gagal menyetujui peminjaman.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (group: GroupedBorrowing) => {
    const count = group.borrowings.length;
    const msg = group.type === 'group'
      ? `Tolak ${count} permintaan dalam grup ini?`
      : "Tolak permintaan ini?";
    if (!confirm(msg)) return;

    const cardId = group.type === 'group' ? `group-${group.groupId}` : `ind-${group.borrowings[0]?.id}`;
    setProcessingId(cardId);
    setError(null);
    try {
      for (const b of group.borrowings) {
        await apiService.borrowings.cancel(b.id.toString());
      }
      setSuccess(group.type === 'group' ? `${count} permintaan ditolak.` : "Permintaan ditolak.");
      setTimeout(() => setSuccess(null), 3000);
      fetchPending();
    } catch (err: any) {
      setError(err.message || "Gagal menolak peminjaman.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <ScanLine className="text-primary" size={22} />
            Antrean Peminjaman
          </h1>
          <p className="text-muted-foreground text-xs font-medium mt-0.5">Validasi permintaan peminjaman dari anggota.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg font-bold h-8 gap-1.5" onClick={fetchPending} disabled={loading}>
          <Clock size={14} /> Segarkan
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-xs font-bold border border-red-100">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {success && (
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-2 text-xs font-bold border border-emerald-100">
          <CheckCircle2 size={14} /> {success}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <Card className="rounded-xl border-dashed border-2 bg-transparent">
          <CardContent className="py-12 text-center flex flex-col items-center gap-3 opacity-40">
            <ScanLine size={36} />
            <div>
              <h3 className="text-base font-bold">Tidak ada antrean</h3>
              <p className="text-xs font-medium">Semua permintaan telah diproses.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {grouped.map(group => (
              <GroupCard
                key={group.groupId || `ind-${group.borrowings[0]?.id}`}
                group={group}
                onApprove={handleApprove}
                onReject={handleReject}
                processingId={processingId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-primary">Informasi</h4>
          <p className="text-[11px] font-medium text-muted-foreground">Pastikan eksemplar fisik sesuai barcode sebelum menyetujui.</p>
        </div>
        <Button variant="ghost" size="sm" className="font-bold text-primary text-xs rounded-lg gap-1" onClick={() => router.push(`/${locale}/loans/active`)}>
          Semua Peminjaman <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
