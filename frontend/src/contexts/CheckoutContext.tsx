"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface CheckoutItem {
  id: number;
  title: string;
  author: string;
  cover_url?: string;
  copy_id: number;
  barcode: string;
}

interface CheckoutContextType {
  items: CheckoutItem[];
  addToCheckout: (item: CheckoutItem) => { success: boolean; error?: string };
  removeFromCheckout: (barcode: string) => void;
  clearCheckout: () => void;
  totalItems: number;
  hasDuplicate: (barcode: string) => boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const isFirstRender = useRef(true);

  const storageKey = user ? `checkout_user_${user.id}` : "checkout_guest";

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch (e) {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (items.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [items, storageKey]);

  // Clear on logout
  useEffect(() => {
    if (!user) setItems([]);
  }, [user]);

  const hasDuplicate = useCallback((barcode: string) => {
    return items.some(i => i.barcode === barcode);
  }, [items]);

  const addToCheckout = useCallback((item: CheckoutItem): { success: boolean; error?: string } => {
    if (items.some(i => i.barcode === item.barcode)) {
      return { success: false, error: `Eksemplar ${item.barcode} sudah ada di checkout.` };
    }
    setItems(prev => [...prev, item]);
    return { success: true };
  }, [items]);

  const removeFromCheckout = useCallback((barcode: string) => {
    setItems(prev => prev.filter(i => i.barcode !== barcode));
  }, []);

  const clearCheckout = useCallback(() => {
    setItems([]);
  }, []);

  const value = React.useMemo(() => ({
    items,
    addToCheckout,
    removeFromCheckout,
    clearCheckout,
    totalItems: items.length,
    hasDuplicate,
  }), [items, addToCheckout, removeFromCheckout, clearCheckout, hasDuplicate]);

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
