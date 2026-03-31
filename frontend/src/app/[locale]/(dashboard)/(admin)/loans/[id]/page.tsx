"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, BookOpen, User, Hash, Clock, 
  CheckCircle2, AlertCircle, Loader2, Shield 
} from "lucide-react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/useToast";

export default function BorrowingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const dateLocale = locale === 'id' ? id : enUS;
  const borrowingId = params?.id as string;

  const [borrowing, setBorrowing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBorrowing = async () => {
      setLoading(true);
      try {
        const res = await apiService.borrowings.get(borrowingId);
        setBorrowing(res);
        if (res.due_date) {
          const date = new Date(res.due_date);
          date.setDate(date.getDate() + 14);
          setNewDueDate(date.toISOString().split('T')[0]);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat data peminjaman");
      } finally {
        setLoading(false);
      }
    };
    if (borrowingId) fetchBorrowing();
  }, [borrowingId]);

  const handleExtend = async () => {
    setIsConfirmOpen(false);
    setActionLoading(true);
    try {
      await apiService.borrowings.extend(borrowingId, { due_date: newDueDate });
      const res = await apiService.borrowings.get(borrowingId);
      setBorrowing(res);
      setIsModalOpen(false);
      toast("Peminjaman berhasil diperpanjang", "success");
    } catch (err: any) {
      console.error("Extension error:", err);
      toast(err.message || "Gagal memperpanjang peminjaman", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !borrowing) {
    return (
      <div className="p-6 text-center bg-destructive/10 rounded-xl border border-destructive/20 max-w-xl mx-auto my-12">
        <AlertCircle size={36} className="mx-auto mb-3 text-destructive" />
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p className="text-sm font-medium text-muted-foreground mb-4">{error || "Data tidak ditemukan"}</p>
        <Button onClick={() => router.back()} variant="outline" size="sm" className="rounded-lg px-4 gap-2 font-bold">
          <ArrowLeft size={16} /> Kembali
        </Button>
      </div>
    );
  }

  const isReturned = borrowing.status === 'returned';
  const isOverdue = borrowing.status === 'late' || (borrowing.status === 'borrowed' && new Date() > new Date(borrowing.due_date));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs font-bold  tracking-wider mb-1"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            Detail Peminjaman
            <Badge variant={isReturned ? "secondary" : isOverdue ? "destructive" : "default"} className="rounded-md px-2 py-0.5  text-[9px] font-bold tracking-wider">
              {isReturned ? "Returned" : isOverdue ? "Overdue" : "Active"}
            </Badge>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isReturned && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              disabled={actionLoading}
              size="sm"
              className="h-9 px-4 rounded-lg font-bold bg-primary hover:bg-primary/90 shadow-sm gap-1.5"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Clock size={14} />}
              Perpanjang
            </Button>
          )}
        </div>
      </div>

      {/* Extension Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-primary/5 border-b border-primary/10">
              <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
                <Clock size={18} /> Perpanjang Pinjam
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                 <p className="text-xs font-bold  tracking-wider text-muted-foreground mb-0.5">Tanggal Sebelum</p>
                 <p className="font-semibold text-sm">{format(new Date(borrowing.due_date), "EEEE, d MMM yyyy", { locale: dateLocale })}</p>
              </div>
              
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                 <label htmlFor="new_due_date" className="text-xs font-bold  tracking-wider text-primary mb-0.5 block">Tanggal Baru</label>
                 <input 
                   id="new_due_date"
                   type="date"
                   value={newDueDate}
                   onChange={(e) => setNewDueDate(e.target.value)}
                   className="w-full bg-transparent border-none p-0 font-semibold text-sm text-primary focus:ring-0 cursor-pointer outline-none"
                 />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg font-bold"
                >
                  Batal
                </Button>
                <Button 
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={actionLoading || !newDueDate}
                  size="sm"
                  className="flex-1 rounded-lg font-bold bg-primary hover:bg-primary/90"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={14} /> : "Konfirmasi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExtend}
        title="Konfirmasi Perpanjangan"
        description="Lanjutkan memperpanjang masa peminjaman?"
        confirmLabel="Ya"
        cancelLabel="Batal"
        isLoading={actionLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
              <CardTitle className="flex items-center gap-2 text-xs font-bold  tracking-widest text-muted-foreground">
                <Clock size={14} /> Informasi Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <InfoItem 
                  label="Tanggal Pinjam" 
                  value={format(new Date(borrowing.borrow_date), "d MMM yyyy", { locale: dateLocale })}
                  icon={<Calendar size={16} className="text-primary" />}
                />
                <InfoItem 
                  label="Batas Kembali" 
                  value={format(new Date(borrowing.due_date), "d MMM yyyy", { locale: dateLocale })}
                  icon={<Clock size={16} className={isOverdue ? "text-destructive" : "text-primary"} />}
                />
              </div>
              <div className="space-y-4">
                <InfoItem 
                  label="Status" 
                  value={borrowing.status.toUpperCase()}
                  icon={<Shield size={16} className="text-primary" />}
                />
                {borrowing.return_date && (
                  <InfoItem 
                    label="Tanggal Kembali" 
                    value={format(new Date(borrowing.return_date), "d MMM yyyy", { locale: dateLocale })}
                    icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Book Info */}
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
              <CardTitle className="flex items-center gap-2 text-xs font-bold  tracking-widest text-muted-foreground">
                <BookOpen size={14} /> Informasi Buku
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-24 aspect-[3/4] rounded-lg bg-muted shrink-0 border border-border/50 flex items-center justify-center overflow-hidden">
                {borrowing.book_copy?.book?.cover_url ? (
                  <img src={borrowing.book_copy.book.cover_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={32} className="text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <h2 className="text-lg font-bold leading-tight">{borrowing.book_copy?.book?.title}</h2>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{borrowing.book_copy?.book?.author?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                  <InfoItem label="Barcode" value={borrowing.book_copy?.barcode} icon={<Hash size={14} />} />
                  <InfoItem label="Kondisi" value={borrowing.book_copy?.condition || "Baik"} icon={<Shield size={14} />} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Info */}
        <div className="space-y-6">
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-3 px-5">
              <CardTitle className="flex items-center gap-2 text-xs font-bold  tracking-widest text-primary">
                <User size={14} /> Peminjam
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-white shadow-sm flex items-center justify-center text-primary overflow-hidden mb-3">
                {borrowing.member?.avatar_url ? (
                  <img src={borrowing.member.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <h3 className="text-base font-bold">{borrowing.member?.name}</h3>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{borrowing.member?.email}</p>
              <div className="mt-2 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold  tracking-wider">
                 ID: {borrowing.member?.member_code || borrowing.member?.id}
              </div>
              <Button 
                onClick={() => router.push(`/${locale}/members/${borrowing.member?.id}`)}
                variant="outline" 
                size="sm"
                className="w-full rounded-lg font-bold mt-5 h-9"
              >
                Lihat Profil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 text-muted-foreground/50">{icon}</div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-bold  tracking-wider text-muted-foreground/70">{label}</p>
        <p className="font-semibold text-sm truncate">{value}</p>
      </div>
    </div>
  );
}
