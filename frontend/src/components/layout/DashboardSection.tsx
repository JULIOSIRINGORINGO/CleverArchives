"use client";

import React from "react";
import { cn } from "@/lib/utils";

type DashboardSectionLayout =
  | "stat-grid"     // 1 → 2 → 4 columns
  | "chart-sidebar" // 8/4 split
  | "full";         // single full-width block

interface DashboardSectionProps {
  layout?: DashboardSectionLayout;
  children: React.ReactNode;
  spaced?: boolean;
  className?: string;
}

const layoutStyles: Record<DashboardSectionLayout, string> = {
  "stat-grid":     "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5",
  "chart-sidebar": "grid grid-cols-1 md:grid-cols-12 gap-6",
  "full":          "",
};

/**
 * DashboardSection — Semantic layout wrapper for dashboard content blocks.
 * Provides preset grid configurations to eliminate manual layout classes in pages.
 */
export function DashboardSection({
  layout = "full",
  children,
  spaced = false,
  className,
}: DashboardSectionProps) {
  return (
    <div className={cn(
      layoutStyles[layout], 
      spaced && "pt-6 space-y-6",
      className
    )}>
      {children}
    </div>
  );
}

DashboardSection.Main = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("md:col-span-8 lg:col-span-8", className)}>{children}</div>
);

DashboardSection.Side = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("md:col-span-4 lg:col-span-4", className)}>{children}</div>
);
