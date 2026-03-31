"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Trophy, BookOpen, User, Star, 
  TrendingUp, BarChart3, ArrowRight,
  Database, Hash
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

export default function PopularBooksPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/books/popular?limit=20');
      setBooks(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-500" size={22} />
            Buku Terpopuler
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-lg text-xs font-bold border border-amber-500/20 shadow-sm">
          <Star size={14} className="fill-amber-600" />
          Updated Daily
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[200px] bg-muted animate-pulse rounded-xl" />
          ))
        ) : books.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground italic font-medium text-sm">Data belum tersedia.</div>
        ) : (
          books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-5 border border-border/50 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all overflow-hidden"
            >
              {/* Rank Badge */}
              <div className={`absolute top-0 right-0 w-12 h-12 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform duration-500 ${
                index === 0 ? 'text-amber-500' : 
                index === 1 ? 'text-slate-400' :
                index === 2 ? 'text-amber-700' : 'text-primary/20'
              }`}>
                 #{index + 1}
              </div>

              <div className="relative mb-4">
                <div className="w-20 aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-sm border border-border/50 group-hover:rotate-3 transition-transform duration-500 shrink-0">
                  {book.cover_url ? (
                    <img src={book.cover_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><BookOpen size={32} /></div>
                  )}
                </div>
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    <Trophy size={12} />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 w-full">
                <h4 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">{book.title}</h4>
                <p className="text-xs font-medium text-muted-foreground italic">By {book.author?.name || "Unknown Author"}</p>
                <div className="pt-1.5 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold  tracking-wider text-muted-foreground mb-0.5">Borrow Count</span>
                    <div className="flex items-center gap-1 font-black text-primary text-sm">
                      <TrendingUp size={14} />
                      {book.borrow_count}x
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full pt-3 border-t border-border/40 flex items-center justify-between">
                 <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Database size={12} />
                    <span className="text-[9px] font-bold  tracking-wider">{book.category?.name || "Koleksi"}</span>
                 </div>
                 <button className="text-primary hover:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                 </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!loading && books.length > 0 && (
         <div className="bg-primary/5 rounded-2xl p-6 md:p-8 border border-primary/10 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
               <div className="flex-1 space-y-3 text-center md:text-left">
                  <h3 className="text-2xl font-black tracking-tight text-primary">Analisis Tren Baca</h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xl">
                    Gunakan data ini untuk merencanakan pengadaan koleksi baru atau membuat program literasi yang sesuai dengan minat anggota.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                     <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-xs  tracking-wider">Total 20 Teratas</span>
                     <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-xs  tracking-wider">Periode All-Time</span>
                  </div>
               </div>
               <div className="w-full md:w-[260px] bg-white dark:bg-slate-900 shadow-sm border border-border/50 rounded-xl p-5 flex flex-col items-center gap-1.5">
                  <BarChart3 size={32} className="text-primary/40 mb-1" />
                  <div className="text-xs font-bold  tracking-wider text-muted-foreground">Insight Utama</div>
                  <div className="text-sm font-bold text-center text-foreground">&quot;{books[0]?.category?.name}&quot; Diminati</div>
                  <p className="text-xs text-center text-muted-foreground font-medium mt-1">Kategori ini mendominasi statistik peminjaman.</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
