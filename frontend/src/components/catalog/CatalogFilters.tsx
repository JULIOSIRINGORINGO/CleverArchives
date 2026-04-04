"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { cn } from "@/lib/utils";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: string;
  onFilterChange: (val: string) => void;
  categories: any[];
  viewMode: 'standard' | 'compact';
  onViewChange: (mode: 'standard' | 'compact') => void;
  isLoading?: boolean;
}

export function CatalogFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  categories,
  viewMode,
  onViewChange,
  isLoading
}: CatalogFiltersProps) {
  const t = useTranslations("Catalog");
  const locale = useLocale();

  const topCategories = categories.slice(0, 3);
  const otherCategories = categories.slice(3).map(c => ({ id: String(c.id), label: c.name }));

  const baseFilterOptions = [
    { id: 'all', label: t("all") },
    ...topCategories.map(c => ({ id: String(c.id), label: c.name }))
  ];

  const categoryDropdown = otherCategories.length > 0 && (
    <FilterDropdown
      options={otherCategories}
      activeId={filter}
      onSelect={onFilterChange}
      defaultLabel={locale === 'id' ? "Lainnya" : "More"}
    />
  );

  return (
    <UnifiedFilterBar 
      searchTerm={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t("searchPlaceholder")}
      isLoading={isLoading}
      filterOptions={baseFilterOptions}
      activeFilter={filter}
      onFilterChange={onFilterChange}
      viewMode={viewMode}
      onViewChange={onViewChange}
      extraFilters={categoryDropdown}
    />
  );
}
