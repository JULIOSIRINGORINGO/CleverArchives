"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, Download, Play, 
  Search, Clock, Book, ChevronDown,
  LayoutGrid, List
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/DropdownMenu";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EbooksPage() {
  const t = useTranslations("EbookLibrary");
  const { user } = useAuth();
  const params = useParams();
  const locale = useLocale();
  const router = useRouter();
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');

  const isAdmin = ["admin", "librarian", "developer"].includes(user?.role?.name || "");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ebooksData, categoriesData] = await Promise.all([
          apiService.ebooks.list(),
          apiService.categories.list()
        ]);
        
        setEbooks(Array.isArray(ebooksData) ? ebooksData : []);
        
        const cats = categoriesData?.data || categoriesData;
        if (Array.isArray(cats)) {
          const sorted = [...cats].sort((a, b) => a.name.localeCompare(b.name));
          setCategories(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

  const filteredEbooks = ebooks.filter(e => {
    const matchesSearch = e.book?.title?.toLowerCase().includes(search.toLowerCase()) || 
                         e.book?.author?.name?.toLowerCase().includes(search.toLowerCase());
    
    // Support category filter and format filter (legacy)
    const matchesFilter = filter === 'all' || 
                         String(e.book?.category_id) === String(filter) ||
                         e.file_format?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Split categories for Hybrid Filter
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
            onClick={() => { setFilter(String(cat.id)); }}
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
          searchPlaceholder={t("search_placeholder")}
          isLoading={loading}
          filterOptions={filterOptions}
          activeFilter={filter}
          onFilterChange={setFilter}
          viewMode={viewMode}
          onViewChange={setViewMode}
          extraFilters={categoryDropdown}
        />
      }
    >

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-6 pb-6 pr-1 space-y-8">

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xxl:grid-cols-5 gap-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-[3.2/4] rounded-[2.2rem] bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : filteredEbooks.length === 0 ? (
        <EmptyState 
          icon={Book}
          title={t("no_ebooks")}
          description={t("no_ebooks_subtitle")}
          action={search ? { label: "Reset Filter", onClick: () => setSearch("") } : undefined}
        />
      ) : viewMode === 'standard' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-8">
          {filteredEbooks.map((ebook) => (
            <Card key={ebook.id} className="group border border-border/10 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 bg-white overflow-hidden rounded-[2.2rem] flex flex-col cursor-pointer relative">
              <div className="aspect-[3.2/4] relative overflow-hidden bg-muted/40">
                <img 
                  src={ebook.book?.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center">
                  <div className="flex flex-col gap-3 px-6 w-full max-w-[200px] scale-90 group-hover:scale-100 transition-transform duration-500 ease-elastic">
                    <Button className="w-full rounded-xl font-bold h-12 shadow-xl shadow-black/10" onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/ebooks/${ebook.id}/viewer`); }}>
                      <Play size={18} className="mr-2" /> {t("read_now")}
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl bg-white/20 border-white/30 text-white backdrop-blur-md">
                      <Download size={18} className="mr-2" /> Download
                    </Button>
                  </div>
                </div>
                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-border/20">
                  {ebook.file_format}
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1 h-10">
                  <h3 className="font-bold text-[13px] leading-[1.3] line-clamp-2 group-hover:text-primary transition-colors text-foreground tracking-tight">
                    {ebook.book?.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground/50 font-medium italic truncate">
                    {ebook.book?.author?.name || t("unknown_author")}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-border/10">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText size={12} />
                    <span className="text-[10px] font-bold">{ebook.file_size || t("unknown_size")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <BookListStack>
          {filteredEbooks.map(ebook => (
            <BookListCard 
              key={ebook.id}
              coverUrl={ebook.book?.cover_url}
              title={ebook.book?.title}
              author={ebook.book?.author?.name || t("unknown_author")}
              status={ebook.file_format}
              metadata={[
                { label: t("size"), value: ebook.file_size || t("unknown_size"), icon: FileText }
              ]}
              action={
                <div className="flex items-center gap-2">
                  <Button size="sm" className="rounded-lg h-9 px-4 font-bold" onClick={() => router.push(`/${locale}/ebooks/${ebook.id}/viewer`)}>
                    <Play size={14} className="mr-1.5" /> {t("read_now")}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg h-9 w-9 p-0">
                    <Download size={14} />
                  </Button>
                </div>
              }
            />
          ))}
        </BookListStack>
      )}
      </div>
    </DashboardPage>
  );
}
