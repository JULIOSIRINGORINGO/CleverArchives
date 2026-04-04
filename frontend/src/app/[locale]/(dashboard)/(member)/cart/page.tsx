"use client";

import React from "react";
import { useCartController } from "./_hooks/useCartController";
import { CartMainView } from "./_components/CartMainView";

/**
 * CartPage - "The Atheist Orchestrator" (Gold Level).
 * Page ini 100% suci dari logika bisnis, state management, dan pemrosesan API.
 * Menggunakan pola 'Grouped Props' hasil ekstraksi controller.
 */
export default function CartPage() {
  const { 
    searchProps, 
    confirmationProps, 
    alertProps 
  } = useCartController();

  return (
    <CartMainView 
      searchProps={searchProps}
      confirmationProps={confirmationProps}
      alertProps={alertProps}
    />
  );
}
