"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, Filter, BookOpen, 
  ArrowUpRight, Bookmark, AlertCircle,
  LayoutGrid, List, SlidersHorizontal,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

export default function BookCatalog() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("query") || "");
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const locale = useLocale();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url = `http://localhost:3001/api/v1/books?page=${page}`;
        if (search) url += `&query=${search}`;
        if (filter !== 'all') url += `&filter=${filter}`;

        const response = await fetch(url, {
          headers: {
            'X-Tenant-Slug': 'stellar'
          }
        });
        
        // Parse pagination headers from Pagy
        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
          try {
            const pagyData = JSON.parse(linkHeader);
            setTotalPages(pagyData.pages || 1);
          } catch (e) {
            console.error("Failed to parse pagy header", e);
          }
        }

        const json = await response.json();
        setBooks(json.data || json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, filter, page]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Library Catalog</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search by title, author, or ISBN..." 
              className="pl-12 rounded-2xl h-12 bg-white/50 border-muted-foreground/20 focus:bg-white transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex border border-muted-foreground/20 rounded-2xl overflow-hidden bg-white/50 h-12">
            {['all', 'physical', 'ebook'].map((f) => (
              <button
                key={f}
                className={`px-6 font-bold text-sm capitalize transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                }`}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[400px] rounded-3xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/50 rounded-3xl border border-dashed border-muted-foreground/30">
          <AlertCircle size={48} className="text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-bold">No books found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters to find what you&apos;re looking for.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <Card key={book.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white overflow-hidden rounded-3xl flex flex-col">
                <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                  <Image 
                    src={book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"} 
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-full tracking-widest shadow-sm">
                      {book.category?.name || "Uncategorized"}
                    </span>
                    {book.ebook && (
                      <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-widest shadow-sm w-fit">
                        Ebook
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <Link href={`/${locale}?login=true`}>
                      <Button 
                        className="rounded-full w-12 h-12 p-0 bg-white text-primary hover:scale-110 transition-transform shadow-xl"
                        title="Login to Bookmark"
                      >
                        <Bookmark size={20} />
                      </Button>
                    </Link>
                    <Link href={`/${locale}/books/${book.id}`}>
                      <Button className="rounded-full w-12 h-12 p-0 bg-primary text-white hover:scale-110 transition-transform shadow-xl hover:bg-primary/90">
                        <ArrowUpRight size={20} />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">{book.author?.name || "Unknown Author"}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className={`text-xs font-bold tracking-widest px-2.5 py-1 rounded-full ${
                      book.available_copies_count > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {book.available_copies_count > 0 ? `${book.available_copies_count} Available` : "Unavailable"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl w-10 h-10 p-0"
              >
                <ChevronLeft size={18} />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      page === p 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl w-10 h-10 p-0"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
