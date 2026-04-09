"use client";

import { useState } from "react";
import { apiService } from "@/services/api";
import { 
  BookOpen, Search, Loader2, AlertCircle, 
  CheckCircle2, ArrowLeft, Barcode
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function RequestBorrowingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'id';
  
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookInfo, setBookInfo] = useState<any>(null);

  const handleLookup = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.books.getByBarcode(barcode);
      setBookInfo(res.book);
    } catch (err: any) {
      console.error(err);
      setError("Buku tidak ditemukan atau tidak tersedia.");
      setBookInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      await apiService.borrowings.create({
        borrowing: { barcode: barcode.trim() }
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/borrowings`);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Gagal mengajukan peminjaman. Pastikan kode eksemplar benar dan buku tersedia.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-150">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-200">
          <CheckCircle2 size={48} />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-foreground">Permintaan Terkirim!</h1>
          <p className="text-muted-foreground mt-2 font-medium">Silakan hubungi admin untuk validasi fisik buku.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150 pb-12 px-2 md:px-0">
      <div className="sticky top-0 z-20 bg-[--color-background] -mx-6 px-6 pt-10 pb-6 border-b border-border/50 shadow-sm transition-all overflow-visible mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${locale}/borrowings`}
            className="p-3 hover:bg-muted rounded-2xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <BookOpen className="text-primary" size={32} />
              Pinjam Buku
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="mt-4 flex items-center justify-between text-xs font-bold tracking-widest text-muted-foreground/60">
              Kode Eksemplar (Barcode)
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Barcode size={20} />
              </div>
              <input 
                type="text" 
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onBlur={handleLookup}
                placeholder="Contoh: IND 1275 1"
                className="w-full bg-card border border-border/50 rounded-2xl pl-14 pr-5 py-5 text-lg font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                required
              />
              {loading && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake duration-150">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {bookInfo && (
            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-4">
               <div className="flex gap-4">
                  <div className="w-16 h-24 bg-card rounded-lg border border-border/50 shadow-sm flex items-center justify-center overflow-hidden">
                    {bookInfo.cover_url ? (
                      <img src={bookInfo.cover_url} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                      <BookOpen size={24} className="text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg line-clamp-2">{bookInfo.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{bookInfo.author?.name || "Pengarang Tidak Diketahui"}</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full text-xs font-bold tracking-widest border border-border/50">
                      Tersedia
                    </div>
                  </div>
               </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !barcode.trim()}
            className="w-full py-8 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 gap-3 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Search size={24} className="group-hover:scale-110 transition-transform" />
            )}
            Ajukan Peminjaman
          </Button>

          <p className="text-center text-xs text-muted-foreground font-medium tracking-[0.2em]">
            Admin akan memvalidasi fisik buku setelah pengajuan
          </p>
        </form>
      </div>
    </div>
  );
}
