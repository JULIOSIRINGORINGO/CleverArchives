"use client";

import { motion } from "framer-motion";
import Link from 'next/link';

import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Button } from "@/components/ui/Button";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";

/**
 * HistoryGrid - Layout Orchestrator for History.
 * Enforces Zero ClassName at the page level by wrapping content.
 */
export const HistoryGrid = ({ children }: { children: React.ReactNode }) => (
  <Box className="pb-16 pt-0 animate-in fade-in duration-700">
    {children}
  </Box>
);

/**
 * HistoryActionBtn - Standardized "Revisit" button for history items.
 */
export const HistoryActionBtn = ({ label, href }: { label: string; href: string }) => (
  <Link href={href}>
    <Button
      variant="primary"
      size="sm"
      rounded="2xl"
      className="uppercase tracking-widest font-black text-white text-[10px] transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <IconWrapper icon="sparkles" size="xs" color="white" isGhost />
      {label}
      <IconWrapper icon="arrow-right" size="xs" color="white" isGhost />
    </Button>
  </Link>
);

/**
 * HistoryRow - Individual Item Rendering.
 */
export const HistoryRow = ({
  item,
  viewMode,
  locale,
  t
}: {
  item: any;
  viewMode: 'standard' | 'compact';
  locale: string;
  t: any;
  index: number;
}) => {
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

  return (
    <BookListCard
      isCompact={viewMode === 'compact'}
      title={item.book_copy?.book?.title || t("books_unit")}
      author={item.book_copy?.book?.author?.name || t("unknown_author")}
      coverUrl={item.book_copy?.book?.cover_url}
      status="completed"
      metadata={[
        {
          label: t("borrowed"),
          value: formatDate(item.created_at),
          icon: "time"
        },
        {
          label: t("returned"),
          value: formatDate(item.updated_at || item.created_at),
          icon: "calendar"
        }
      ]}
      action={
        <HistoryActionBtn label={t("revisit")} href={`/${locale}/catalog`} />
      }
    />
  );
};

/**
 * HistorySkeleton - Loading state for history list.
 */
export const HistorySkeleton = ({ viewMode }: { viewMode: 'standard' | 'compact' }) => (
  <Stack spacing="xl">
    <Box className="flex items-center gap-3 mb-8 opacity-20">
      <Box className="w-8 h-8 rounded-xl bg-primary animate-pulse" />
      <Box className="h-4 w-32 bg-primary/20 rounded-full animate-pulse" />
    </Box>
    <BookListStack viewMode={viewMode}>
      <BookListCard.Skeleton isCompact={viewMode === 'compact'} count={5} />
    </BookListStack>
  </Stack>
);
