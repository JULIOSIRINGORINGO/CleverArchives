"use client";

import React from "react";
import { DashboardSection } from "@/components/layout/DashboardSection";

/**
 * CatalogLoading — Skeleton placeholders for the book grid.
 * Removes manual skeleton Tailwind code from page.
 */
export function CatalogLoading() {
  return (
    <DashboardSection layout="book-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[3/4] rounded-[2.5rem] bg-muted/20 animate-pulse border border-border/10"></div>
          <div className="h-4 w-3/4 bg-muted/20 animate-pulse rounded-full"></div>
          <div className="h-3 w-1/2 bg-muted/20 animate-pulse rounded-full"></div>
        </div>
      ))}
    </DashboardSection>
  );
}
