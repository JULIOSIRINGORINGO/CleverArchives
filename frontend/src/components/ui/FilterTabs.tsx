"use client";

import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  options: FilterOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * FilterTabs - Consistent horizontal navigation pills.
 * Consistent h-14 container with rounded-2xl chips.
 */
export function FilterTabs({ 
  options, 
  activeId, 
  onChange, 
  className 
}: FilterTabsProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 overflow-x-auto h-14 no-scrollbar scroll-smooth",
      className
    )}>
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "px-6 h-11 flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all whitespace-nowrap border border-transparent shadow-sm hover:shadow",
              isActive 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-card border-border/40 text-muted-foreground hover:bg-muted/50 hover:border-border/60 hover:text-foreground"
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors",
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
