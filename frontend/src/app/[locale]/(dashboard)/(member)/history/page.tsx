"use client";

import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

import { EmptyState } from "@/components/ui/EmptyState";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListStack } from "@/components/books/BookListStack";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";

import { useBorrowingHistory } from "@/hooks/useBorrowingHistory";
import { 
  HistoryGrid, 
  HistoryRow, 
  HistorySkeleton 
} from "./_components/HistoryAesthetics";

/**
 * LEVEL 1: THE ORCHESTRATOR (Lean Component)
 * Zero ClassName in main return.
 * Logic delegated to useBorrowingHistory hook.
 * Aesthetics isolated in HistoryAesthetics and HistoryRow.
 */
export default function BorrowHistory() {
  const t = useTranslations("History");
  const locale = useLocale();
  
  // Absolute Encapsulation: Consumption only. 
  // No API calls or useEffects in this orchestrator.
  const { 
    loading, search, setSearch, 
    filter, setFilter, 
    viewMode, setViewMode, 
    history 
  } = useBorrowingHistory();

  return (
    <DashboardPage 
      headerControls={
        <UnifiedFilterBar 
          searchTerm={search} 
          onSearchChange={setSearch} 
          isLoading={loading} 
          searchPlaceholder={t("searchPlaceholder")}
          filterOptions={['all', 'oldest'].map(id => ({ id, label: t(id) }))} 
          activeFilter={filter} 
          onFilterChange={setFilter as any} 
          viewMode={viewMode} 
          onViewChange={setViewMode} 
        />
      }
    >
      <DashboardSection layout="full" spaced>
        <HistoryGrid>
          <AnimatePresence mode="wait">
            {loading ? (
              <HistorySkeleton key="l" viewMode={viewMode} />
            ) : history.length === 0 ? (
              <EmptyState 
                key="e"
                icon="history" 
                title={t("noHistory")} 
                description={t("noHistorySubtitle")} 
                action={{ label: t("startReading"), href: `/${locale}/catalog` }} 
              />
            ) : (
              <BookListStack viewMode={viewMode}>
                {history.map((item, index) => (
                  <HistoryRow 
                    key={item.id} 
                    item={item} 
                    viewMode={viewMode} 
                    locale={locale} 
                    t={t} 
                    index={index} 
                  />
                ))}
              </BookListStack>
            )}
          </AnimatePresence>
        </HistoryGrid>
      </DashboardSection>
    </DashboardPage>
  );
}
