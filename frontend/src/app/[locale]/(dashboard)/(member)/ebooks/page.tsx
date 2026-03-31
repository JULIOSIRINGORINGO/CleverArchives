"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, Download, Play, BookOpen, 
  Search, Filter, ArrowUpRight, Clock,
  Book
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

export default function EbooksPage() {
  const t = useTranslations("EbookLibrary");
  const { user } = useAuth();
  const params = useParams();
  const locale = params?.locale || 'en';
  const router = useRouter();
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const isAdmin = ["admin", "librarian", "developer"].includes(user?.role?.name || "");

  useEffect(() => {
    const fetchEbooks = async () => {
      setLoading(true);
      try {
        const json = await apiService.ebooks.list();
        setEbooks(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEbooks();
  }, []);

  const filteredEbooks = ebooks.filter(e => {
    const matchesSearch = e.book?.title?.toLowerCase().includes(search.toLowerCase()) || 
                         e.book?.author?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.file_format?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 px-2 md:px-0 text-foreground">
      <PageHeader
        title={t("title")}
        badge={t("digital_collection")}
        icon={<Book size={24} strokeWidth={2.5} />}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={18} />
            <Input 
              placeholder={t("search_placeholder")} 
              className="pl-12 rounded-2xl h-12 bg-muted/20 border-border/40 focus:bg-background focus:ring-primary/5 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex p-1 bg-muted/20 rounded-2xl border border-border/40 h-12 shadow-inner">
            {['all', 'PDF', 'EPUB'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 rounded-xl text-[10px] font-bold tracking-widest transition-all duration-300",
                  filter === f 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === 'all' ? t("all") : f}
              </button>
            ))}
          </div>

          {isAdmin && (
            <Button className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 bg-primary text-white border-none">
              <FileText size={18} className="mr-2" /> {t("upload")}
            </Button>
          )}
        </div>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-muted-foreground/20">
          <Book size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold">{t("no_ebooks")}</h3>
          <p className="text-muted-foreground">{t("no_ebooks_subtitle")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredEbooks.map((ebook) => (
            <Card key={ebook.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden rounded-[2.5rem] flex flex-col">
              <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                <img 
                  src={ebook.book?.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="w-full flex gap-2">
                    <Button className="flex-1 rounded-xl font-bold h-11" onClick={() => router.push(`/${locale}/ebooks/${ebook.id}/viewer`)}>
                      <Play size={16} className="mr-2" /> {t("read_now")}
                    </Button>
                    <Button variant="outline" className="w-11 h-11 p-0 rounded-xl bg-white/20 border-white/30 text-white backdrop-blur-md">
                      <Download size={16} />
                    </Button>
                  </div>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md tracking-widest">
                  {ebook.file_format}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {ebook.book?.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {ebook.book?.author?.name || t("unknown_author")}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold tracking-widest text-muted-foreground/60">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} /> {ebook.file_size || t("unknown_size")}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
