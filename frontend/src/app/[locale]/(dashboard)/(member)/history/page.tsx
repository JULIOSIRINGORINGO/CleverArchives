"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, ArrowRight, Calendar, 
  History as HistoryIcon, Clock, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { apiService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

// Koleksi Komponen Utama
import { DashboardPage } from "@/components/layout/DashboardPage";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BorrowHistory() {
  const t = useTranslations("History");
  const locale = useLocale();
  
  // State Management
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');

  useEffect(() => {
    const saved = localStorage.getItem('historyViewMode');
    if (saved === 'standard' || saved === 'compact') setViewMode(saved);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await apiService.borrowings.list({ status: 'returned', items: '100' });
        setBorrowings(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const processedHistory = [...borrowings]
    .filter(b => 
      b.book_copy?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.book_copy?.book?.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return activeFilter === 'oldest' ? dateA - dateB : dateB - dateA;
    });

  const filterOptions = [
    { id: 'all', label: locale === 'id' ? "Semua" : "All" },
    { id: 'oldest', label: locale === 'id' ? "Terlama" : "Oldest" }
  ];

  return (
    <DashboardPage 
      icon={<HistoryIcon className="text-primary" size={22} />}
      headerControls={
        <UnifiedFilterBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={t("searchPlaceholder")}
          isLoading={loading}
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          viewMode={viewMode}
          onViewChange={(mode) => {
            setViewMode(mode);
            localStorage.setItem('historyViewMode', mode);
          }}
        />
      }
    >
      <div className="pb-16 px-1">
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8 opacity-20">
               <div className="w-8 h-8 rounded-xl bg-primary animate-pulse" />
               <div className="h-4 w-32 bg-primary/20 rounded-full animate-pulse" />
            </div>
            <BookListCard.Skeleton isCompact={viewMode === 'compact'} count={5} />
          </div>
        ) : processedHistory.length === 0 ? (
          <EmptyState 
            icon={HistoryIcon}
            title={t("noHistory")}
            description={t("noHistorySubtitle")}
            action={{ label: t("startReading"), href: `/${locale}/catalog` }}
          />
        ) : (
          <div className="space-y-8 pt-4">

            <BookListStack viewMode={viewMode}>
              <AnimatePresence mode="popLayout">
                {processedHistory.map((borrowing, idx) => (
                  <motion.div
                    key={borrowing.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <BookListCard 
                      isCompact={viewMode === 'compact'}
                      typeIcon={CheckCircle2}
                      typeLabel={t("returned") || "Selesai"}
                      title={borrowing.book_copy?.book?.title}
                      author={borrowing.book_copy?.book?.author?.name}
                      coverUrl={borrowing.book_copy?.book?.cover_url}
                      status="completed"
                      metadata={[
                        { 
                          label: locale === 'id' ? "Dipinjam" : "Borrowed", 
                          value: new Date(borrowing.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
                          icon: Clock
                        },
                        { 
                          label: locale === 'id' ? "Dikembalikan" : "Returned", 
                          value: new Date(borrowing.updated_at || borrowing.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
                          icon: Calendar
                        }
                      ]}
                      action={
                        <Link href={`/${locale}/catalog`}>
                          <Button 
                            size="sm" 
                            className="rounded-2xl font-bold gap-3 h-11 px-6 active:scale-95 transition-all text-[11px] uppercase tracking-widest bg-white text-primary border-2 border-primary/10 hover:bg-primary hover:text-white hover:border-primary"
                          >
                            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                            {t("revisit") || "Baca Lagi"} 
                            <ArrowRight size={14} strokeWidth={3} className="opacity-40" />
                          </Button>
                        </Link>
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </BookListStack>
          </div>
        )}
      </div>
    </DashboardPage>
  );
}
