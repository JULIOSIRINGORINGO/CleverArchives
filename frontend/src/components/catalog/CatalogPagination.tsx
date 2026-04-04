"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * CatalogPagination — Premium pagination controls for the book list.
 * Removes manual flex/gap and styling logic from page.
 */
export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2));

  return (
    <div className="flex justify-center items-center gap-3">
      <Button 
        variant="outline" 
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        size="icon"
        className="rounded-xl bg-white border-border/40 hover:bg-muted/50 transition-all shadow-sm active:scale-95"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </Button>
      
      <div className="flex items-center gap-2 p-1.5 bg-white/50 rounded-[1.5rem] border border-border/30 shadow-sm">
        {pagesToShow.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "w-11 h-11 rounded-xl font-bold text-xs transition-all duration-300",
              page === p 
                ? "bg-white text-primary shadow-xl ring-1 ring-black/5 scale-105" 
                : "hover:bg-muted/40 text-muted-foreground/40 hover:text-muted-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <Button 
        variant="outline" 
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        size="icon"
        className="rounded-xl bg-white border-border/40 hover:bg-muted/50 transition-all shadow-sm active:scale-95"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </Button>
    </div>
  );
}
