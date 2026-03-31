"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  BookMarked, Search, Filter, BookOpen, 
  Plus, Edit2, Trash2, MoreVertical, ChevronRight,
  Database
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useApi } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export default function AdminBookListPage() {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; bookId: number | null; bookTitle: string }>({
    show: false, bookId: null, bookTitle: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: categoriesData } = useApi("/categories");
  const categories = categoriesData || [];

  const { data: booksData, isLoading: loading, mutate: refresh } = useApi(
    `/books?q=${encodeURIComponent(search)}&category_id=${categoryFilter === "all" ? "" : categoryFilter}&page=${page}`
  );

  const books = Array.isArray(booksData?.data) ? booksData.data : [];
  const totalBooks = booksData?.total || 0;
  const totalPages = Math.ceil(totalBooks / 20);

  const handleDeleteConfirm = async () => {
    if (!deleteModal.bookId) return;
    setIsDeleting(true);
    try {
      await apiService.delete(`/books/${deleteModal.bookId}`);
      setDeleteModal({ show: false, bookId: null, bookTitle: "" });
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BookMarked className="text-primary" size={22} />
            {t("title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1.5 px-3 py-0 bg-muted/50 rounded-lg border border-border/50 text-xs font-medium tracking-tight text-muted-foreground h-9">
            <Database size={12} /> Total: {totalBooks}
          </div>
          <Link 
            href={`/${locale}/book-catalog/new`}
            className="flex items-center justify-center gap-1.5 h-9 px-4 bg-primary text-white text-sm rounded-lg font-medium shadow-sm transition-all hover:bg-primary/90"
          >
            <Plus size={16} /> {t("add_button")}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground hidden md:block" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium min-w-[140px]"
          >
            <option value="all">{t("all_categories")}</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-xs font-bold text-muted-foreground/70">{t("table_cover")}</th>
                <th className="px-4 py-3 text-xs font-bold text-muted-foreground/70">{t("table_title")}</th>
                <th className="px-4 py-3 text-xs font-bold text-muted-foreground/70 hidden sm:table-cell">{t("table_author")}</th>
                <th className="px-4 py-3 text-xs font-bold text-muted-foreground/70 hidden md:table-cell">{t("table_category")}</th>
                <th className="px-4 py-3 text-xs font-bold text-muted-foreground/70">{t("table_stock")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="w-10 h-14 rounded-md" /></td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40 rounded-md" />
                        <Skeleton className="h-3 w-24 rounded-sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-32 rounded-md" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12 rounded-md" /></td>
                  </tr>
                ))
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-xs font-medium">{t("no_books")}</td>
                </tr>
              ) : (
                books.map((book: any) => (
                  <tr 
                    key={book.id} 
                    onClick={() => router.push(`/${locale}/book-catalog/${book.id}`)}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="w-10 h-14 rounded-md bg-muted overflow-hidden border border-border/50 shrink-0">
                         {book.cover_url ? (
                           <img src={book.cover_url} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><BookOpen size={16} /></div>
                         )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{book.title}</div>
                      <div className="text-[10px] text-muted-foreground font-medium tracking-tight mt-0.5">ISBN: {book.isbn || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">{book.author?.name || "Unknown"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg border border-primary/10">
                        {book.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-xs text-foreground">{book.available_copies_count ?? 0} / {book.copies_count ?? 0}</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${book.available_copies_count > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${(book.available_copies_count / (book.copies_count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button 
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-lg text-xs"
          >
            {t("prev")}
          </Button>
          <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-medium text-xs">
            {t("page_info", { current: page, total: totalPages })}
          </div>
          <Button 
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-lg text-xs"
          >
            {t("next")}
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, bookId: null, bookTitle: "" })}
        onConfirm={handleDeleteConfirm}
        title={t("delete_title")}
        description={t("delete_confirm", { title: deleteModal.bookTitle })}
        confirmLabel={t("delete_confirm_btn") || "Hapus"}
        cancelLabel={t("cancel") || "Batal"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
