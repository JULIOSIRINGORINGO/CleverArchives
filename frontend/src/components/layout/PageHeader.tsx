"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, badge, children, icon, className }: PageHeaderProps) => {
  return (
    <div className={cn(
      "sticky top-0 z-20 bg-[--color-background]/95 backdrop-blur-md -mx-4 md:-mx-6 px-4 md:px-6 pt-10 pb-6 border-b border-border/50 shadow-sm transition-all overflow-visible mb-8",
      className
    )}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0 mt-0.5">
              {icon}
            </div>
          )}
          <div>
            {badge && (
              <div className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 mb-2">
                <span className="text-[10px] font-bold text-primary/70 leading-none">{badge}</span>
              </div>
            )}
            <h1 className="text-2xl font-bold leading-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm font-bold max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
};
