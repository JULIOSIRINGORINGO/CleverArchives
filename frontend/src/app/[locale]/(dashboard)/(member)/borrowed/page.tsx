"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/EmptyState";
import { Stack } from "@/components/ui/Stack";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";

import { useBorrowedBooks, BORROW_STATUS } from "@/hooks/useBorrowedBooks";
import { 
  BorrowedGrid, 
  BorrowedGroupHeader, 
  BorrowedActionBtn,
  GroupWrapper 
} from "./_components/BorrowedAesthetics";

// --- SUB-COMPONENTS (Pure Rendering) ---

/**
 * Level 3: Local Aesthetics (Isolated at the top as per SOP Section II)
 */
const BorrowingRow = ({ item, viewMode, onReturn, t }: any) => (
  <BookListCard 
    isCompact={viewMode === 'compact'}
    title={item.book_copy?.book?.title || t("books_unit")}
    author={item.book_copy?.book?.author?.name || t("unknown_author")}
    coverUrl={item.book_copy?.book?.cover_url}
    status={item.status}
    typeIcon={item.batch_id ? 'layers' : 'user'}
    metadata={[
      { 
        label: t("borrowDate"), 
        value: new Intl.DateTimeFormat().format(new Date(item.created_at)), 
        icon: "time" 
      },
      { 
        label: t(item.status === BORROW_STATUS.BORROWED ? "dueDate" : "requestedOn"), 
        value: new Intl.DateTimeFormat().format(new Date(item.due_date || item.created_at)), 
        icon: "calendar" 
      }
    ]}
    action={item.status === BORROW_STATUS.BORROWED && (
      <BorrowedActionBtn 
        onClick={() => onReturn(item.id)} 
        label={t("requestReturn")} 
        icon="rotate"
      />
    )}
  />
);

const BorrowingSkeleton = ({ viewMode }: any) => (
  <BookListStack viewMode={viewMode}>
    <BookListCard.Skeleton isCompact={viewMode === 'compact'} count={3} />
  </BookListStack>
);

// --- MAIN PAGE ORCHESTRATOR ---

/**
 * LEVEL 1: THE ORCHESTRATOR (Lean Component)
 * Zero ClassName in main return.
 * Logic delegated to useBorrowedBooks hook.
 */
export default function BorrowedBooksPage() {
  const t = useTranslations("Borrowed");
  const locale = useLocale();
  
  // Absolute Encapsulation: No useEffect, No State, No Direct API in this component.
  const { 
    loading, search, setSearch, 
    filter, setFilter, 
    viewMode, setViewMode, 
    groups, 
    handleReturn 
  } = useBorrowedBooks();

  return (
    <DashboardPage 
      headerControls={
        <UnifiedFilterBar 
          searchTerm={search} 
          onSearchChange={setSearch} 
          isLoading={loading} 
          searchPlaceholder={t("searchPlaceholder")}
          filterOptions={['all', 'active', 'pending', 'overdue'].map(id => ({ id, label: t(id) }))} 
          activeFilter={filter} 
          onFilterChange={setFilter as any} 
          viewMode={viewMode} 
          onViewChange={setViewMode} 
        />
      }
    >
      <DashboardSection layout="full">
        <BorrowedGrid>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BorrowingSkeleton viewMode={viewMode} />
              </motion.div>
            ) : groups.length === 0 ? (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState 
                  icon={search ? "search" : "isbn"} 
                  title={t(search ? "noResults" : "noBorrowed")} 
                  description={t(search ? "noResultsDesc" : "noBorrowedSubtitle")} 
                  action={!search ? { label: t("browseCatalog"), href: `/${locale}/catalog` } : undefined} 
                />
              </motion.div>
            ) : (
              <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Stack spacing="none">
                  {groups.map((g, i) => (
                    <GroupWrapper key={g.groupId || i}>
                      {g.type === 'group' && (
                        <BorrowedGroupHeader 
                          label={t("batch_label")} 
                          id={g.groupId} 
                          icon="layers"
                        />
                      )}
                      <BookListStack viewMode={viewMode}>
                        {g.borrowings.map((b: any) => (
                          <BorrowingRow 
                            key={b.id} 
                            item={b} 
                            viewMode={viewMode} 
                            onReturn={handleReturn} 
                            t={t} 
                          />
                        ))}
                      </BookListStack>
                    </GroupWrapper>
                  ))}
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </BorrowedGrid>
      </DashboardSection>
    </DashboardPage>
  );
}
