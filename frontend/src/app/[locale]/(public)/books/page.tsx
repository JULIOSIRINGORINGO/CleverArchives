"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ArrowUpRight, Bookmark, Clock, BookOpen,
  LayoutGrid, List
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

// Koleksi Komponen Utama (Elemen yang Dipanggil)
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BookCatalog() {
  const searchParams = useSearchParams();
  const t = useTranslations("Common"); // Menggunakan kunci dari Common/History sesuai ketersediaan
  const locale = useLocale();
  
  // State Management
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("query") || "");
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Ambil Preferensi ViewMode
  useEffect(() => {
    const saved = localStorage.getItem('catalogViewMode');
    if (saved === 'standard' || saved === 'compact') setViewMode(saved);
  }, []);

  // Fetch Data (Murni Data-Driven)
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url = `http://localhost:3001/api/v1/books?page=${page}&items=12`;
        if (search) url += `&query=${search}`;
        if (filter !== 'all') url += `&filter=${filter}`;

        const response = await fetch(url, { headers: { 'X-Tenant-Slug': 'stellar' } });
        
        // Pagination logic
        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
          try {
            const pagyData = JSON.parse(linkHeader);
            setTotalPages(pagyData.pages || 1);
          } catch (e) {}
        }

        const json = await response.json();
        setBooks(json.data || json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBooks, 400);
    return () => clearTimeout(timeoutId);
  }, [search, filter, page]);

  const filterOptions = [
    { id: 'all', label: locale === 'id' ? "Semua" : "All" },
    { id: 'physical', label: locale === 'id' ? "Fisik" : "Physical" },
    { id: 'ebook', label: "Ebook" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Elemen Kontrol */}
      <UnifiedFilterBar 
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder={locale === 'id' ? "Cari judul, penulis, atau ISBN..." : "Search title, author, or ISBN..."}
        isLoading={loading}
        filterOptions={filterOptions}
        activeFilter={filter}
        onFilterChange={(f) => { setFilter(f); setPage(1); }}
        viewMode={viewMode}
        onViewChange={(mode) => {
          setViewMode(mode);
          localStorage.setItem('catalogViewMode', mode);
        }}
      />

      {loading ? (
        viewMode === 'standard' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-6">
             {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
               <div key={i} className="h-[420px] rounded-xl bg-muted animate-pulse" />
             ))}
          </div>
        ) : (
          <BookListCard.Skeleton isCompact={viewMode === 'compact'} count={6} />
        )
      ) : books.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title={locale === 'id' ? "Buku Tidak Ditemukan" : "No Books Found"}
          description={locale === 'id' ? "Coba sesuaikan pencarian atau filter Anda." : "Try adjusting your search or filters."}
        />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {viewMode === 'standard' ? (
            /* GRID VIEW (Tampilan Visual) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-4">
              {books.map((book) => (
                <Card key={book.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white overflow-hidden rounded-xl flex flex-col h-full border border-border/10">
                  <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                    <Image 
                      src={book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"} 
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       <StatusBadge 
                         status={book.available_copies_count > 0 ? "available" : "unavailable"} 
                         className="scale-90 origin-left"
                       />
                       {book.ebook && (
                         <span className="bg-blue-600 shadow-lg text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit uppercase tracking-wider">
                           Ebook
                         </span>
                       )}
                    </div>
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <Link href={`/${locale}/books/${book.id}`}>
                        <Button className="rounded-full w-12 h-12 p-0 bg-white text-primary hover:scale-110 transition-transform shadow-xl">
                          <ArrowUpRight size={20} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 font-medium italic opacity-80">{book.author?.name || "Unknown Author"}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                         {book.category?.name || "Uncategorized"}
                       </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* LIST VIEW (Tampilan Terpadu / Elemen Riwayat) */
            <BookListStack viewMode="compact">
              {books.map((book) => (
                <BookListCard 
                  key={book.id}
                  isCompact={true}
                  title={book.title}
                  author={book.author?.name || "Unknown Author"}
                  status={book.available_copies_count > 0 ? "available" : "unavailable"}
                  coverUrl={book.cover_url}
                  metadata={[
                    { 
                      label: "Category", 
                      value: book.category?.name || "Uncategorized", 
                      icon: Bookmark 
                    }
                  ]}
                  action={
                    <Link href={`/${locale}/books/${book.id}`}>
                      <Button 
                        size="sm" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 text-xs border-none"
                      >
                        {locale === 'id' ? "Lihat Detail" : "View Details"} 
                        <ArrowUpRight size={14} strokeWidth={2.5} />
                      </Button>
                    </Link>
                  }
                />
              ))}
            </BookListStack>
          )}

          {/* Pagination Elemen */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-12 pb-8">
               <Button 
                variant="outline" 
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl w-10 h-10 bg-white border-border/40 hover:bg-muted/50 transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </Button>
              
              <div className="text-[10px] font-bold text-muted-foreground/40 leading-none px-4">
                {page} / {totalPages}
              </div>

              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl w-10 h-10 bg-white border-border/40 hover:bg-muted/50 transition-all shadow-sm active:scale-95"
              >
                 <ChevronRight size={16} strokeWidth={2.5} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper untuk pagination icons yang hilang dari import
function ChevronLeft({ size, className, strokeWidth }: any) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>;
}

function ChevronRight({ size, className, strokeWidth }: any) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;
}
