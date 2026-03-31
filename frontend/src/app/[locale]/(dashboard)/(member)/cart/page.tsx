"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useRouter, useParams } from "next/navigation";
import { 
  ShoppingCart, Search, ArrowRight, XCircle, 
  Loader2, ShoppingBag, Package, AlertCircle, 
  CheckCircle2, Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { apiService } from "@/services/api";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CartPage() {
  const t = useTranslations("Cart");
  const { item, addItem, clearCart } = useCart();
  const { addToCheckout, totalItems: checkoutCount, hasDuplicate } = useCheckout();
  const { locale } = useParams();
  const router = useRouter();
  
  const [barcode, setBarcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [movingToCheckout, setMovingToCheckout] = useState(false);

  const handleSearch = async () => {
    if (!barcode.trim()) return;
    
    setSearching(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await apiService.books.getByBarcode(barcode);
      
      if (data && data.book && data.book_copy) {
        if (data.book_copy.status !== 'available') {
          setError(t("not_available"));
          return;
        }

        if (item && item.barcode === data.book_copy.barcode) {
          setError(t("already_cart"));
          return;
        }

        if (hasDuplicate(data.book_copy.barcode)) {
          setError(t("already_checkout"));
          return;
        }

        try {
          const borrowRes = await apiService.borrowings.list({ items: '100' });
          const borrowList = Array.isArray(borrowRes) ? borrowRes : (borrowRes.data || []);
          const activeStatuses = ['pending', 'borrowed', 'return_pending', 'cancellation_requested'];
          const alreadyActive = borrowList.some(
            (b: any) => b.book_copy?.barcode === data.book_copy.barcode && activeStatuses.includes(b.status)
          );
          if (alreadyActive) {
            setError(t("already_active"));
            return;
          }
        } catch (e) {
          // Silent catch
        }

        const added = addItem({
          id: data.book.id,
          title: data.book.title,
          author: data.book.author?.name || "Unknown Author",
          cover_url: data.book.cover_url || data.book.cover_image_url,
          copy_id: data.book_copy.id,
          barcode: data.book_copy.barcode
        });

        if (added) {
          setBarcode("");
          setError(null);
        }
      } else {
        setError(t("not_found"));
      }
    } catch (err: any) {
      console.error(err);
      setError(t("not_found"));
    } finally {
      setSearching(false);
    }
  };

  const handleMoveToCheckout = () => {
    if (!item) return;
    setError(null);
    setMovingToCheckout(true);

    const result = addToCheckout({
      id: item.id,
      title: item.title,
      author: item.author,
      cover_url: item.cover_url,
      copy_id: item.copy_id,
      barcode: item.barcode
    });

    if (result.success) {
      clearCart();
      setSuccessMsg(t("move_success", { title: item.title, barcode: item.barcode }));
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(result.error || t("move_error"));
    }
    setMovingToCheckout(false);
  };

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-500 overflow-hidden">
      <PageHeader
        title={t("title")}
        badge={t("preparation")}
        icon={<ShoppingCart size={24} strokeWidth={2.5} />}
      >
        {checkoutCount > 0 && (
          <button
            onClick={() => router.push(`/${locale}/checkout`)}
            className="bg-primary/[0.03] border border-primary/20 hover:border-primary/40 rounded-2xl p-3 flex items-center gap-4 transition-all group shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
                <Package size={16} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-primary tracking-widest leading-none mb-1">{t("ready")}</p>
                <p className="text-[10px] font-medium tracking-tight text-muted-foreground/60">{t("books_in_checkout", { count: checkoutCount })}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:translate-x-1 transition-all">
               <ArrowRight size={16} strokeWidth={2.5} />
            </div>
          </button>
        )}
      </PageHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Messages */}
          <div className="space-y-3">
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-2xl font-bold text-xs text-center shadow-sm flex items-center justify-center gap-3 animate-in slide-in-from-top-2">
                <CheckCircle2 size={18} /> {successMsg}
              </div>
            )}

            {error && (
              <div className="bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-2xl font-bold text-xs text-center shadow-sm flex items-center justify-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Col: Input Forms */}
            <div className="space-y-6">
              <Card className="rounded-[2rem] border border-border/40 shadow-sm bg-card overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-8 space-y-4">
                  <Label htmlFor="barcode" className="text-[10px] font-bold tracking-widest text-muted-foreground ml-1">
                    {t("start_with_id")}
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <Input 
                        id="barcode"
                        placeholder={t("barcode_placeholder")}
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="rounded-2xl h-14 pl-12 pr-4 border-border/40 focus:ring-primary/5 focus:bg-muted/5 text-sm transition-all"
                        disabled={searching || !!item}
                      />
                    </div>
                    <Button 
                      onClick={handleSearch} 
                      disabled={searching || !barcode.trim() || !!item}
                      className="rounded-2xl h-14 px-8 font-bold gap-2 shadow-xl shadow-primary/20 bg-primary text-white border-none tracking-widest text-xs"
                    >
                      {searching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                      {t("search_btn")}
                    </Button>
                  </div>
                  {item && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3 animate-in zoom-in-95">
                      <Info size={16} className="text-amber-600 shrink-0" />
                      <p className="text-[10px] text-amber-700 font-bold tracking-widest leading-tight">
                        {t("cart_full")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Rules List */}
              <div className="bg-muted/[0.03] rounded-[2rem] p-8 border border-dashed border-border/40 space-y-4">
                <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center">
                    <AlertCircle size={16} className="text-primary" />
                  </div>
                  {t("rules_title")}
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        {t(`rule_${idx}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Current Item Preview */}
            <div className="space-y-6">
              {item ? (
                <Card className="rounded-[2.5rem] border border-primary/20 shadow-[0_20px_50px_rgba(var(--primary),0.1)] bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row gap-8">
                      <div className="w-full sm:w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-muted border border-border/20 transform group-hover:scale-105 transition-all duration-500">
                        {item.cover_url ? (
                          <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/10 bg-muted/50">
                            <ShoppingBag size={48} strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center space-y-4">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 mb-4 animate-pulse">
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-bold tracking-widest">{t("found_success")}</span>
                          </div>
                          <h3 className="text-2xl font-bold tracking-tight leading-tight line-clamp-2 text-foreground">{item.title}</h3>
                          <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-2 opacity-60">{item.author}</p>
                        </div>
                        <div className="p-4 bg-muted/20 rounded-2xl border border-border/30 w-full flex flex-col gap-1 shadow-inner">
                          <p className="text-[10px] font-bold tracking-widest text-muted-foreground/40">{t("copy_id_label")}</p>
                          <p className="text-base font-bold font-mono tracking-tight text-primary">{item.barcode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                      <Button 
                        variant="ghost" 
                        className="rounded-2xl h-14 text-[11px] font-bold tracking-widest gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border-none"
                        onClick={() => { clearCart(); setError(null); }}
                      >
                        <XCircle size={18} /> {t("cancel_remove")}
                      </Button>
                      <Button 
                        className="rounded-[1.5rem] h-14 text-[11px] font-bold tracking-widest gap-2 shadow-xl shadow-primary/20 bg-primary text-white border-none transition-all hover:scale-105 active:scale-95"
                        onClick={handleMoveToCheckout}
                        disabled={movingToCheckout}
                      >
                        {movingToCheckout ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} strokeWidth={2.5} />}
                        {t("move_to_checkout")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="py-24 text-center text-muted-foreground/10 border-2 border-dashed border-border/40 rounded-[2.5rem] bg-muted/[0.02] flex flex-col items-center justify-center animate-in slide-in-from-right-4">
                  <div className="w-20 h-20 rounded-full bg-muted/10 flex items-center justify-center mb-6">
                    <ShoppingBag size={32} strokeWidth={1} className="text-muted-foreground/20" />
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground/30">{t("no_items")}</p>
                  <p className="text-[10px] mt-2 font-medium tracking-tight text-muted-foreground/20">{t("search_first")}</p>
                </div>
              )}
            </div>
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
