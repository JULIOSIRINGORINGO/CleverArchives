"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, BookOpen, Plus, Trash2, 
  AlertTriangle, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Database, Tag, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSearchParams } from "next/navigation";

const debounce = (fn: Function, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export default function CopyManagementPage() {
  const t = useTranslations("Copies");
  const searchParams = useSearchParams();
  const bookIdParam = searchParams.get("bookId");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [copies, setCopies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddingCopy, setIsAddingCopy] = useState(false);
  const [newCopyBarcode, setNewCopyBarcode] = useState("");
  
  const [deleteModal, setDeleteModal] = useState({ show: false, copyId: null as number | null, barcode: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const searchBooks = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await apiService.books.list({ q: term });
        setSearchResults(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    searchBooks(searchTerm);
  }, [searchTerm, searchBooks]);

  useEffect(() => {
    if (bookIdParam) {
      const loadBook = async () => {
        try {
          const book = await apiService.get(`/books/${bookIdParam}`);
          setSelectedBook(book);
          fetchCopies(Number(bookIdParam));
        } catch (err) {
          console.error("Gagal memuat buku dari param:", err);
        }
      };
      loadBook();
    }
  }, [bookIdParam]);

  const fetchCopies = async (bookId: number) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/books/${bookId}/copies`);
      setCopies(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book: any) => {
    setSelectedBook(book);
    setSearchTerm("");
    setSearchResults([]);
    fetchCopies(book.id);
  };

  const handleAddCopy = async () => {
    if (!selectedBook) return;
    setIsAddingCopy(true);
    try {
      await apiService.post(`/books/${selectedBook.id}/copies`, { 
        book_copy: { barcode: newCopyBarcode || `BC-${Date.now()}` } 
      });
      setNewCopyBarcode("");
      fetchCopies(selectedBook.id);
    } catch (err: any) {
      setError(err.message || t("error_add"));
    } finally {
      setIsAddingCopy(false);
    }
  };

  const handleUpdateStatus = async (copyId: number, status: string) => {
    try {
      await apiService.patch(`/book_copies/${copyId}`, { book_copy: { status } });
      fetchCopies(selectedBook.id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteCopy = async () => {
    if (!deleteModal.copyId || !selectedBook) return;
    setIsDeleting(true);
    try {
      await apiService.delete(`/book_copies/${deleteModal.copyId}`);
      fetchCopies(selectedBook.id);
      setDeleteModal({ show: false, copyId: null, barcode: "" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("error_delete"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-3 bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all text-muted-foreground hover:text-primary group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Database className="text-primary" size={32} />
              {t("title")}
            </h1>
          </div>
        </div>

        {/* Top Search Bar (Visible when book is selected or as main search) */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder={t("search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm shadow-sm"
          />
          {searchLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={18} />}
          
          <AnimatePresence>
            {searchTerm && searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-border/50 rounded-[2rem] shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
              >
                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {searchResults.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleSelectBook(book)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 transition-all text-left group border border-transparent hover:border-primary/10"
                    >
                      <div className="w-10 h-14 rounded-xl bg-muted shrink-0 overflow-hidden shadow-sm border border-border/30">
                        {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate group-hover:text-primary transition-colors">{book.title}</div>
                        <div className="text-[10px] text-muted-foreground font-medium tracking-tight">ISBN: {book.isbn || 'N/A'}</div>
                      </div>
                      <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedBook ? (
          <motion.div
            key={selectedBook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Book Info Header Card */}
            <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/5 border border-white/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
              
              <div className="relative flex flex-col md:flex-row gap-8 md:items-center">
                <div className="w-40 h-56 bg-muted rounded-[2rem] shrink-0 overflow-hidden shadow-2xl border-4 border-white/50 dark:border-slate-800/50 group hover:scale-105 transition-transform duration-700">
                  {selectedBook.cover_url ? (
                    <img src={selectedBook.cover_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><BookOpen size={64} /></div>
                  )}
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold tracking-widest rounded-full">
                      {selectedBook.category?.name || "Uncategorized"}
                    </span>
                    <h2 className="text-4xl font-bold mt-4 leading-tight tracking-tight text-slate-900 dark:text-white">{selectedBook.title}</h2>
                    <p className="text-xl font-medium text-muted-foreground/80 mt-1 italic">By {selectedBook.author?.name || "Unknown Author"}</p>
                    <div className="text-[10px] font-medium text-muted-foreground/40 mt-2 tracking-tight flex items-center gap-2">
                       <Database size={12} /> ISBN: {selectedBook.isbn || 'N/A'}
                    </div>
                  </div>
                  
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                     <div className="p-5 bg-white/50 dark:bg-slate-800/50 rounded-[1.5rem] border border-white/20 shadow-sm grow">
                       <div className="text-[10px] font-bold text-muted-foreground tracking-widest mb-1">{t("total_unit")}</div>
                       <div className="text-2xl font-bold">{selectedBook.copies_count}</div>
                     </div>
                     <div className="p-5 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-sm grow">
                       <div className="text-[10px] font-bold text-emerald-600/60 tracking-widest mb-1">{t("status_available")}</div>
                       <div className="text-2xl font-bold text-emerald-600">{selectedBook.available_copies_count}</div>
                     </div>
                     <div className="p-5 bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20 shadow-sm grow">
                        <div className="text-[10px] font-bold text-blue-600/60 tracking-widest mb-1">Dipinjam</div>
                        <div className="text-2xl font-bold text-blue-600">{selectedBook.copies_count - selectedBook.available_copies_count}</div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Action: Add Copy */}
              <div className="lg:col-span-1">
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 border border-white/20 sticky top-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("add_unit")}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">{t("add_unit_desc")}</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-widest text-muted-foreground ml-1">{t("barcode_label")}</label>
                      <input 
                        type="text" 
                        placeholder={t("barcode_placeholder")}
                        value={newCopyBarcode}
                        onChange={(e) => setNewCopyBarcode(e.target.value)}
                        className="w-full bg-muted/30 border border-border/50 rounded-[1.2rem] px-5 py-3.5 font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                      />
                    </div>
                    <Button 
                      onClick={handleAddCopy} 
                      disabled={isAddingCopy || !newCopyBarcode} 
                      className="w-full rounded-[1.2rem] font-bold h-14 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isAddingCopy ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} className="mr-2" />}
                      {t("save_unit")}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* List Area */}
              <div className="lg:col-span-3">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-black/5 border border-white/20 overflow-hidden">
                  <div className="p-10 pb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600"><Tag size={24} /></div>
                      {t("list_title")}
                    </h3>
                  </div>

                  <div className="p-10 pt-4">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border/30">
                              <th className="pb-6 text-[10px] font-bold tracking-widest text-muted-foreground px-4">{t("table_barcode")}</th>
                              <th className="pb-6 text-[10px] font-bold tracking-widest text-muted-foreground text-center">{t("table_status")}</th>
                              <th className="pb-6 text-[10px] font-bold tracking-widest text-muted-foreground text-right px-4">{t("table_management")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10">
                            {loading ? (
                              [1, 2, 3, 4].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="py-8 px-4"><div className="h-12 bg-muted rounded-2xl w-full" /></td></tr>)
                            ) : copies.length === 0 ? (
                              <tr><td colSpan={3} className="py-20 text-center text-muted-foreground italic font-medium">{t("no_units")}</td></tr>
                            ) : (
                              copies.map((copy) => (
                                <tr key={copy.id} className="hover:bg-primary/[0.02] transition-colors group">
                                  <td className="py-7 px-4">
                                     <div className="flex items-center gap-3">
                                       <div className="p-2 bg-muted rounded-lg text-muted-foreground/50">
                                         <Database size={16} />
                                       </div>
                                       <code className="px-3 py-1.5 bg-muted/50 rounded-[0.8rem] text-sm font-medium text-foreground border border-border/20 tracking-tight">
                                         {copy.barcode}
                                       </code>
                                     </div>
                                  </td>
                                  <td className="py-7 text-center">
                                    <span className={`px-4 py-2 text-[10px] font-bold tracking-widest rounded-xl border-2 ${
                                      copy.status === 'available' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                      copy.status === 'borrowed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                      'bg-red-500/10 text-red-600 border-red-500/20'
                                    }`}>
                                      {t(`status_${copy.status}`)}
                                    </span>
                                  </td>
                                  <td className="py-7 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button 
                                        onClick={() => handleUpdateStatus(copy.id, 'available')}
                                        title={t("status_available")}
                                        className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-90 ${copy.status === 'available' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-foreground bg-muted/40 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                      >
                                        <CheckCircle2 size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateStatus(copy.id, 'damaged')}
                                        title={t("status_damaged")}
                                        className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-90 ${copy.status === 'damaged' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-muted-foreground bg-muted/40 hover:bg-amber-100 hover:text-amber-600'}`}
                                      >
                                        <AlertTriangle size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateStatus(copy.id, 'lost')}
                                        title={t("status_lost")}
                                        className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-90 ${copy.status === 'lost' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-muted-foreground bg-muted/40 hover:bg-red-100 hover:text-red-600'}`}
                                      >
                                        <XCircle size={18} />
                                      </button>
                                      <div className="w-[1px] h-6 bg-border/40 mx-2" />
                                      <button 
                                        onClick={() => setDeleteModal({ show: true, copyId: copy.id, barcode: copy.barcode })}
                                        title={t("delete_title")}
                                        className="p-3 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all hover:scale-110 active:scale-90 shadow-sm"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-dashed border-border/50 p-32 rounded-[4rem] text-center flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-1000 backdrop-blur-md">
            <div className="w-32 h-32 rounded-[3.5rem] bg-primary/10 flex items-center justify-center text-primary animate-bounce-slow">
              <Database size={64} />
            </div>
            <div className="space-y-2">
               <h3 className="text-3xl font-bold text-foreground tracking-tight">{t("waiting_selection")}</h3>
               <p className="text-muted-foreground/80 text-lg font-medium max-w-lg mx-auto leading-relaxed">{t("waiting_selection_desc")}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 px-6 py-3 bg-muted/50 rounded-2xl text-[10px] font-bold tracking-widest text-muted-foreground/60">
               <Search size={14} /> {t("search_hint")}
            </div>
          </div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, copyId: null, barcode: "" })}
        onConfirm={handleDeleteCopy}
        title={t("delete_title")}
        description={t("delete_confirm", { barcode: deleteModal.barcode })}
        confirmLabel={t("delete_btn") || "Hapus"}
        cancelLabel={t("cancel") || "Batal"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
