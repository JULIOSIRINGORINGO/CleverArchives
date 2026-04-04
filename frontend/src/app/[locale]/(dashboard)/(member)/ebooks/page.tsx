"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Book } from "lucide-react";

// UI Primitives & Components
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { EmptyState } from "@/components/ui/EmptyState";

// UI Feature Components (Modular)
import { EbookCardSkeleton } from "@/components/books/EbookCardSkeleton";
import { BookListStack } from "@/components/books/BookListStack";
import { EbookGridCard } from "@/components/books/EbookGridCard";
import { EbookListRow } from "@/components/books/EbookListRow";

// Layout & Framework
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { apiService } from "@/services/api";
import { useTranslations, useLocale } from "next-intl";
import { useFilteredEbooks, type Ebook, type Category } from "./ebook-utils";

// --- Configuration ---

const EBOOK_UX_PAGE = {
  GRID_LOADER_COUNT: 12,
} as const;

// --- Main Page ---

export default function EbooksPage() {
  const t = useTranslations("EbookLibrary");
  const locale = useLocale();
  const router = useRouter();

  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eRes, cRes] = await Promise.all([apiService.ebooks.list(), apiService.categories.list()]);
        setEbooks(Array.isArray(eRes) ? eRes : []);
        setCategories(cRes?.data || cRes || []);
      } catch (err) {
        console.error("Library Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { filtered, top: rawTop, rest: rawRest } = useFilteredEbooks(ebooks, search, filter, categories);

  const top = useMemo(() => rawTop.map(c => ({ id: String(c.id), label: c.name })), [rawTop]);
  const rest = useMemo(() => rawRest.map(c => ({ id: String(c.id), label: c.name })), [rawRest]);

  const filterConfigs = useMemo(() => [
    { id: 'all', label: t("all") },
    ...top
  ], [top, t]);

  const onRead = useCallback((id: number) => {
    router.push(`/${locale}/ebooks/${id}/viewer`);
  }, [locale, router]);

  return (
    <DashboardPage
      headerControls={
        <UnifiedFilterBar
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("search_placeholder")}
          isLoading={loading}
          filterOptions={filterConfigs}
          activeFilter={filter}
          onFilterChange={setFilter}
          viewMode={viewMode}
          onViewChange={setViewMode}
          extraFilters={
            <FilterDropdown
              options={rest}
              activeId={filter}
              onSelect={setFilter}
              defaultLabel={locale === 'id' ? "Kategori Lain" : "Other Categories"}
            />
          }
        />
      }
    >
      <DashboardSection layout="full" spaced className="pt-6">
        {loading ? (
          <DashboardSection layout="book-grid">
            {Array.from({ length: EBOOK_UX_PAGE.GRID_LOADER_COUNT }).map((_, i) => (
              <EbookCardSkeleton key={i} />
            ))}
          </DashboardSection>
        ) : !filtered.length ? (
          <EmptyState
            icon={Book}
            title={t("no_ebooks")}
            description={t("no_ebooks_subtitle")}
            action={search ? { label: t("reset"), onClick: () => setSearch("") } : undefined}
          />
        ) : viewMode === 'standard' ? (
          <DashboardSection layout="book-grid">
            {filtered.map(e => (
              <EbookGridCard key={e.id} ebook={e} onRead={() => onRead(e.id)} />
            ))}
          </DashboardSection>
        ) : (
          <BookListStack>
            {filtered.map(e => (
              <EbookListRow key={e.id} ebook={e} onRead={() => onRead(e.id)} />
            ))}
          </BookListStack>
        )}
      </DashboardSection>
    </DashboardPage>
  );
}
