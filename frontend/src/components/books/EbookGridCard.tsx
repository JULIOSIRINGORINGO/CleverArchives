"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Play, Download, FileText } from "lucide-react";

// UI Primitives
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StorageImage } from "@/components/ui/StorageImage";

// Feature Aesthetics (Standardized with Catalog)
import { 
  BookCardWrapper, 
  BookCoverWrapper, 
  BookHoverOverlay, 
  BookBadgeContainer,
  BookContentBlock,
} from "@/components/catalog/_components/CatalogAesthetics";
import { Button } from "@/components/ui/Button";

// Types & Utils
import { type Ebook } from "@/hooks/useEbookData";
import { formatSize } from "@/lib/utils";

interface EbookGridCardProps {
  ebook: Ebook;
  onRead: () => void;
}

/**
 * EbookGridCard - Standardized version consistent with Catalog.
 * Uses CatalogAesthetics for visual uniformity across the app.
 */
export function EbookGridCard({ ebook, onRead }: EbookGridCardProps) {
  const t = useTranslations("EbookLibrary");

  return (
    <BookCardWrapper onClick={onRead}>
      <Stack spacing="none">
        {/* Cover Section with Hover Actions */}
        <BookCoverWrapper>
          <StorageImage
            src={ebook.book?.cover_url}
            alt={ebook.book?.title || ""}
            fill
            className="group-hover:scale-110 transition-transform duration-1000 ease-out"
          />

          {/* Format Badge (PDF/EPUB) */}
          <BookBadgeContainer>
            <StatusBadge status={ebook.file_format} label={ebook.file_format.toUpperCase()} />
          </BookBadgeContainer>

          {/* Hover Actions - Consistent with Catalog style but with Ebook tools */}
          <BookHoverOverlay>
            <Box maxWidth="button-group" className="w-full px-6">
              <Stack spacing="md">
                <Button 
                  variant="glow" 
                  size="lg" 
                  rounded="xl" 
                  onClick={(e) => { e.stopPropagation(); onRead(); }}
                  className="w-full"
                >
                  <Inline spacing="sm" justify="center">
                    <Play size={16} className="fill-current" /> {t("read_now")}
                  </Inline>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  rounded="xl" 
                  className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Inline spacing="sm" justify="center">
                    <Download size={16} /> {t("download") || "Download"}
                  </Inline>
                </Button>
              </Stack>
            </Box>
          </BookHoverOverlay>
        </BookCoverWrapper>

        {/* Content Section */}
        <BookContentBlock>
          <Stack spacing="xs">
            <Heading level="h3" size="sm" lineClamp={2}>
              {ebook.book?.title}
            </Heading>
            <Text variant="muted" opacity="60">
              {ebook.book?.author?.name || t("unknown_author")}
            </Text>
          </Stack>

          {/* Size Info Row */}
          <Box paddingTop="lg" border="top" className="mt-auto">
            <Inline justify="between" align="center">
              <Inline spacing="xs" align="center">
                <FileText size={12} className="text-primary/60" />
                <Text variant="label-xs" weight="bold" tracking="tight">
                  {formatSize(ebook.file_size)}
                </Text>
              </Inline>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
            </Inline>
          </Box>
        </BookContentBlock>
      </Stack>
    </BookCardWrapper>
  );
}
