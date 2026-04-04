"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  activeId: string;
  onChange: (id: string) => void;
  fullWidth?: boolean;
  className?: string;
}

/**
 * SegmentedControl — Compact pill-style toggle for switching views.
 * Visually distinct from FilterTabs: smaller, inline, no counts.
 * Used for chart time ranges, view mode toggles, etc.
 */
export function SegmentedControl({
  options,
  activeId,
  onChange,
  fullWidth,
  className,
}: SegmentedControlProps) {
  return (
    <div className={cn(
      "flex items-center bg-muted/50 p-1 rounded-lg border border-border/50 overflow-x-auto",
      fullWidth && "w-full",
      className
    )}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-3 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap",
            activeId === opt.id
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
