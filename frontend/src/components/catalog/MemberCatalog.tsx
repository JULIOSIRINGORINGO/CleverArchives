"use client";

import { Search, ArrowUpRight, Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";

import { useBookCatalog } from "@/hooks/useBookCatalog";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogLoading } from "@/components/catalog/CatalogLoading";
import { CatalogError } from "@/components/catalog/CatalogError";
import { BookGridCard } from "@/components/books/BookGridCard";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import BookDetailModal from "@/components/books/BookDetailModal";

// SOP 5.6.0 compliant Aesthetics
import { CatalogActionButton } from "./_components/CatalogAesthetics";

export default function MemberCatalog() {
  const t = useTranslations("Catalog");
  
  // Pure Logic Tier: All state delegated to hook
  const {
    books, categories, loading, error, refresh,
    search, setSearch, filter, setFilter,
    page, setPage, totalPages,
    viewMode, setViewMode,
    selectedBook, isModalOpen, openBookDetails, closeBookDetails
  } = useBookCatalog();

  return (
    <DashboardPage 
      headerControls={
        <CatalogFilters 
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          categories={categories}
          viewMode={viewMode}
          onViewChange={setViewMode}
          isLoading={loading}
        />
      }
      footer={
        <CatalogPagination 
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      }
    >
      <DashboardSection layout="full" spaced>
        {loading ? (
          <CatalogLoading />
        ) : error ? (
          <CatalogError error={error} onRetry={refresh} />
        ) : books.length === 0 ? (
          <EmptyState 
            icon={Search}
            title={t("noBooks")}
            description={t("noBooksSubtitle")}
            action={search ? { label: t("clearSearch") || "Clear", onClick: () => setSearch("") } : undefined}
          />
        ) : viewMode === 'standard' ? (
          <DashboardSection layout="book-grid">
            {books.map((book: any, idx: number) => (
              <BookGridCard 
                key={book.id}
                book={book} 
                index={idx}
                onClick={() => openBookDetails(book)} 
              />
            ))}
          </DashboardSection>
        ) : (
          <BookListStack viewMode={viewMode}>
            {books.map((book: any) => (
              <BookListCard 
                key={book.id}
                isCompact={viewMode === 'compact'}
                title={book.title}
                author={book.author?.name || t("unknown_author")}
                category={book.category?.name || t("uncategorized")}
                status={book.available_copies_count > 0 ? "available" : "borrowed"}
                coverUrl={book.cover_url}
                metadata={[]}
                action={
                  <CatalogActionButton onClick={() => openBookDetails(book)}>
                    {t("action_get")}
                  </CatalogActionButton>
                }
              />
            ))}
          </BookListStack>
        )}
      </DashboardSection>

      <BookDetailModal 
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={closeBookDetails}
      />
    </DashboardPage>
  );
}
