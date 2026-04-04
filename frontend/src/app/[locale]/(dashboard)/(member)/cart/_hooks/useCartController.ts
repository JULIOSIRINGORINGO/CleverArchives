"use client";

import { useState, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { apiService } from "@/services/api";
import { BookCopy } from "../_components/SearchPanel";

/**
 * useCartController - Otak dari modul Cart.
 * Mengelola seluruh state scan, pencarian buku, dan perpindahan ke checkout.
 * Memisahkan logika bisnis dari level orkestrasi (Page).
 */
export function useCartController() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const router = useRouter();
  const { item, addItem, clearCart } = useCart();
  const { addToCheckout, hasDuplicate } = useCheckout();
  const { toast } = useToast();

  // 1. States
  const [barcode, setBarcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BookCopy[]>([]);
  const [movingToCheckout, setMovingToCheckout] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  // 2. Action Handlers
  const handleSelectItem = useCallback((copy: BookCopy) => {
    if (copy.status !== "available") {
      toast(t("not_available"), "error");
      return;
    }
    if (item && item.barcode === copy.barcode) {
      toast(t("already_cart"), "error");
      return;
    }
    if (hasDuplicate(copy.barcode)) {
      toast(t("already_checkout"), "error");
      return;
    }

    addItem({
      id: copy.book.id,
      title: copy.book.title,
      author: copy.book.author?.name || "Unknown Author",
      cover_url: copy.book.cover_url,
      copy_id: copy.id,
      barcode: copy.barcode,
    });
    toast(t("add_success", { title: copy.book.title }), "success");
    setBarcode("");
  }, [item, addItem, hasDuplicate, t, toast]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcode.trim()) return;
    
    setSearching(true);
    setSearchResults([]);
    
    try {
      const data = await apiService.books.getByBarcode(barcode);
      if (data && data.book) {
        const copies = await apiService.books.getCopies(data.book.id);
        const copiesList: BookCopy[] = Array.isArray(copies) ? copies : copies.data || [];
        const enhancedCopies = copiesList.map((c: BookCopy) => ({ ...c, book: data.book }));
        setSearchResults(enhancedCopies);

        // Auto-add matching barcode feature
        const currentBarcode = barcode.trim();
        const exactMatch = enhancedCopies.find(
          (c: BookCopy) => c.barcode === currentBarcode && c.status === "available",
        );
        
        if (exactMatch) {
          handleSelectItem(exactMatch);
        } else {
          const firstAvailable = enhancedCopies.find((c: BookCopy) => c.status === "available");
          if (firstAvailable) handleSelectItem(firstAvailable);
        }
      } else {
        toast(t("error_not_found"), "error");
      }
    } catch (err) {
      toast(t("error_not_found"), "error");
    } finally {
      setSearching(false);
    }
  }, [barcode, handleSelectItem, t, toast]);

  const handleMoveToCheckout = useCallback(() => {
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
  }, [item, addToCheckout, clearCart, locale, router, t, toast]);

  const closeWarning = useCallback(() => setShowWarning(false), []);

  // 3. Grouped Props for Clean Orchestration
  const searchProps = {
    barcode,
    setBarcode,
    searching,
    handleSearch,
    searchResults,
    handleSelectItem,
    t,
  };

  const confirmationProps = {
    item,
    movingToCheckout,
    handleMoveToCheckout,
    clearCart,
    t,
  };

  const alertProps = {
    showWarning,
    closeWarning,
    t,
  };

  return {
    searchProps,
    confirmationProps,
    alertProps,
  };
}
