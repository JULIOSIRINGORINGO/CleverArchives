"use client";

import { useState, useEffect } from "react";
import { 
  Search, BookOpen, 
  ArrowUpRight, AlertCircle,
  ChevronLeft, ChevronRight, Bookmark, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/DropdownMenu";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import BookDetailModal from "@/components/books/BookDetailModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MemberCatalog() {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [cache, setCache] = useState<Record<string, any>>({});
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tenantSlug = localStorage.getItem('tenant-slug') || 'demo-lib';
        const response = await fetch(`${API_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Tenant-Slug': tenantSlug,
          }
        });
        const json = await response.json();
        const data = json.data || json;
        if (Array.isArray(data)) {
          // Sort alphabetically as requested
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setCategories(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [API_URL]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_URL}/books?page=${page}`;
        if (search) url += `&query=${encodeURIComponent(search)}`;
        
        // Handle physical/ebook legacy or category_id
        if (filter === 'physical' || filter === 'ebook') {
          url += `&filter=${filter}`;
        } else if (filter !== 'all') {
          url += `&category_id=${filter}`;
        }

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
  }, [search, filter, page, API_URL, cache]);

  // Process filters: Top 3 as tabs, rest in dropdown
  const topCategories = categories.slice(0, 3);
  const otherCategories = categories.slice(3);
  const isFilterInDropdown = otherCategories.some(c => String(c.id) === String(filter));
  const activeOtherCategory = otherCategories.find(c => String(c.id) === String(filter));

  const filterOptions = [
    { id: 'all', label: t("all") },
    ...topCategories.map(c => ({ id: String(c.id), label: c.name }))
  ];

  const categoryDropdown = otherCategories.length > 0 && (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button 
          variant="outline" 
          className={cn(
            "h-11 px-5 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 border border-border/40",
            isFilterInDropdown 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
              : "bg-white text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {isFilterInDropdown ? activeOtherCategory?.name : (locale === 'id' ? "Lainnya" : "More")}
          <ChevronDown size={16} strokeWidth={2.5} className={cn("transition-transform", isFilterInDropdown ? "rotate-0" : "opacity-50")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-2">
        {otherCategories.map((cat) => (
          <DropdownMenuItem 
            key={cat.id}
            onClick={() => { setFilter(String(cat.id)); setPage(1); }}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              String(filter) === String(cat.id) 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {cat.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DashboardPage 
      headerControls={
        <UnifiedFilterBar 
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("searchPlaceholder")}
          isLoading={loading}
          filterOptions={filterOptions}
          activeFilter={filter}
          onFilterChange={(id) => { setFilter(id); setPage(1); }}
          viewMode={viewMode}
          onViewChange={setViewMode}
          extraFilters={categoryDropdown}
        />
      }
      footer={
        totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl w-11 h-11 p-0 bg-white border-border/40 hover:bg-muted/50 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </Button>
            
            <div className="flex items-center gap-2 p-1.5 bg-white/50 rounded-[1.5rem] border border-border/30 shadow-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-11 h-11 rounded-xl font-bold text-xs transition-all duration-300",
                    page === p 
                      ? "bg-white text-primary shadow-xl ring-1 ring-black/5 scale-105" 
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
              className="rounded-xl w-11 h-11 p-0 bg-white border-border/40 hover:bg-muted/50 transition-all shadow-sm active:scale-95"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </Button>
          </div>
        )
      }
    >
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
            <h3 className="text-2xl font-bold tracking-tight text-rose-950">{t("errorTitle")}</h3>
            <p className="text-sm font-medium text-rose-900/40 max-w-md italic">{error}</p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 rounded-2xl h-12 px-8 font-bold text-xs border-rose-200 hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
            onClick={() => window.location.reload()}
          >
            {t("tryAgain")}
          </Button>
        </div>
      ) : books.length === 0 ? (
        <EmptyState 
          icon={Search}
          title={t("noBooks")}
          description={t("noBooksSubtitle")}
          action={search ? { label: t("clearSearch") || "Clear Search", onClick: () => setSearch("") } : undefined}
        />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {viewMode === 'standard' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-x-8 gap-y-12">
              {books.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className="group border border-border/10 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 bg-white overflow-hidden rounded-[2.2rem] flex flex-col cursor-pointer relative"
                    onClick={() => {
                      setSelectedBook(book);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="aspect-[3.2/4] relative overflow-hidden bg-muted/40">
                      <Image 
                        src={book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"} 
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-primary text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xl shadow-black/5 border border-black/5">
                          {book.category?.name || t("uncategorized")}
                        </span>
                        {book.ebook && (
                          <span className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xl shadow-primary/30 border border-primary/20 w-fit">
                            {t("ebook")}
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 ease-elastic">
                           <ArrowUpRight size={24} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1 h-10">
                        <h3 className="font-bold text-[13px] leading-[1.3] line-clamp-2 group-hover:text-primary transition-colors text-foreground tracking-tight">{book.title}</h3>
                        <p className="text-[10px] text-muted-foreground/50 font-medium italic truncate">{book.author?.name || t("unknown_author")}</p>
                      </div>
                      
                      <div className="pt-3 border-t border-border/10">
                        <StatusBadge 
                          status={book.available_copies_count > 0 ? "available" : "borrowed"} 
                          label={book.available_copies_count > 0 ? `${book.available_copies_count} ${t("available")}` : undefined}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <BookListStack viewMode="compact">
              {books.map((book) => (
                <BookListCard 
                  key={book.id}
                  isCompact={true}
                  title={book.title}
                  author={book.author?.name || t("unknown_author")}
                  status={book.available_copies_count > 0 ? "available" : "borrowed"}
                  coverUrl={book.cover_url}
                  metadata={[
                    { 
                      label: t("category") || "Category", 
                      value: book.category?.name || t("uncategorized"), 
                      icon: Bookmark
                    }
                  ]}
                  action={
                    <Button 
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 text-xs border-none"
                      onClick={() => {
                        setSelectedBook(book);
                        setIsModalOpen(true);
                      }}
                    >
                      {locale === 'id' ? "Dapatkan" : "Get It"} 
                      <ArrowUpRight size={14} strokeWidth={2.5} />
                    </Button>
                  }
                />
              ))}
            </BookListStack>
          )}
        </div>
      )}

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
    </DashboardPage>
  );
}
