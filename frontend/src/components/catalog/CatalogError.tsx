"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface CatalogErrorProps {
  error: string;
  onRetry: () => void;
}

/**
 * CatalogError — Standardized error state for the catalog page.
 * Processes error messages and retry logic in one place.
 */
export function CatalogError({ error, onRetry }: CatalogErrorProps) {
  const t = useTranslations("Catalog");

  return (
    <div className="flex flex-col items-center justify-center py-40 text-center gap-6 animate-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center shadow-xl shadow-rose-100/50">
        <AlertCircle size={48} strokeWidth={2} className="text-rose-500 opacity-60" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-rose-950">{t("errorTitle")}</h3>
        <p className="text-sm font-medium text-rose-900/40 max-w-md italic">{error}</p>
      </div>
      <Button 
        variant="outline" 
        size="lg"
        className="mt-4 rounded-2xl border-rose-200 hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
        onClick={onRetry}
      >
        {t("tryAgain")}
      </Button>
    </div>
  );
}
