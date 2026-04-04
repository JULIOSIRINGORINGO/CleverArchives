"use client";

import { UnifiedSearch } from "./UnifiedSearch";
import { FilterTabs, FilterOption } from "./FilterTabs";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  viewMode?: 'standard' | 'compact';
  onViewChange?: (mode: 'standard' | 'compact') => void;
  className?: string;
  extraFilters?: React.ReactNode;
  searchAddon?: React.ReactNode;
}

/**
 * UnifiedFilterBar - Komponen standar untuk area filter di setiap menu.
 * Menggabungkan Pencarian, Filter Tabs, dan Toggle Tampilan dalam satu desain workspace.
 */
export function UnifiedFilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  isLoading,
  filterOptions,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewChange,
  className,
  extraFilters,
  searchAddon
}: UnifiedFilterBarProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-center gap-6 w-full", className)}>
      {/* Kolom Pencarian */}
      <UnifiedSearch 
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        isLoading={isLoading}
        addon={searchAddon}
      />
      
      {/* Kontainer Filter & Toggle */}
      <div className="flex items-center gap-3 bg-white p-1.5 rounded-[1.5rem] border border-border/40 shadow-sm shrink-0 self-stretch md:self-auto overflow-visible">
        {/* Filter Tabs (Opsional) */}
        {(filterOptions && activeFilter && onFilterChange) || extraFilters ? (
          <div className="flex items-center gap-2 grow min-w-0">
            {filterOptions && activeFilter && onFilterChange && (
              <div className="overflow-x-auto no-scrollbar scroll-smooth grow min-w-0">
                <FilterTabs 
                  options={filterOptions}
                  activeId={activeFilter}
                  onChange={onFilterChange}
                  className="h-11 border-none shadow-none bg-transparent"
                />
              </div>
            )}
            {extraFilters && (
              <div className="shrink-0 flex items-center pr-1">
                {extraFilters}
              </div>
            )}
            {(viewMode && onViewChange) && <div className="w-px h-6 bg-border/20 mx-1 shrink-0" />}
          </div>
        ) : null}
        
        {/* Toggle Tampilan (Opsional) */}
        {viewMode && onViewChange && (
            <div className="flex items-center gap-1.5 ml-1">
              <button 
                onClick={() => onViewChange('standard')}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'standard' 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <LayoutGrid size={18} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => onViewChange('compact')}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'compact' 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <List size={18} strokeWidth={2.5} />
              </button>
            </div>
        )}
      </div>
    </div>
  );
}
