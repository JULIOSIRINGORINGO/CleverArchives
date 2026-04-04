"use client";

import { useState } from "react";
import { Search, ArrowUpRight, Bookmark } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { useBookCatalog } from "@/hooks/useBookCatalog";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogLoading } from "@/components/catalog/CatalogLoading";
import { CatalogError } from "@/components/catalog/CatalogError";
import { BookGridCard } from "@/components/books/BookGridCard";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import BookDetailModal from "@/components/books/BookDetailModal";

export default function MemberCatalog() {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  
  // Data Logic extracted to hooks
  const {
    books, categories, loading, error, refresh,
    search, setSearch, filter, setFilter,
    page, setPage, totalPages,
    viewMode, setViewMode
  } = useBookCatalog();

  // Local UI state (modals)
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookClick = (book: any) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

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
                onClick={() => handleBookClick(book)} 
              />
            ))}
          </DashboardSection>
        ) : (
          <BookListStack viewMode="compact">
            {books.map((book: any) => (
              <BookListCard 
                key={book.id}
                isCompact={true}
                title={book.title}
                author={book.author?.name || t("unknown_author")}
                status={book.available_copies_count > 0 ? "available" : "borrowed"}
                coverUrl={book.cover_url}
                metadata={[
                  { 
                    label: t("category") || "Category", 
                    value: book.category?.name || t("uncategorized"), 
                    icon: Bookmark
                  }
                ]}
                action={
                  <Button 
                    size="sm" 
                    variant="primary"
                    rounded="full"
                    className="flex items-center gap-2"
                    onClick={() => handleBookClick(book)}
                  >
                    {locale === 'id' ? "Dapatkan" : "Get It"} 
                    <ArrowUpRight size={14} strokeWidth={2.5} />
                  </Button>
                }
              />
            ))}
          </BookListStack>
        )}
      </DashboardSection>

      <BookDetailModal 
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardPage>
  );
}
