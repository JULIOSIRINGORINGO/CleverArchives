import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { 
  RecommendationRoot, 
  RecommendationHeaderBox, 
  RecommendationScrollArea, 
  BookItemRoot, 
  BookCoverBox, 
  BookInfoBox,
  RecommendationItemWrapper,
  RecommendationSkeletonItem,
  RecommendationSkeletonCover,
  RecommendationSkeletonTitle,
  RecommendationSkeletonAuthor,
  RecommendationEmptyState,
  BookTitleText,
  BookAuthorText,
  RecommendationImage,
  RecommendationPlaceholder
} from "./_components/RecommendationAesthetics";

interface Book {
  id: string | number;
  title: string;
  cover_url?: string;
  author?: { name: string };
}

interface RecommendationCarouselProps {
  title: string;
  books: Book[];
  loading?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  emptyLabel?: string;
  unknownAuthorLabel?: string;
  /** Locale prefix for book detail links, e.g. "/en" */
  localePrefix: string;
}

/**
 * RecommendationCarousel — Horizontal scrolling book carousel.
 * Strictly follows SOP v5.6.0 with isolated aesthetics and Zero ClassName.
 */
export function RecommendationCarousel({
  title,
  books,
  loading = false,
  viewAllHref,
  viewAllLabel = "View All",
  emptyLabel = "No recommendations yet",
  unknownAuthorLabel = "Unknown Author",
  localePrefix,
}: RecommendationCarouselProps) {
  const t = useTranslations("Dashboard");

  return (
    <RecommendationRoot>
      <RecommendationHeaderBox>
        <PanelSectionHeader icon={<Sparkles size={16} />} title={title} />
        {viewAllHref && (
          <Link href={viewAllHref}>
            <Button variant="primary" size="sm" rounded="lg">
              {viewAllLabel} <ChevronRight size={14} />
            </Button>
          </Link>
        )}
      </RecommendationHeaderBox>

      <RecommendationScrollArea>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <RecommendationSkeletonItem key={i}>
              <RecommendationSkeletonCover />
              <RecommendationSkeletonTitle />
              <RecommendationSkeletonAuthor />
            </RecommendationSkeletonItem>
          ))
        ) : books.length > 0 ? (
          books.map((book) => (
            <RecommendationItemWrapper key={book.id}>
              <Link href={`${localePrefix}/catalog/${book.id}`}>
                <BookItemRoot>
                  <BookCoverBox overlayText={t("read_now", { fallback: "Read Now" })}>
                    {book.cover_url ? (
                      <RecommendationImage 
                        src={book.cover_url}
                        alt={book.title}
                      />
                    ) : (
                      <RecommendationPlaceholder>
                        <BookOpen size={48} />
                      </RecommendationPlaceholder>
                    )}
                  </BookCoverBox>

                  <BookInfoBox>
                    <BookTitleText title={book.title}>
                      {book.title}
                    </BookTitleText>
                    <BookAuthorText title={book.author?.name || unknownAuthorLabel}>
                      {book.author?.name || unknownAuthorLabel}
                    </BookAuthorText>
                  </BookInfoBox>
                </BookItemRoot>
              </Link>
            </RecommendationItemWrapper>
          ))
        ) : (
          <RecommendationEmptyState>
            <Box display="flex" align="center" gap="sm" opacity="50">
              <BookOpen size={16} />
              <Text variant="body" weight="black">
                {emptyLabel}
              </Text>
            </Box>
          </RecommendationEmptyState>
        )}
      </RecommendationScrollArea>
    </RecommendationRoot>
  );
}
