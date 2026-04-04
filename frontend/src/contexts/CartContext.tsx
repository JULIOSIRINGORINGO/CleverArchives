"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: number;
  title: string;
  author: string;
  cover_url?: string;
  copy_id: number;
  barcode: string;
}

interface CartContextType {
  item: CartItem | null;
  addItem: (item: CartItem) => boolean;
  removeItem: () => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [item, setItem] = useState<CartItem | null>(null);
  const isFirstRender = useRef(true);

  // Storage key is user-specific if user is logged in, otherwise global
  const storageKey = user ? `cart_user_${user.id}` : "cart_guest";

  useEffect(() => {
    // Load from localStorage only on mount or user change
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        setItem(JSON.parse(savedCart));
      } catch (e) {
        setItem(null);
      }
    } else {
      setItem(null);
    }
  }, [storageKey]);

  useEffect(() => {
    // Save to localStorage whenever items change
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (item) {
      localStorage.setItem(storageKey, JSON.stringify(item));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [item, storageKey]);

  // When user logs out, we clear the session state
  useEffect(() => {
    if (!user) {
      setItem(null);
    }
  }, [user]);

  const addItem = useCallback((newItem: CartItem) => {
    setItem(newItem);
    return true;
  }, []);

  const removeItem = useCallback(() => {
    setItem(null);
  }, []);

  const clearCart = useCallback(() => {
    setItem(null);
  }, []);

  const value = React.useMemo(() => ({
    item,
    addItem,
    removeItem,
    clearCart,
    totalItems: item ? 1 : 0
  }), [item, addItem, removeItem, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
