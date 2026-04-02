"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { 
  Search, BookOpen, Trash2, AlertCircle, 
  CheckCircle2, Sparkles, ArrowRight, ShoppingBag
} from "lucide-react";

// Standard UI Components
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UnifiedSearch } from "@/components/ui/UnifiedSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookListCard } from "@/components/books/BookListCard";
import { WorkspacePanel, WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";
import { Text } from "@/components/ui/Text";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const router = useRouter();
  const { item, addItem, clearCart } = useCart();
  const { addToCheckout, hasDuplicate } = useCheckout();

  // States
  const [barcode, setBarcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [movingToCheckout, setMovingToCheckout] = useState(false);
  const { toast } = useToast();

  const handleSelectItem = (copy: any) => {
    if (copy.status !== 'available') { toast(t("not_available"), "error"); return; }
    if (item && item.barcode === copy.barcode) { toast(t("already_cart"), "error"); return; }
    if (hasDuplicate(copy.barcode)) { toast(t("already_checkout"), "error"); return; }

    addItem({
      id: copy.book.id,
      title: copy.book.title,
      author: copy.book.author?.name || "Unknown Author",
      cover_url: copy.book.cover_url,
      copy_id: copy.id,
      barcode: copy.barcode
    });
    toast(t("add_success", { title: copy.book.title }), "success");
    setBarcode("");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcode.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const data = await apiService.books.getByBarcode(barcode);
      if (data && data.book) {
        const copies = await apiService.books.getCopies(data.book.id);
        const copiesList = Array.isArray(copies) ? copies : (copies.data || []);
        const enhancedCopies = copiesList.map((c: any) => ({ ...c, book: data.book }));
        setSearchResults(enhancedCopies);

        // Auto-add feature:
        const currentBarcode = barcode.trim();
        const exactMatch = enhancedCopies.find((c: any) => c.barcode === currentBarcode && c.status === 'available');
        if (exactMatch) {
           handleSelectItem(exactMatch);
        } else {
           const firstAvailable = enhancedCopies.find((c: any) => c.status === 'available');
           if (firstAvailable) handleSelectItem(firstAvailable);
        }
      } else {
        toast(t("error_not_found"), "error");
      }
    } catch (err: any) {
      toast(t("error_not_found"), "error");
    } finally {
      setSearching(false);
    }
  };

  const handleMoveToCheckout = () => {
    if (!item) return;
    setMovingToCheckout(true);
    const result = addToCheckout(item);
    if (result.success) {
      clearCart();
      router.push(`/${locale}/checkout`);
    } else {
      toast(result.error || t("move_error"), "error");
    }
    setMovingToCheckout(false);
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col lg:flex-row gap-6 p-6">
      
      {/* PANEL 1: Pencarian Eksemplar */}
      <div className="flex-1 min-w-0 h-full flex flex-col">
        <WorkspacePanel className="h-full flex flex-col">
          <WorkspacePanelHeader className="px-8 py-6" showDivider={false}>
            <div className="flex flex-col gap-5 w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <Search size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Mulai dengan Kode Buku</h3>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <UnifiedSearch 
                  value={barcode}
                  onChange={setBarcode}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t("barcode_placeholder") || "Contoh: BC-26-1"}
                  isLoading={searching}
                  className="flex-1 text-sm h-12"
                  autoFocus
                />
                <Button type="submit" disabled={searching} className="h-12 px-6 rounded-2xl bg-primary text-white font-bold text-xs hover:scale-[1.02]">
                  Cari
                </Button>
              </form>
            </div>
          </WorkspacePanelHeader>

          <WorkspacePanelContent className="px-8 flex-1 overflow-y-auto custom-scrollbar pt-4">
             <AnimatePresence mode="wait">
                {searchResults.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {searchResults.map((copy) => (
                      <BookListCard 
                        key={copy.id}
                        isCompact
                        title={copy.barcode}
                        author={copy.book?.title}
                        status={copy.status}
                        metadata={[]}
                        action={
                          <Button 
                            size="sm" 
                            onClick={() => handleSelectItem(copy)}
                            className="rounded-2xl font-bold gap-3 h-10 px-6 active:scale-95 transition-all text-[10px] uppercase tracking-widest bg-white text-primary border-2 border-primary/10 hover:bg-primary hover:text-white hover:border-primary group"
                          >
                            {t("select")} 
                            <ArrowRight size={14} strokeWidth={3} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </Button>
                        }
                      />
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState 
                    icon={BookOpen} 
                    title={"Masukkan Kode Buku"}
                    description={"Silakan masukkan barcode pada inputan di atas."}
                    className="py-12 border-none bg-transparent"
                  />
                )}
             </AnimatePresence>
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>

      {/* PANEL 2: Konfirmasi Pinjam */}
      <div className="flex-[1.2] min-w-0 h-full flex flex-col">
        <WorkspacePanel className="h-full flex flex-col">
          <WorkspacePanelHeader className="px-8 py-6" showDivider>
            <PanelSectionHeader
              icon={<BookOpen size={16} />}
              iconVariant="primary"
              title={t("borrow_confirmation", { fallback: "Konfirmasi Peminjaman" })}
            />
          </WorkspacePanelHeader>

          <WorkspacePanelContent className="px-8 py-0 flex-1 flex flex-col justify-center overflow-hidden">
             {item ? (
                 <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                   <div className="flex flex-col lg:flex-row gap-10 items-center justify-center w-full max-w-2xl mx-auto">
                     <div className="w-48 xl:w-56 aspect-[3/4] border-8 border-white rounded-[2.5rem] overflow-hidden shadow-2xl bg-muted shrink-0 relative group">
                       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                       {item.cover_url ? <img src={item.cover_url} alt="" className="w-full h-full object-cover relative z-0" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/10 relative z-0"><BookOpen size={64} /></div>}
                     </div>
                     <div className="flex-1 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
                        <div className="space-y-4 flex flex-col items-center lg:items-start">
                           <StatusBadge status="available" label={t("ready_to_checkout", { fallback: "Ready to Checkout" })} className="text-xs font-bold" />
                           <Text variant="heading" className="text-3xl xl:text-4xl leading-tight">{item.title}</Text>
                           <Text variant="caption" className="text-base">{item.author}</Text>
                        </div>
                        <div className="px-6 py-4 w-full bg-muted/20 border border-border/40 rounded-2xl inline-flex flex-col items-center lg:items-start justify-center gap-1.5 backdrop-blur-sm">
                          <Text variant="label">{t("copy_id_label", { fallback: "Copy ID" })}</Text>
                          <Text variant="heading" className="text-primary font-mono text-xl tracking-widest">{item.barcode}</Text>
                        </div>
                     </div>
                   </div>
                </motion.div>
             ) : (
               <EmptyState icon={ShoppingBag} title="Keranjang Kosong" description="Pilih eksemplar di sisi kiri untuk memulainya." className="py-2 border-none bg-transparent shadow-none" />
             )}
          </WorkspacePanelContent>

          <WorkspacePanelFooter className="px-10 py-6" showDivider>
             {item ? (
                <div className="flex gap-3 w-full">
                  <Button 
                    variant="danger" 
                    size="xl"
                    rounded="2xl"
                    onClick={clearCart} 
                  >
                    <Trash2 size={16} /> {t("cancel")}
                  </Button>
                  <Button 
                    variant="primary"
                    size="xl"
                    rounded="2xl"
                    fullWidth
                    disabled={movingToCheckout}
                    onClick={handleMoveToCheckout}
                  >
                    {movingToCheckout ? <Spinner size="sm" /> : <CheckCircle2 size={18} />}
                    {t("process_checkout")}
                  </Button>
                </div>
             ) : (
                <Button 
                  variant="secondary"
                  size="xl"
                  rounded="2xl"
                  fullWidth
                  disabled
                >
                  <CheckCircle2 size={18} />
                  {t("process_checkout")}
                </Button>
             )}
          </WorkspacePanelFooter>
        </WorkspacePanel>
      </div>

    </div>
  );
}
