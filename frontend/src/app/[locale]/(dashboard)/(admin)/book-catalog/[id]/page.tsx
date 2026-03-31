"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import { 
  Book as BookIcon, 
  User, 
  Tag, 
  Calendar, 
  Hash, 
  ArrowLeft, 
  Edit,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { motion } from "framer-motion";

interface Book {
  id: number;
  title: string;
  isbn: string;
  description: string;
  published_year: number;
  author_name?: string;
  category_name?: string;
  cover_url?: string;
  available_copies_count: number;
  copies_count: number;
  stock_summary: string;
  author?: { name: string };
  category?: { name: string };
}

interface Copy {
  id: number;
  barcode: string;
  status: string;
  display_status: string;
  shelf_location?: string;
}

export default function BookDetailPage() {
  const t = useTranslations("Catalog");
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, copiesRes] = await Promise.all([
          apiService.books.get(params.id as string),
          apiService.books.getCopies(params.id as string)
        ]);
        setBook(bookRes);
        setCopies(copiesRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);
  
  const handleDeleteBook = async () => {
    setIsDeleting(true);
    try {
      await apiService.delete(`/books/${params.id}`);
      router.push(`/${params.locale}/book-catalog`);
    } catch (err) {
      console.error(err);
      alert(t("error_delete") || "Gagal menghapus buku. Silakan cek peminjaman aktif.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-[--color-muted-foreground]">{t("noBooks")}</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[--color-muted] rounded-lg transition-colors text-[--color-muted-foreground] hover:text-[--color-text]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[--color-text]">{book.title}</h1>
            <p className="text-sm text-[--color-muted-foreground] flex items-center gap-2 mt-1">
              <BookIcon size={14} /> {t("details")} & {t("manage_exemplars")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/${params.locale}/book-catalog/${book.id}/edit`)}
            className="gap-2 font-medium"
          >
            <Edit size={16} /> {t("edit_book")}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteModal(true)}
            className="gap-2 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 size={16} /> {t("delete_book")}
          </Button>
          <Button 
            onClick={() => router.push(`/${params.locale}/book-catalog/copies?bookId=${book.id}`)}
            className="gap-2 font-medium"
          >
            <Layers size={16} /> {t("manage_exemplars")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[--color-border] rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-[3/4] bg-[--color-muted] relative overflow-hidden group">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[--color-muted-foreground]/30 p-6 text-center">
                  <BookIcon size={64} strokeWidth={1} />
                  <span className="text-[10px] font-bold mt-4 tracking-widest">{t("no_cover")}</span>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">{t("author")}</label>
                    <p className="text-sm font-medium text-[--color-text] leading-tight mt-0.5">{book.author?.name || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                    <Tag size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">{t("category")}</label>
                    <p className="text-sm font-medium text-[--color-text] leading-tight mt-0.5">{book.category?.name || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                    <Hash size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">ISBN</label>
                    <p className="text-sm font-medium text-[--color-text] leading-tight mt-0.5 font-mono">{book.isbn}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">{t("published_year")}</label>
                    <p className="text-sm font-medium text-[--color-text] leading-tight mt-0.5">{book.published_year || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-[--color-border]/60">
                <label className="text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">{t("synopsis")}</label>
                <p className="text-sm text-[--color-text] leading-relaxed mt-2 line-clamp-6 italic">
                  {book.description || t("no_description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Copies & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[--color-border] shadow-sm">
              <p className="text-[10px] font-bold text-[--color-muted-foreground] tracking-widest mb-1">{t("total_stock")}</p>
              <p className="text-2xl font-bold text-[--color-text]">{book.copies_count}</p>
            </div>
            <div className="bg-[--color-primary]/5 p-4 rounded-xl border border-[--color-primary]/20 shadow-sm border-l-4">
              <p className="text-[10px] font-bold text-[--color-primary] tracking-widest mb-1">{t("available")}</p>
              <p className="text-2xl font-bold text-[--color-primary]">{book.available_copies_count}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm border-l-4 border-l-amber-500">
              <p className="text-[10px] font-bold text-amber-600 tracking-widest mb-1">{t("borrowed_count")}</p>
              <p className="text-2xl font-bold text-amber-700">{book.copies_count - book.available_copies_count}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-500 tracking-widest mb-1 text-center">{t("status")}</p>
              <div className="flex justify-center mt-1">
                {book.available_copies_count > 0 ? (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">{t("active")}</span>
                ) : (
                  <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-medium">{t("out_of_stock")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Exemplar Table */}
          <div className="bg-white border border-[--color-border] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[--color-border] flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Layers size={16} className="text-[--color-primary]" /> {t("exemplar_list")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[--color-muted]/30 border-b border-[--color-border]">
                    <th className="px-6 py-3 text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">{t("exemplar_id")}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">{t("shelf_location")}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[--color-muted-foreground] tracking-widest">{t("status")}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[--color-muted-foreground] tracking-widest text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--color-border]">
                  {copies.map((copy) => (
                    <tr key={copy.id} className="hover:bg-[--color-muted]/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-medium text-[--color-primary] bg-[--color-primary]/5 px-2 py-1 rounded border border-[--color-primary]/10">
                            {copy.barcode}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[--color-text]">{copy.shelf_location || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-bold  px-2 py-0.5 rounded w-fit ${
                            copy.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                            copy.status === 'borrowed' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {copy.display_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => router.push(`/${params.locale}/book-catalog/copies?bookId=${book.id}`)}
                          className="p-2 text-[--color-muted-foreground] hover:text-[--color-primary] hover:bg-[--color-primary]/5 rounded-lg transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {copies.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[--color-muted-foreground] italic text-sm">
                        {t("no_exemplars")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBook}
        title={t("delete_book")}
        description={t("delete_confirm_desc", { title: book.title })}
        confirmLabel={t("delete_confirm_btn") || "Ya, Hapus"}
        cancelLabel={t("cancel") || "Batal"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
