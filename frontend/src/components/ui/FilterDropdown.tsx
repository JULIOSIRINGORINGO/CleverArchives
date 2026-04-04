"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/DropdownMenu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string | number;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  activeId: string | number;
  onSelect: (id: string) => void;
  defaultLabel: string;
}

/**
 * FilterDropdown - Standardized dropdown for selecting filters.
 * Styled to match FilterTabs navigation pills.
 */
export function FilterDropdown({ 
  options, 
  activeId, 
  onSelect, 
  defaultLabel 
}: FilterDropdownProps) {
  const isActive = options.some(o => String(o.id) === String(activeId));
  const activeLabel = options.find(o => String(o.id) === String(activeId))?.label;

  if (!options.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "px-6 h-11 flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all whitespace-nowrap border shadow-sm hover:shadow active:scale-95",
            isActive 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
              : "bg-card border-border/40 text-muted-foreground hover:bg-muted/50 hover:border-border/60 hover:text-foreground"
          )}
        >
          <span>{isActive ? activeLabel : defaultLabel}</span>
          <ChevronDown 
            size={16} 
            strokeWidth={isActive ? 3 : 2} 
            className={cn("transition-transform duration-500 opacity-60", isActive && "rotate-180 opacity-100")} 
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border border-border/40 shadow-2xl bg-white">
        {options.map(option => (
          <DropdownMenuItem 
            key={option.id} 
            onClick={() => onSelect(String(option.id))}
            className={cn(
              "rounded-xl px-4 py-2.5 transition-all cursor-pointer font-medium text-sm",
              String(activeId) === String(option.id) 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
