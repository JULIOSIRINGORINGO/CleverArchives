"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, Settings, Maximize2, 
  ChevronRight, ArrowLeft, Bookmark,
  Type, Moon, Sun, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import { BookOpen } from "lucide-react";

export default function EbookViewer() {
  const t = useTranslations("EbookLibrary");
  const [ebook, setEbook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchEbook = async () => {
      setLoading(true);
      try {
        const id = params?.id as string;
        if (!id) return;
        const data = await apiService.ebooks.get(id);
        setEbook(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat ebook");
      } finally {
        setLoading(false);
      }
    };
    fetchEbook();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="font-bold text-muted-foreground animate-pulse">Memuat pengalaman membaca Anda...</p>
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
            <ArrowLeft size={40} />
          </div>
          <h2 className="text-2xl font-black">Waduh! Ada Masalah.</h2>
          <p className="text-muted-foreground font-medium">{error || "Ebook tidak ditemukan"}</p>
          <Button variant="primary" className="w-full rounded-2xl h-12 font-bold" onClick={() => router.back()}>
            Kembali ke Perpustakaan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-150 ${
      theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 
      theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' : 
      'bg-white text-zinc-900'
    }`}>
      <header className="h-16 border-b flex items-center justify-between px-6 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="font-bold text-sm truncate max-w-[200px] md:max-w-md">{ebook.book?.title}</h1>
            <p className="text-xs opacity-60 font-bold tracking-widest">{ebook.book?.author?.name || t("unknown_author")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl"
            onClick={() => setTheme(theme === 'light' ? 'sepia' : theme === 'sepia' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Sun size={20} /> : theme === 'sepia' ? <Monitor size={20} /> : <Moon size={20} />}
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <Type size={20} />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <Bookmark size={20} />
          </Button>
          <div className="w-px h-6 bg-muted mx-2"></div>
          <Button variant="primary" size="sm" className="rounded-xl" onClick={() => router.back()}>
            {t("exit_reader")}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto py-12 px-6">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-4xl font-black italic mb-12">Chapter {currentPage}</h2>
          
          <div className="prose prose-xl dark:prose-invert">
            <p className="text-xl leading-relaxed">
              Anda sedang membaca versi digital dari <strong>{ebook.book?.title}</strong>. 
              Gunakan kontrol di bawah untuk berpindah halaman atau menyesuaikan tema tampilan 
              agar membaca lebih nyaman.
            </p>
            
            {ebook.book?.description && (
              <p className="text-xl leading-relaxed italic opacity-80 border-l-4 border-primary/20 pl-6 my-8">
                &ldquo;{ebook.book.description.substring(0, 300)}...&rdquo;
              </p>
            )}

            <p className="text-xl leading-relaxed">
              Teknologi Clever Archives memungkinkan Anda mengakses ribuan koleksi literatur 
              kapan saja dan di mana saja. Kami berkomitmen untuk terus meningkatkan pengalaman 
              membaca digital Anda.
            </p>
          </div>

          {ebook.book?.cover_url && (
            <img 
              src={ebook.book.cover_url} 
              alt={ebook.book.title} 
              className="w-full max-w-sm mx-auto rounded-3xl shadow-2xl my-12"
            />
          )}

          <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 text-center space-y-4">
             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <BookOpen size={24} />
             </div>
             <h4 className="font-bold">Selamat Membaca!</h4>
             <p className="text-sm opacity-60">
               Versi lengkap dari dokumen {ebook.file_format} ini tersedia di server penyimpanan aman kami.
             </p>
          </div>
        </div>
      </main>

      <footer className="h-16 border-t flex items-center justify-between px-8 bg-background/50 backdrop-blur-md">
        <div className="text-xs font-bold opacity-60">
          {t("page_info", { current: currentPage, total: 100 })}
        </div>
        <div className="flex-1 mx-12 h-1 bg-muted rounded-full relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-primary w-[5%] rounded-full transition-all duration-150" style={{ width: `${(currentPage / 100) * 100}%` }}></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-10 w-10 p-0" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
            <ChevronLeft size={20} />
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl h-10 w-10 p-0" onClick={() => setCurrentPage(Math.min(100, currentPage + 1))}>
            <ChevronRight size={20} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
