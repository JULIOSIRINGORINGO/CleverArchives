"use client";

import { memo, ReactNode } from "react";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DESIGN } from "@/config/design-system";

// UI Components
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { UnifiedSearch } from "@/components/ui/UnifiedSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookListCard } from "@/components/books/BookListCard";
import { WorkspacePanelHeader, WorkspacePanelContent } from "@/components/ui/WorkspacePanel";

// --- Types ---

export interface BookCopy {
  id: number;
  barcode: string;
  status: string;
  book: {
    id: number;
    title: string;
    cover_url: string;
    author?: {
      name: string;
    };
  };
}

// --- Helpers ---

const MotionItem = memo(({ children, index }: { children: ReactNode; index: number }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: DESIGN.ANIM.EXIT_SCALE }}
    transition={{ delay: index * DESIGN.ANIM.STAGGER_DELAY }}
  >
    {children}
  </motion.div>
));
MotionItem.displayName = "MotionItem";

const ListRenderer = <T extends { barcode?: string; id: number }>({ 
  items, 
  renderItem, 
  emptyIcon: Icon, 
  emptyTitle 
}: { 
  items: T[]; 
  renderItem: (item: T) => ReactNode; 
  emptyIcon: any; 
  emptyTitle: string 
}) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <Stack spacing="md" flex="1">
      {items.length > 0 ? (
        items.map((item, i) => (
          <MotionItem key={item.barcode || item.id} index={i}>
            {renderItem(item)}
          </MotionItem>
        ))
      ) : (
        <EmptyState icon={Icon} title={emptyTitle} description="" className={DESIGN.STYLING.EMPTY_CARD} />
      )}
    </Stack>
  </AnimatePresence>
);

interface SearchPanelProps {
  barcode: string;
  setBarcode: (val: string) => void;
  searching: boolean;
  handleSearch: (e?: React.FormEvent) => Promise<void>;
  searchResults: BookCopy[];
  handleSelectItem: (copy: BookCopy) => void;
  t: any;
}

export const SearchPanelContent = ({ 
  barcode, setBarcode, searching, handleSearch, searchResults, handleSelectItem, t 
}: SearchPanelProps) => (
  <>
    <WorkspacePanelHeader showDivider={false}>
      <Stack spacing="lg" maxWidth="full">
        <Inline spacing="md" align="center">
          <Box background="primary-soft" rounded="xl" className="w-12 h-12 flex items-center justify-center text-primary">
            <Search size={DESIGN.ICON.HEADER} strokeWidth={DESIGN.ICON.STROKE_BOLD} />
          </Box>
          <Heading level="h4" weight="bold">{t("search_title")}</Heading>
        </Inline>
        <form onSubmit={handleSearch}>
          <Inline spacing="sm" align="center" maxWidth="full">
            <Box flex="1">
              <UnifiedSearch 
                value={barcode}
                onChange={setBarcode}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t("barcode_placeholder")}
                isLoading={searching}
                className="h-11 md:h-12"
                autoFocus
              />
            </Box>
            <Button type="submit" disabled={searching} className={DESIGN.STYLING.BTN_VIVID_BLUE}>
              {t("search_button")}
            </Button>
          </Inline>
        </form>
      </Stack>
    </WorkspacePanelHeader>

    <WorkspacePanelContent>
      <ListRenderer 
        items={searchResults} 
        emptyIcon={BookOpen} 
        emptyTitle={t("empty_search")} 
        renderItem={(copy) => (
          <BookListCard 
            key={copy.id}
            isCompact
            title={copy.barcode}
            author={copy.book?.title}
            status={copy.status}
            metadata={[]}
            action={
              <Button 
                variant="primary"
                size="md"
                onClick={() => handleSelectItem(copy)}
                className={DESIGN.STYLING.BTN_SUBMIT_SM}
              >
                <Inline spacing="xs" align="center" className="group">
                  {t("select")} 
                  <ArrowRight size={DESIGN.ICON.ACTION} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Inline>
              </Button>
            }
          />
        )} 
      />
    </WorkspacePanelContent>
  </>
);
SearchPanelContent.displayName = "SearchPanelContent";
