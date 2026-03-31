"use client";

import { useCheckout } from "@/contexts/CheckoutContext";
import { CheckCircle2, AlertCircle, Trash2, Send, Loader2, ShoppingBag, Package, Info, ArrowRight, CornerUpRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Card, CardContent } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CheckoutPage() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const router = useRouter();
  const { items: checkoutItems, removeFromCheckout, clearCheckout } = useCheckout();
  
  const [pendingBorrowings, setPendingBorrowings] = useState<any[]>([]);
  const [submittingBarcode, setSubmittingBarcode] = useState<string | null>(null);
  const [submittingAll, setSubmittingAll] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Fetch pending borrowings from API (source of truth)
  const fetchPendingBorrowings = async () => {
    try {
      const response = await apiService.borrowings.list({ items: '100' });
      const list = Array.isArray(response) ? response : (response.data || []);
      const filtered = list.filter((b: any) => ['pending', 'cancellation_requested'].includes(b.status));
      setPendingBorrowings(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingBorrowings();
  }, []);

  // Submit single item
  const handleSubmitItem = async (barcode: string) => {
    // Client-side duplicate check against pending list
    const alreadyPending = pendingBorrowings.some(
      (b: any) => b.book_copy?.barcode === barcode
    );
    if (alreadyPending) {
      showError(t("error_already_pending", { barcode }));
      return;
    }

    setSubmittingBarcode(barcode);
    setErrorMessage(null);
    try {
      await apiService.borrowings.create({ borrowing: { barcode } });
      removeFromCheckout(barcode);
      await fetchPendingBorrowings();
      showSuccess(t("success_submitted", { barcode }));
    } catch (err: any) {
      showError(err.message || t("error_failed_item", { barcode }));
    } finally {
      setSubmittingBarcode(null);
    }
  };

  // Submit all items as a batch (1 request, shared group_id)
  const handleSubmitAll = async () => {
    if (checkoutItems.length === 0) return;
    setSubmittingAll(true);
    setErrorMessage(null);

    try {
      const barcodes = checkoutItems.map(item => item.barcode);
      const result = await apiService.borrowings.batchCreate({ barcodes });

      // Clear all successfully submitted items
      clearCheckout();
      await fetchPendingBorrowings();

      const successCount = result.data?.length || 0;
      const failCount = result.errors?.length || 0;

      if (failCount === 0) {
        showSuccess(t("success_batch", { count: successCount }));
      } else if (successCount > 0) {
        showError(`${successCount} berhasil, ${failCount} gagal: ${result.errors.map((e: any) => e.barcode).join(", ")}`);
      } else {
        showError(t("error_failed"));
      }
    } catch (err: any) {
      showError(err.message || t("error_failed"));
    } finally {
      setSubmittingAll(false);
    }
  };

  // Cancel pending borrowing
  const handleCancelPending = async (bItem: any) => {
    setCancellingId(bItem.id);
    setErrorMessage(null);
    try {
      const payload = {
        member_id: bItem.member_id,
        barcode: bItem.book_copy?.barcode,
        title: bItem.book_copy?.book?.title
      };
      await apiService.borrowings.cancel(bItem.id.toString(), payload);
      await fetchPendingBorrowings();
      showSuccess(t("success_cancellation_requested"));
    } catch (err: any) {
      showError(err.message || t("move_error"));
    } finally {
      setCancellingId(null);
    }
  };

  const isAnyLoading = submittingAll || !!submittingBarcode || !!cancellingId;

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-700 overflow-hidden">
      <PageHeader
        title={t("checkout_summary")}
        subtitle={t("cart_title")}
        badge={t("submission")}
        icon={<Package size={24} strokeWidth={2.5} />}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-1">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="flex-1 space-y-10">
            {/* Alerts */}
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-5 rounded-[2rem] font-bold text-xs flex items-center gap-3 shadow-xl shadow-emerald-500/5"
                >
                  <CheckCircle2 size={18} /> {successMessage}
                </motion.div>
              )}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-rose-50 text-rose-600 border border-rose-100 p-5 rounded-[2rem] font-bold text-xs flex items-center gap-3 shadow-xl shadow-rose-500/5"
                >
                  <AlertCircle size={18} /> {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-10">
              {/* Checkout List */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <div className="w-1 h-4 bg-primary rounded-full" />
                   <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground">{t("ready_to_checkout")}</h3>
                </div>

                {checkoutItems.length === 0 ? (
                  <div className="py-24 text-center bg-muted/[0.03] rounded-[3rem] border-2 border-dashed border-border/40 flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-muted/20 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                      <ShoppingBag size={40} className="text-muted-foreground/10" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-sm text-muted-foreground font-bold tracking-widest opacity-30">{t("checkout_empty")}</p>
                       <p className="text-[10px] text-muted-foreground/20 font-medium tracking-tight italic">{t("add_from_cart")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                      {checkoutItems.map((item, idx) => (
                        <motion.div
                          key={item.barcode}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="rounded-[2rem] border border-border/30 bg-card/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden">
                            <CardContent className="p-4 sm:p-6 flex items-center gap-6">
                              <div className="w-16 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-muted border border-border/20 group-hover:scale-110 transition-transform duration-500">
                                {item.cover_url ? (
                                  <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/10"><BookOpen size={24}/></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <h4 className="font-bold text-base truncate tracking-tight text-foreground">{item.title}</h4>
                                <p className="text-[10px] text-muted-foreground/50 font-medium tracking-tight truncate italic">{item.author}</p>
                                <div className="mt-2">
                                  <span className="text-[9px] font-bold tracking-widest bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10">
                                    ID: {item.barcode}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <Button
                                  onClick={() => handleSubmitItem(item.barcode)}
                                  disabled={isAnyLoading}
                                  className="rounded-2xl h-12 px-6 font-bold text-[10px] tracking-widest gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                  {submittingBarcode === item.barcode ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                  {t("submit_btn_simple")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => removeFromCheckout(item.barcode)}
                                  disabled={isAnyLoading}
                                  className="rounded-2xl h-12 w-12 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all border-none"
                                >
                                  <Trash2 size={20} />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Pending List */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <div className="w-1 h-4 bg-amber-400 rounded-full" />
                   <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground">{t("pending_list_title", { count: pendingBorrowings.length })}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingBorrowings.length === 0 && (
                    <div className="md:col-span-2 py-12 text-center text-muted-foreground/30 text-[10px] font-bold tracking-widest border border-dashed rounded-[2.5rem] border-border/60 italic">
                      {t("no_pending")}
                    </div>
                  )}
                  {pendingBorrowings.map((b, idx) => (
                    <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + idx * 0.05 }}>
                      <Card className="rounded-[2rem] border border-border/30 bg-muted/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-4 sm:p-5 flex items-center gap-5">
                          <div className="w-12 aspect-[3/4] rounded-xl overflow-hidden shadow-lg shrink-0 bg-white">
                            {b.book_copy?.book?.cover_url ? (
                              <img src={b.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-bold text-xs truncate tracking-tight text-foreground/80">{b.book_copy?.book?.title || "Buku"}</h4>
                            <p className="text-[8px] font-medium text-muted-foreground/30 tracking-tight italic truncate leading-none">ID: {b.book_copy?.barcode || "N/A"}</p>
                            <div className={cn(
                              "mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-bold tracking-widest shadow-sm",
                              b.status === 'cancellation_requested' 
                                ? "bg-rose-50 text-rose-600 border-rose-100" 
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                              <div className={cn("w-1 h-1 rounded-full", b.status === 'cancellation_requested' ? "bg-rose-500" : "bg-amber-500 animate-pulse")} />
                              {b.status === 'cancellation_requested' ? t("cancelling_label") : t("pending_label")}
                            </div>
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            disabled={b.status === 'cancellation_requested' || cancellingId === b.id || isAnyLoading}
                            onClick={() => handleCancelPending(b)}
                            className={cn(
                              "rounded-xl h-10 px-4 font-bold text-[9px] tracking-widest transition-all",
                              b.status === 'cancellation_requested' 
                                ? "text-rose-200 border-rose-50 opacity-50" 
                                : "text-rose-600 border-rose-200 hover:bg-rose-50 shadow-sm"
                            )}
                          >
                            {cancellingId === b.id ? <Loader2 size={12} className="animate-spin" /> : 
                              (b.status === 'cancellation_requested' ? t("waiting_label") : t("cancel_btn"))}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-80 flex-shrink-0 sticky top-0">
             <Card className="bg-primary/5 rounded-[2.5rem] border border-primary/20 p-8 shadow-2xl shadow-primary/5 space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <Package size={20} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-xl font-bold tracking-tight text-primary">{t("summary_title")}</h3>
                </div>

                <div className="space-y-4">
                   <div className="flex flex-col gap-1 p-5 bg-white dark:bg-background border border-border/40 rounded-3xl shadow-sm group hover:shadow-md transition-all">
                      <span className="text-[10px] font-bold text-muted-foreground/40 tracking-widest">{t("in_checkout_label")}</span>
                      <span className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{checkoutItems.length}</span>
                   </div>
                   <div className="flex flex-col gap-1 p-5 bg-white dark:bg-background border border-border/40 rounded-3xl shadow-sm group hover:shadow-md transition-all">
                      <span className="text-[10px] font-bold text-muted-foreground/40 tracking-widest">{t("pending_count_label")}</span>
                      <span className="text-3xl font-bold text-foreground group-hover:text-amber-500 transition-colors">{pendingBorrowings.length}</span>
                   </div>
                </div>

                <Button 
                  disabled={checkoutItems.length === 0 || isAnyLoading}
                  onClick={handleSubmitAll}
                  className="w-full rounded-3xl h-16 text-[11px] font-bold tracking-widest shadow-2xl shadow-primary/20 gap-3 border-none bg-primary text-white hover:scale-[1.05] active:scale-[0.95] transition-all"
                >
                  {submittingAll ? (
                    <><Loader2 size={20} className="animate-spin" /> {t("processing_batch")}</>
                  ) : (
                    <><Send size={20} /> {t("process_batch_btn")}</>
                  )}
                </Button>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                   <Info size={16} className="text-amber-600 shrink-0" />
                   <p className="text-[9px] text-amber-900/40 font-bold tracking-widest italic leading-relaxed">
                      {t("verification_note")}
                   </p>
                </div>
             </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
