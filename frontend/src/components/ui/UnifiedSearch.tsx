"use client";

import { Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface UnifiedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  onClear?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  addon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * UnifiedSearch - The "Gold Standard" search bar.
 * Now optionally supports right-side addons like FilterDropdown.
 */
export function UnifiedSearch({ 
  value, 
  onChange, 
  placeholder, 
  isLoading, 
  className,
  onClear,
  onKeyDown,
  autoFocus,
  addon
}: UnifiedSearchProps) {
  return (
    <div className={cn("relative group w-full flex-1 flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </div>
        <input
          type="text"
          name="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={cn(
            "w-full h-11 bg-white border border-border/50 rounded-2xl pl-11 pr-12 text-sm transition-all outline-none md:text-base",
            "focus:ring-4 focus:ring-primary/5 focus:border-primary/40",
            "placeholder:text-slate-400/70 placeholder:font-medium placeholder:text-sm tracking-tight"
          )}
        />
        {value && !isLoading && (
          <button
            onClick={() => onClear ? onClear() : onChange("")}
            className="absolute right-3 top-0 bottom-0 my-auto h-fit p-1.5 hover:bg-muted rounded-xl text-muted-foreground transition-all flex items-center justify-center"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {addon && (
        <div className="shrink-0">
          {addon}
        </div>
      )}
    </div>
  );
}
