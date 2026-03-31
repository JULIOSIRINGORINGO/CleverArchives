"use client";

import { useCart } from "@/contexts/CartContext";
import { X, ShoppingBag, Trash2, ArrowRight, BookOpen, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const t = useTranslations("Cart");
  const tc = useTranslations("Catalog");
  const locale = useLocale();
  const { item, addItem, removeItem, totalItems } = useCart();
  const router = useRouter();

  // Barcode Entry State
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

  const handleAddByBarcode = async () => {
    if (!barcodeInput.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch(`${API_URL}/books/by_barcode?barcode=${encodeURIComponent(barcodeInput)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Slug': localStorage.getItem('tenant-slug') || 'stellar'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Book copy not found");
      }

      // Check if already in cart
      if (item && item.barcode === data.book_copy.barcode) {
        throw new Error("This book copy is already in your cart");
      }

      if (data.book_copy.status !== 'available') {
        throw new Error("This book copy is currently not available");
      }

      addItem({
        id: data.book.id,
        title: data.book.title,
        author: data.book.author?.name || "Unknown Author",
        cover_url: data.book.cover_url,
        copy_id: data.book_copy.id,
        barcode: data.book_copy.barcode
      });

      setBarcodeInput("");
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const goToCheckout = () => {
    onClose();
    setTimeout(() => {
      router.push(`/${locale}/checkout`);
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-md bg-[--color-surface] z-50 shadow-2xl transition-transform duration-500 ease-out flex flex-col border-l border-[--color-border]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-[--color-border] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[--color-primary]/10 rounded-xl text-[--color-primary]">
              <ShoppingBag size={20} strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-[--color-text]">{t("title")} ({totalItems})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[--color-muted] rounded-full transition-colors text-[--color-text]">
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Add by Barcode Section */}
        <div className="p-6 border-b border-[--color-border] bg-[--color-muted]/10 space-y-4">
          <div className="space-y-1 mt-2">
            <p className="text-sm font-bold text-[--color-muted-foreground] tracking-widest">{tc("physicalId") || "Masukkan ID Fisik"}</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted-foreground]" size={16} strokeWidth={2} />
                <Input 
                  placeholder={t("id_input_helper")}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddByBarcode()}
                  className="pl-9 h-11 bg-[--color-surface] rounded-xl border-[--color-border]"
                  disabled={isSearching}
                />
              </div>
              <Button 
                onClick={handleAddByBarcode} 
                disabled={isSearching || !barcodeInput.trim()}
                className="h-11 rounded-xl px-6 font-bold bg-[--color-primary] text-white"
              >
                {tc("select") || "Pilih"}
              </Button>
            </div>
            {searchError && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-2">
                <AlertCircle size={12} strokeWidth={2} /> {searchError}
              </p>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!item ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 mt-10">
              <div className="w-20 h-20 bg-[--color-muted] rounded-full flex items-center justify-center text-[--color-muted-foreground]">
                <BookOpen size={40} strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-lg text-[--color-text]">{t("empty")}</p>
                <p className="text-[--color-muted-foreground] text-sm mt-1">{t("emptySubtitle")}</p>
              </div>
            </div>
          ) : (
            <div key={item.barcode} className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex gap-4 group relative">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-[--color-muted] border border-[--color-border] shadow-sm shrink-0">
                  <img 
                    src={item.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80"} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold text-sm leading-tight line-clamp-2 text-[--color-text]">{item.title}</h4>
                  <p className="text-xs text-[--color-muted-foreground] mt-1 truncate">{item.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-[--color-primary] tracking-widest bg-[--color-primary]/10 px-2 py-0.5 rounded-full">
                      ID: {item.barcode}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem()}
                  className="p-2 text-[--color-muted-foreground] hover:text-red-500 hover:bg-red-500/10 absolute right-0 top-0 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} strokeWidth={2} />
                </button>
              </div>
              <div className="h-px w-full bg-border" />
            </div>
          )}
        </div>

        {/* Link to Checkout Summary Footer */}
        {item && (
          <div className="p-6 border-t border-[--color-border] bg-[--color-muted]/20 space-y-4">
            <div className="flex items-center justify-between font-bold text-lg text-[--color-text]">
               <span>{t("total")}:</span>
               <span>{totalItems}</span>
             </div>
            <Button 
              onClick={goToCheckout}
              className="w-full rounded-2xl py-7 text-lg font-bold gap-3 shadow-lg shadow-[--color-primary]/20 bg-[--color-primary] text-white"
            >
              {t("checkout")} <ArrowRight size={20} strokeWidth={2} />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
