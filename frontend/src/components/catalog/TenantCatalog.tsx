"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import useSWR, { useSWRConfig, unstable_serialize } from "swr";
import useSWRInfinite from "swr/infinite";
import { 
  BookMarked, Search, Filter, BookOpen, 
  CheckCircle2, XCircle, Clock, ChevronRight,
  Database, Bookmark, BarChart3, Plus,
  Edit2, Trash2, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import BookFormModal from "@/components/books/BookFormModal";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { UnifiedSearch } from "@/components/ui/UnifiedSearch";
import { cn } from "@/lib/utils";

export default function TenantCatalog() {
  const t = useTranslations("Catalog");
  const { cache } = useSWRConfig();
  
  // Try to get initial books from cache to avoid flicker
  const initialKey = unstable_serialize(['/books', null, '', 'all']);
  const cachedBooks = cache.get(initialKey)?.data;
  
  const [books, setBooks] = useState<any[]>(cachedBooks?.data || cachedBooks || []);
  const [loading, setLoading] = useState(!cachedBooks);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const [lastSync, setLastSync] = useState<string | null>(null);

  // useSWRInfinite for books with pagination
  const getKey = (pageIndex: number, previousPageData: any) => {
    // If we've reached the end, return null
    if (previousPageData && !previousPageData.data?.length) return null;
    
    // Key format: [endpoint, lastSync, search, categoryFilter, page]
    // index starts at 0, so page is index + 1
    return ['/books', lastSync, search, categoryFilter, pageIndex + 1];
  };

  const { data: infiniteData, size, setSize, mutate: mutateBooks, isLoading, isValidating } = useSWRInfinite(
    getKey,
    (key) => {
      if (!key) return null;
      const params: Record<string, string> = { 
        updated_after: (key[1] as string) || '',
        q: (key[2] as string) || '',
        category_id: (key[3] === 'all' ? '' : categories.find(c => c.name === key[3])?.id.toString()) || '',
        page: (key[4] as number).toString()
      };
      return apiService.books.list(params);
    },
    {
      revalidateFirstPage: false, // Use cache for first page
      revalidateOnFocus: true,
      persistSize: true
    }
  );

  // Flatten the pages into a single list of books
  const allBooks = useMemo(() => {
    if (!infiniteData) return books; // fallback to initial cached sync if exists
    return infiniteData.flatMap(page => page.data || []);
  }, [infiniteData, books]);

  const hasMore = infiniteData ? infiniteData[infiniteData.length - 1]?.data?.length === 20 : false;
  
  // Intersection Observer for Infinite Scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: any) => {
    if (isLoading || isValidating) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setSize(s => s + 1);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, isValidating, hasMore, setSize]);

  useEffect(() => {
    if (infiniteData) {
      setLoading(false);
    }
  }, [infiniteData]);

  // useSWR for categories
  const { data: catData } = useSWR('/categories', () => apiService.categories.list(), {
    onSuccess: (res) => {
      if (res?.categories) setCategories(res.categories);
    }
  });

  const fetchData = async () => {
    mutateBooks();
  };

  useEffect(() => { 
    // We no longer clear books or set loading=true here.
    // Instead, we just reset lastSync so SWR performs a full sync for the new search/filter in the background.
    // If the data is already in cache (from prefetcher), it will show instantly.
    setLastSync(null); 
  }, [search, categoryFilter]);

  const filteredBooks = useMemo(() => {
    return Array.isArray(allBooks) ? allBooks.filter(b => {
      const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) || 
                           b.isbn?.toLowerCase().includes(search.toLowerCase()) ||
                           b.author?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || b.category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    }) : [];
  }, [allBooks, search, categoryFilter]);

  const handleCreate = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus buku ini dari katalog?")) return;
    try {
      await apiService.delete(`/books/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardPage
      headerActions={
        <div className="flex items-center gap-3">
          <UnifiedSearch 
            value={search}
            onChange={setSearch}
            placeholder={t("searchPlaceholder") || "Cari buku..."}
            isLoading={loading}
          />
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 h-11 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} />
            <span>{t("addBook") || "Tambah Buku"}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8 flex flex-col min-h-0 py-6 pr-1 overflow-y-auto custom-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
          {[
            { label: "Total Buku", value: books.reduce((acc, b) => acc + (b.copies_count || 0), 0), icon: BookOpen, color: "text-blue-600 bg-blue-50" },
            { label: "Tersedia", value: books.reduce((acc, b) => acc + (b.available_copies_count || 0), 0), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
            { label: "Dipinjam", value: books.reduce((acc, b) => acc + (b.copies_count - b.available_copies_count || 0), 0), icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Kategori", value: categories.length, icon: Bookmark, color: "text-violet-600 bg-violet-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border/50 p-6 rounded-3xl flex items-center gap-4 shadow-sm group hover:border-primary/20 transition-colors">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.color}`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 truncate">{stat.label}</div>
                <div className="text-xl font-bold tracking-tight">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-2xl border border-border/30 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-muted-foreground shadow-sm">
            <Filter size={18} />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none font-bold text-xs pr-8 cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-[2.5rem] border border-border/10" />)}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-muted/10 border border-dashed border-border/50 p-24 rounded-[3rem] text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-[2.5rem] bg-card border border-border/50 flex items-center justify-center shadow-inner">
              <Search size={32} className="text-muted-foreground/20" />
            </div>
            <p className="text-muted-foreground font-medium italic text-sm">Tidak ada buku yang sesuai dengan kriteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {filteredBooks.map((book, i) => (
              <motion.div 
                key={book.id}
                ref={i === filteredBooks.length - 1 ? lastElementRef : null}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 20) * 0.05 }}
                className="bg-card border border-border/50 rounded-[2.2rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group hover:-translate-y-1.5 flex flex-col relative overflow-hidden"
              >
                <div className="flex gap-5 items-start relative z-10">
                  <div className="w-24 h-32 rounded-2xl bg-muted/40 border border-border/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative group-hover:scale-105 transition-transform duration-500">
                     <BookOpen size={40} className="text-primary/20" />
                     {book.cover_url && <img src={book.cover_url} className="absolute inset-0 w-full h-full object-cover" alt="" />}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="text-[9px] font-bold text-primary uppercase mb-1">{book.category?.name || "Uncategorized"}</div>
                    <h3 className="font-bold text-base mb-1 leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors tracking-tight">{book.title}</h3>
                    <div className="text-xs text-muted-foreground/60 font-medium italic mb-4">{book.author?.name || "Unknown Author"}</div>
                    
                    <div className="flex flex-wrap gap-2">
                       <span className={cn(
                         "text-[9px] font-bold px-3 py-1 rounded-full border shadow-sm",
                         book.available_copies_count > 0 
                           ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                           : 'bg-rose-50 text-rose-600 border-rose-100'
                       )}>
                         {book.available_copies_count > 0 ? "Tersedia" : "Habis"}
                       </span>
                       <span className="text-[9px] font-bold bg-muted/50 text-muted-foreground px-3 py-1 rounded-full border border-border/50 backdrop-blur-sm">
                         {book.available_copies_count} / {book.copies_count || 0} Eks
                       </span>
                    </div>
                  </div>

                  <div className="absolute right-0 top-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded-xl transition-all active:scale-90">
                          <MoreVertical size={18} className="text-muted-foreground/40" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border border-border/50 shadow-2xl p-1.5 bg-white min-w-[160px]">
                        <DropdownMenuItem onClick={() => handleEdit(book)} className="gap-3 font-bold text-xs p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors">
                          <Edit2 size={14} className="text-blue-500" /> 
                          <span>Edit Detail Buku</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(book.id)} className="gap-3 font-bold text-xs p-3 rounded-xl cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 transition-colors">
                          <Trash2 size={14} className="text-rose-500" /> 
                          <span>Hapus Permanen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <BarChart3 size={12} strokeWidth={2.5} /> 
                    <span>ISBN: {book.isbn || 'N/A'}</span>
                  </div>
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 translate-x-2 group-hover:translate-x-0">
                    Kelola Stok <ChevronRight size={14} strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>
            ))}
            {isValidating && size > 1 && (
              <div className="col-span-full py-12 flex items-center justify-center gap-3 text-muted-foreground font-bold italic text-sm animate-pulse">
                <Clock size={18} className="animate-spin" />
                Sambil cari buku lainnya...
              </div>
            )}
          </div>
        )}
      </div>

      <BookFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        book={selectedBook} 
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
      `}</style>
    </DashboardPage>
  );
}
