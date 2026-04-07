"use client";

import { useTranslations, useLocale } from "next-intl";
import { Book, Play, Download } from "lucide-react";

// UI Primitives & Global Components
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { BookListStack } from "@/components/books/BookListStack";
import { Inline } from "@/components/ui/Inline";
import { Button } from "@/components/ui/Button";

// Feature UI Components
import { EbookCardSkeleton } from "@/components/books/EbookCardSkeleton";
import { EbookGridCard } from "@/components/books/EbookGridCard";
import { BookListCard } from "@/components/books/BookListCard";
import { FileText } from "lucide-react";

// SOP 5.6.0 Isolated Tiers & Utils
import { useEbookData } from "@/hooks/useEbookData";
import { EbookMainSection, EbookGrid } from "./_components/EbookAesthetics";
import { formatSize } from "@/lib/utils";

// --- Configuration ---
const EBOOK_UX = {
  GRID_LOADER_COUNT: 12,
} as const;

/**
 * EbooksPage - The Lean Orchestrator (Orkestrator Ramping).
 * Zero ClassName in main return.
 * Logic delegated to useEbookData.
 * Aesthetics isolated in Level 2 / _components.
 */
export default function EbooksPage() {
  const t = useTranslations("EbookLibrary");
  const locale = useLocale();

  // 1. Consumption Tier: No Logic, No State, No Direct API.
  const {
    ebooks,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    viewMode,
    setViewMode,
    topCategories,
    restCategories,
    handleRead,
    handleResetSearch
  } = useEbookData();

  // 2. Local Config (Prop mapping only)
  const filterOptions = [
    { id: 'all', label: t("all") },
    ...topCategories
  ];

  return (
    <DashboardPage
      headerControls={
        <UnifiedFilterBar
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("search_placeholder")}
          isLoading={loading}
          filterOptions={filterOptions}
          activeFilter={filter}
          onFilterChange={setFilter}
          viewMode={viewMode}
          onViewChange={setViewMode}
          extraFilters={
            <FilterDropdown
              options={restCategories}
              activeId={filter}
              onSelect={setFilter}
              defaultLabel={locale === 'id' ? "Kategori Lain" : "Other Categories"}
            />
          }
        />
      }
    >
      <EbookMainSection>
        {loading ? (
          <EbookGrid>
            {Array.from({ length: EBOOK_UX.GRID_LOADER_COUNT }).map((_, i) => (
              <EbookCardSkeleton key={i} />
            ))}
          </EbookGrid>
        ) : ebooks.length === 0 ? (
          <EmptyState
            icon={Book}
            title={t("no_ebooks")}
            description={t("no_ebooks_subtitle")}
            action={search ? { label: t("reset"), onClick: handleResetSearch } : undefined}
          />
        ) : viewMode === 'standard' ? (
          <EbookGrid>
            {ebooks.map(e => (
              <EbookGridCard key={e.id} ebook={e} onRead={() => handleRead(e.id)} />
            ))}
          </EbookGrid>
        ) : (
          <BookListStack>
            {ebooks.map(e => (
              <BookListCard
                key={e.id}
                coverUrl={e.book?.cover_url}
                title={e.book?.title || ""}
                author={e.book?.author?.name || t("unknown_author")}
                status={e.file_format}
                isCompact={viewMode === 'compact'}
                metadata={[
                  { 
                    label: t("size"), 
                    value: formatSize(e.file_size), 
                    icon: 'FileText' as any 
                  }
                ]}
                action={
                  <Inline spacing="sm">
                    <Button 
                      variant="glow" 
                      size="sm" 
                      rounded="lg" 
                      onClick={() => handleRead(e.id)} 
                      aria-label={t("read_now")}
                    >
                      <Inline spacing="xs">
                        <Play size={12} className="fill-current" /> {t("read") || "Read"}
                      </Inline>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      rounded="lg" 
                      className="w-9 p-0" 
                      aria-label="Download ebook"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <Download size={12} />
                    </Button>
                  </Inline>
                }
              />
            ))}
          </BookListStack>
        )}
      </EbookMainSection>
    </DashboardPage>
  );
}
