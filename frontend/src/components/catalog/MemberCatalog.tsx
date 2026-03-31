"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, BookOpen, 
  ArrowUpRight, Bookmark, AlertCircle,
  LayoutGrid, List, SlidersHorizontal,
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import BookDetailModal from "@/components/books/BookDetailModal";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export default function MemberCatalog() {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  const { addItem } = useCart();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [cache, setCache] = useState<Record<string, any>>({});
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_URL}/books?page=${page}`;
        if (search) url += `&query=${encodeURIComponent(search)}`;
        if (filter !== 'all') url += `&filter=${filter}`;

        const cacheKey = `${page}-${search}-${filter}`;
        if (cache[cacheKey]) {
          setBooks(cache[cacheKey].books);
          setTotalPages(cache[cacheKey].totalPages);
          setLoading(false);
          return;
        }

        const tenantSlug = localStorage.getItem('tenant-slug') || 'demo-lib';
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Tenant-Slug': tenantSlug,
            'Content-Type': 'application/json'
          }
        });
        
        const linkHeader = response.headers.get('Link');
        let totalP = 1;
        if (linkHeader) {
          try {
            const pagyData = JSON.parse(linkHeader);
            totalP = pagyData.pages || 1;
            setTotalPages(totalP);
          } catch (e) {
            console.error("Failed to parse pagy header", e);
          }
        }

        const json = await response.json();
        const data = json.data || json;
        if (Array.isArray(data)) {
          setBooks(data);
          setCache(prev => ({ ...prev, [cacheKey]: { books: data, totalPages: totalP } }));
        } else {
          setBooks([]);
          setError(data.message || data.error || "Failed to load books");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, filter, page]);

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-700 overflow-hidden">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        badge={t("browse")}
        icon={<BookOpen size={24} strokeWidth={2.5} />}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} strokeWidth={2.5} />
            <Input 
              placeholder={t("searchPlaceholder")} 
              className="pl-12 rounded-2xl h-12 bg-muted/20 border-border/40 focus:bg-background focus:ring-primary/5 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex p-1.5 bg-muted/20 rounded-2xl border border-border/40 h-14 shadow-inner">
            {['all', 'physical', 'ebook'].map((f) => (
              <button
                key={f}
                className={cn(
                  "px-6 rounded-xl font-black text-[10px] tracking-widest transition-all duration-300",
                  filter === f 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]" 
                    : "hover:bg-muted/40 text-muted-foreground/60"
                )}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f === 'all' ? t("all") : f === 'physical' ? t("physical") : t("ebooks")}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] rounded-[2.5rem] bg-muted/20 animate-pulse border border-border/10"></div>
                <div className="h-4 w-3/4 bg-muted/20 animate-pulse rounded-full"></div>
                <div className="h-3 w-1/2 bg-muted/20 animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 text-center gap-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center shadow-xl shadow-rose-100/50">
              <AlertCircle size={48} strokeWidth={2} className="text-rose-500 opacity-60" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tighter text-rose-950">{t("errorTitle")}</h3>
              <p className="text-sm font-bold text-rose-900/40 max-w-md italic">{error}</p>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 rounded-2xl h-12 px-8 font-black text-xs tracking-widest border-rose-200 hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
              onClick={() => window.location.reload()}
            >
              {t("tryAgain")}
            </Button>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center gap-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-[2.5rem] bg-muted/10 flex items-center justify-center shadow-inner">
              <Search size={48} strokeWidth={2} className="text-muted-foreground/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tighter text-foreground">{t("noBooks")}</h3>
              <p className="text-xs font-black text-muted-foreground/40 tracking-widest italic">{t("noBooksSubtitle")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-x-8 gap-y-12">
              {books.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className="group border border-border/30 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 bg-card overflow-hidden rounded-[2.2rem] flex flex-col cursor-pointer relative"
                    onClick={() => {
                      setSelectedBook(book);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-muted/40">
                      <Image 
                        src={book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"} 
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Floating Labels */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-primary text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl shadow-black/5 border border-black/5 tracking-wider">
                          {book.category?.name || t("uncategorized")}
                        </span>
                        {book.ebook && (
                          <span className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl shadow-primary/30 border border-primary/20 tracking-wider w-fit">
                            {t("ebook")}
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 ease-elastic">
                           <ArrowUpRight size={24} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-black text-base leading-[1.2] line-clamp-2 group-hover:text-primary transition-colors text-foreground tracking-tight">{book.title}</h3>
                        <p className="text-[10px] text-muted-foreground/50 font-black tracking-widest italic">{book.author?.name || t("unknown_author")}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-border/10 flex items-center justify-between">
                         <div className={cn(
                           "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm",
                           book.available_copies_count > 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                         )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", book.available_copies_count > 0 ? "bg-emerald-500" : "bg-rose-500")} />
                            <span className="text-[9px] font-black tracking-widest whitespace-nowrap">
                              {book.available_copies_count > 0 ? `${book.available_copies_count} ${t("available")}` : t("borrowed")}
                            </span>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex border-t border-border/10 pt-12 justify-center items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-2xl w-14 h-14 p-0 border-border/40 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-90"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </Button>
                
                <div className="flex items-center gap-2 p-1.5 bg-muted/20 rounded-[1.5rem] border border-border/30">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-11 h-11 rounded-xl font-black text-xs transition-all duration-300",
                        page === p 
                          ? "bg-white text-primary shadow-xl ring-2 ring-primary/5 scale-110" 
                          : "hover:bg-muted/40 text-muted-foreground/40 hover:text-muted-foreground"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-2xl w-14 h-14 p-0 border-border/40 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-90"
                >
                  <ChevronRight size={24} strokeWidth={2.5} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <BookDetailModal 
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
        .ease-elastic { transition-timing-function: cubic-bezier(0.68, -0.6, 0.32, 1.6); }
      `}</style>
    </div>
  );
}
