"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Clock, Calendar, 
  RotateCcw, Search, User, Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale, useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import { useToast } from "@/components/ui/Toast";

// Koleksi Komponen Utama (Elemen yang Dipanggil)
import { DashboardPage } from "@/components/layout/DashboardPage";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BorrowedBooks() {
  const { toast } = useToast();
  const t = useTranslations("Borrowed");
  const locale = useLocale();
  
  // State Management
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'overdue' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');
  const [searchQuery, setSearchQuery] = useState("");

  // Ambil Preferensi ViewMode
  useEffect(() => {
    const saved = localStorage.getItem('borrowedViewMode');
    if (saved === 'standard' || saved === 'compact') setViewMode(saved);
  }, []);

  // Fetch Data
  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const data = await apiService.borrowings.list({ status: 'active' });
      setBorrowings(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBorrowings(); }, []);

  // Aksi Kembalikan Buku
  const handleReturnRequest = async (id: string) => {
    try {
      await apiService.borrowings.requestReturn(id);
      toast(t("returnSuccess"), "success");
      fetchBorrowings();
    } catch (err: any) {
      toast(err.message || "Error", "error");
    }
  };

  // Filter & Gruping Data (Logika Murni)
  const filteredItems = borrowings.filter(item => {
    const titleMatch = item.book_copy?.book?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = item.book_copy?.book?.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!(titleMatch || authorMatch)) return false;

    if (activeFilter === 'all') return true;
    const isOverdue = item.due_date && new Date(item.due_date) < new Date();
    if (activeFilter === 'overdue') return item.status === 'borrowed' && isOverdue;
    if (activeFilter === 'active') return item.status === 'borrowed' && !isOverdue;
    if (activeFilter === 'pending') return ['pending', 'return_pending'].includes(item.status);
    return true;
  });

  // Elemen Kontrol Atas (Panggil UnifiedFilterBar)
  const filterOptions = [
    { id: 'all', label: locale === 'id' ? "Semua" : "All" },
    { id: 'active', label: locale === 'id' ? "Sedang Dipinjam" : "Borrowed" },
    { id: 'pending', label: locale === 'id' ? "Pending" : "Pending" },
    { id: 'overdue', label: locale === 'id' ? "Terlambat" : "Overdue" },
  ];

  return (
    <DashboardPage 
      headerControls={
        <UnifiedFilterBar 
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("searchPlaceholder")}
          isLoading={loading}
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={(id) => setActiveFilter(id as any)}
          viewMode={viewMode}
          onViewChange={(mode) => {
            setViewMode(mode);
            localStorage.setItem('borrowedViewMode', mode);
          }}
        />
      }
    >
      {loading ? (
        <BookListCard.Skeleton isCompact={viewMode === 'compact'} count={5} />
      ) : filteredItems.length === 0 ? (
        <EmptyState 
          icon={searchQuery ? Search : BookOpen}
          title={searchQuery ? (locale === 'id' ? "Tidak ditemukan" : "No results") : (t("noBorrowed") || "Belum Ada Peminjaman")}
          description={searchQuery ? (locale === 'id' ? "Tidak ada buku sesuai pencarian Anda." : "No books match your criteria.") : (t("noBorrowedSubtitle") || "Daftar peminjaman kosong.")}
          action={!searchQuery ? { label: t("browseCatalog"), href: `/${locale}/catalog` } : undefined}
        />
      ) : (
        <BookListStack viewMode={viewMode} className="pb-12">
          {filteredItems.map((borrowing) => {
            const isOverdue = borrowing.due_date && new Date(borrowing.due_date) < new Date();
            const isActive = borrowing.status === 'borrowed';
            const isPending = ['pending', 'return_pending'].includes(borrowing.status);
            
            return (
              <BookListCard 
                key={borrowing.id}
                isCompact={viewMode === 'compact'}
                typeIcon={borrowing.group_id ? Layers : User}
                typeLabel={borrowing.group_id ? (locale === 'id' ? "Grup" : "Group") : (locale === 'id' ? "Mandiri" : "Single")}
                title={borrowing.book_copy?.book?.title}
                author={borrowing.book_copy?.book?.author?.name}
                coverUrl={borrowing.book_copy?.book?.cover_url}
                status={isOverdue && isActive ? 'overdue' : borrowing.status}
                metadata={[
                  { 
                    label: locale === 'id' ? "Tanggal Pinjam" : "Borrow Date",
                    value: new Date(borrowing.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
                    icon: Clock
                  },
                  { 
                    label: isPending ? (locale === 'id' ? "Diminta pada" : "Requested On") : (locale === 'id' ? "Jatuh Tempo" : "Due Date"),
                    value: new Date(isPending ? borrowing.created_at : borrowing.due_date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
                    icon: Calendar
                  }
                ]}
                action={isActive ? (
                  <Button 
                    size="sm" 
                    className="rounded-xl font-bold gap-2 h-9 px-5 shadow-lg active:scale-95 transition-all text-xs"
                    onClick={() => handleReturnRequest(borrowing.id)}
                  >
                    <RotateCcw size={14} strokeWidth={2.5} />
                    {t("requestReturn")}
                  </Button>
                ) : undefined}
              />
            );
          })}
        </BookListStack>
      )}
    </DashboardPage>
  );
}
