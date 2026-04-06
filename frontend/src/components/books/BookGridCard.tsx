"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StorageImage } from "@/components/ui/StorageImage";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";

// Feature Aesthetics
import { 
  BookCardWrapper, 
  BookCoverWrapper, 
  BookHoverOverlay, 
  BookBadgeContainer,
  BookContentBlock,
  BookHoverAction
} from "@/components/catalog/_components/CatalogAesthetics";

interface BookGridCardProps {
  book: any;
  onClick: () => void;
  index: number;
}

/**
 * Standardized BookGridCard — Zero Hardcode version.
 * Strictly following SOP 5.6.0.
 */
export function BookGridCard({ book, onClick, index }: BookGridCardProps) {
  const t = useTranslations("Catalog");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: index * 0.05, duration: 0.5 } 
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <BookCardWrapper onClick={onClick}>
        <Stack spacing="none">
          {/* Cover Layer with Branded Aesthetics */}
          <BookCoverWrapper>
            <StorageImage 
              src={book.cover_url} 
              alt={book.title}
              fill
              className="group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            
            {/* Branded Overlays isolated via Aesthetics wrapper */}
            <BookBadgeContainer>
              <Stack spacing="xs">
                <CategoryBadge label={book.category?.name || t("uncategorized")} />
                {book.ebook && (
                  <StatusBadge status="completed" label={t("ebook")} />
                )}
              </Stack>
            </BookBadgeContainer>

            <BookHoverOverlay>
              <BookHoverAction onClick={onClick} />
            </BookHoverOverlay>
          </BookCoverWrapper>
          
          {/* Information Layer using Semantic Block */}
          <BookContentBlock>
             <Stack spacing="xs">
                <Heading level="h3" size="sm">
                  {book.title}
                </Heading>
                <Text variant="muted" opacity="60">
                  {book.author?.name || t("unknown_author")}
                </Text>
             </Stack>
             
             {/* Dynamic Status Row */}
             <Box paddingTop="lg" border="top">
                <StatusBadge 
                  status={book.available_copies_count > 0 ? "available" : "borrowed"} 
                  label={book.available_copies_count > 0 ? `${book.available_copies_count} ${t("available")}` : undefined}
                />
             </Box>
          </BookContentBlock>
        </Stack>
      </BookCardWrapper>
    </motion.div>
  );
}
