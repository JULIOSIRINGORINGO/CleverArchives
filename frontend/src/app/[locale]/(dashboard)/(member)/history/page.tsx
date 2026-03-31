"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, ArrowRight, Calendar, 
  Search, History as HistoryIcon, 
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { apiService } from "@/services/api";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";

export default function BorrowHistory() {
  const t = useTranslations("History");
  const locale = useLocale();
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await apiService.borrowings.list({ 
          status: 'returned', 
          page: page.toString(),
          items: '10'
        });
        
        if (Array.isArray(data)) {
          setBorrowings(data);
          setTotalPages(1); 
        } else if (data && data.data) {
          setBorrowings(data.data);
          setTotalPages(data.pages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchHistory();
  }, [page]);

  const filteredHistory = borrowings.filter(b => 
    b.book_copy?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.book_copy?.book?.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const HistorySkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl animate-pulse border border-border/50">
          <div className="w-10 h-14 bg-muted rounded-md shrink-0"></div>
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-muted rounded w-1/3"></div>
            <div className="h-2 bg-muted rounded w-1/4"></div>
          </div>
          <div className="w-20 h-3 bg-muted rounded hidden md:block"></div>
          <div className="w-20 h-3 bg-muted rounded hidden md:block"></div>
          <div className="w-16 h-6 bg-muted rounded-md shrink-0"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-500 overflow-hidden">
      <PageHeader
        title={t("title")}
        badge={t("completed_borrowings")}
        icon={<HistoryIcon size={24} strokeWidth={2.5} />}
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" size={16} />
            <Input 
              placeholder={t("searchPlaceholder")} 
              className="pl-10 rounded-xl h-10 bg-card border-border/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl h-10 px-4 font-medium text-xs bg-card shrink-0 gap-2 border-border/50 hover:bg-muted/50 transition-all shadow-sm">
            <Filter size={14} /> {t("filter")}
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
        {loading ? (
          <HistorySkeleton />
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 bg-card rounded-[2.5rem] border border-dashed border-border/40 shadow-inner">
            <div className="p-8 bg-muted rounded-full text-muted-foreground/30">
              <HistoryIcon size={64} strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">{t("noHistory")}</h3>
              <p className="text-muted-foreground text-sm font-medium">{t("noHistorySubtitle")}</p>
            </div>
            <Link href={`/${locale}/catalog`}>
              <Button className="h-10 px-8 font-medium text-xs shadow-lg">{t("startReading")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-border/40 shadow-sm bg-card rounded-[2rem] overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/30">
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground tracking-widest">{t("bookTitle")}</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground tracking-widest hidden sm:table-cell">{t("borrowed")}</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground tracking-widest hidden md:table-cell">{t("returned")}</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground tracking-widest">{t("status")}</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground tracking-widest text-right">{t("action")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filteredHistory.map((borrowing) => (
                        <tr key={borrowing.id} className="hover:bg-muted/10 transition-all duration-200 group">
                          <td className="px-6 py-4 min-w-[240px]">
                            <div className="flex items-center gap-4">
                              <div className="w-12 aspect-[3/4] bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border/50 shadow-sm shrink-0">
                                <img 
                                  src={borrowing.book_copy?.book?.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&q=80"} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="space-y-1">
                                <Link 
                                  href={`/${locale}/catalog`}
                                  className="font-bold text-sm leading-tight text-foreground hover:text-primary transition-colors line-clamp-1"
                                >
                                  {borrowing.book_copy?.book?.title}
                                </Link>
                                <p className="text-xs text-muted-foreground font-medium truncate">
                                  {borrowing.book_copy?.book?.author?.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
                              <Calendar size={13} className="text-primary/60" />
                              {new Date(borrowing.borrow_date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
                              <Calendar size={13} className="text-emerald-500/60" />
                              {new Date(borrowing.return_date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold tracking-widest flex items-center w-fit gap-2 border border-emerald-100 shadow-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              {t("completed")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/${locale}/catalog`}>
                              <Button variant="ghost" size="sm" className="rounded-xl h-9 px-3 text-primary tracking-tight font-bold text-xs hover:bg-primary/5 group/btn gap-2">
                                {t("revisit")} <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl font-medium h-9 px-4 text-xs shadow-sm bg-card border-border/50"
                >
                  {t("previous")}
                </Button>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest bg-muted/30 px-3 py-1.5 rounded-lg border border-border/30">
                    {t("pageOf", { current: page, total: totalPages })}
                  </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl font-medium h-9 px-4 text-xs shadow-sm bg-card border-border/50"
                >
                  {t("next")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
