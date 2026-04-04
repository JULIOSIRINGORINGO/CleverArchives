"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitPanelLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  primaryRatio?: number;
}

/**
 * SplitPanelLayout — A responsive two-column layout wrapper.
 * Refactored with sub-components for a declarative "Zero Tailwind" orchestration.
 */
export function SplitPanelLayout({
  className,
  children,
  ...props
}: SplitPanelLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row overflow-hidden max-h-[90vh] bg-background w-full h-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

SplitPanelLayout.Left = function SplitPanelLeft({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("w-full md:w-[42%] bg-muted relative aspect-[3.5/4] md:aspect-auto overflow-hidden group shrink-0", className)}>
      {children}
    </div>
  );
};

SplitPanelLayout.Right = function SplitPanelRight({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex-1 flex flex-col min-h-0 bg-background relative shadow-[-20px_0_40px_rgba(0,0,0,0.05)]", className)}>
      {children}
    </div>
  );
};
