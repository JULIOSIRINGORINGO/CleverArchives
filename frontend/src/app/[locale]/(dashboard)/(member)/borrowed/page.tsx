"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Clock, Calendar, 
  ArrowUpRight, AlertCircle, CheckCircle2,
  Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { apiService } from "@/services/api";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";

interface GroupedBorrowing {
  groupId: string;
  items: any[];
  isGroup: boolean;
  representative: any;
}

function BorrowingRow({ borrowing, onReturn, t, locale }: { borrowing: any, onReturn: (id: string) => void, t: any, locale: string }) {
  const isOverdue = borrowing.due_date && new Date(borrowing.due_date) < new Date();
  const isPending = borrowing.status === 'pending';
  const isReturnPending = borrowing.status === 'return_pending';
  const isActive = borrowing.status === 'borrowed';

  return (
    <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 border-b last:border-0 border-border/30">
      <div className="w-12 sm:w-14 aspect-[3/4] rounded-lg overflow-hidden shrink-0 shadow-sm border border-border/50 bg-muted">
        {borrowing.book_copy?.book?.cover_url ? (
          <img src={borrowing.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <BookOpen size={20} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-sm leading-tight line-clamp-1 text-foreground">
            {borrowing.book_copy?.book?.title}
          </h4>
          <Link href={`/${locale}/catalog`} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
          {borrowing.book_copy?.book?.author?.name}
        </p>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground leading-none">
            <Calendar size={12} className="text-primary/70" />
            <span className={isOverdue && isActive ? "text-red-500" : ""}>
              {isPending ? t("requestedOn") : t("dueDate")} {new Date(isPending ? borrowing.created_at : borrowing.due_date).toLocaleDateString(locale)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 h-full">
            {isPending && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                <Clock size={10} /> {t("pendingApproval")}
              </span>
            )}
            {isReturnPending && (
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                <Clock size={10} /> {t("processingReturn")}
              </span>
            )}
            {isActive && (
              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 flex items-center gap-1 text-center">
                <CheckCircle2 size={10} /> {isOverdue ? t("overdue") : t("active")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 pl-2">
        {isActive && (
          <Button 
            variant="outline" 
            size="sm" 
            className="font-bold hover:bg-primary hover:text-white transition-all shadow-sm px-3 h-8"
            onClick={() => onReturn(borrowing.id)}
          >
            {t("requestReturn")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function BorrowedBooks() {
  const { toast } = useToast();
  const t = useTranslations("Borrowed");
  const locale = useLocale();
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const data = await apiService.borrowings.list({ 
        status: 'active', 
        page: page.toString() 
      });
      
      const list = Array.isArray(data) ? data : (data.data || []);
      setBorrowings(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [page]);

  const handleReturnRequest = async (id: string) => {
    try {
      await apiService.borrowings.requestReturn(id);
      toast(t("returnSuccess"), "success");
      fetchBorrowings();
    } catch (err: any) {
      toast(err.message || "Error", "error");
    }
  };

  const grouped: GroupedBorrowing[] = (() => {
    const groups: Record<string, any[]> = {};
    const singles: any[] = [];
    
    borrowings.forEach(b => {
      if (b.group_id) {
        if (!groups[b.group_id]) groups[b.group_id] = [];
        groups[b.group_id].push(b);
      } else {
        singles.push(b);
      }
    });

    const result: GroupedBorrowing[] = [];
    Object.entries(groups).forEach(([gid, items]) => {
      result.push({ groupId: gid, items, isGroup: true, representative: items[0] });
    });
    singles.forEach(s => {
      result.push({ groupId: `single-${s.id}`, items: [s], isGroup: false, representative: s });
    });

    return result.sort((a, b) => new Date(b.representative.created_at).getTime() - new Date(a.representative.getTime ? a.representative.created_at : 0).getTime());
  })();

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-500 overflow-hidden">
      <PageHeader
        title={t("title")}
        badge={t("active_borrowings")}
        icon={<BookOpen size={24} strokeWidth={2.5} />}
      >
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={16} />
          <Input 
            placeholder={t("searchPlaceholder")} 
            className="pl-10 rounded-xl h-10 w-full md:w-64 bg-card border-border/50 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs" 
          />
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-card rounded-3xl animate-pulse border border-border/50 shadow-sm" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 bg-card rounded-[2.5rem] border border-dashed border-border/40 shadow-inner">
            <div className="p-8 bg-muted rounded-full text-muted-foreground/30">
              <BookOpen size={64} strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight">{t("noBorrowed")}</h3>
              <p className="text-muted-foreground text-sm font-medium">{t("noBorrowedSubtitle")}</p>
            </div>
            <Link href={`/${locale}/catalog`}>
              <Button className="h-10 px-8 font-bold text-xs shadow-lg">{t("browseCatalog")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <Card key={group.groupId} className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-[2rem]">
                <div className="px-6 py-4 bg-muted/20 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground leading-none mb-1">
                        {group.isGroup ? t("group_borrowing") : t("single_borrowing")}
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {new Date(group.representative.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {group.isGroup && (
                    <span className="text-[9px] font-bold bg-primary text-white px-3 py-1 rounded-full shadow-sm">
                      {group.items.length} {t("books_unit")}
                    </span>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-1">
                    {group.items.map((borrowing) => (
                      <BorrowingRow 
                        key={borrowing.id} 
                        borrowing={borrowing} 
                        onReturn={handleReturnRequest} 
                        t={t} 
                        locale={locale} 
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl font-bold text-xs"
                >
                  {t("previous")}
                </Button>
                <div className="text-xs font-bold text-muted-foreground">
                  {t("pageOf", { current: page, total: totalPages })}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl font-bold text-xs"
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
