"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Play, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Primitives
import { Card } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { Divider } from "@/components/ui/Divider";
import { Indicator } from "@/components/ui/Indicator";
import { Overlay } from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StorageImage } from "@/components/ui/StorageImage";

// Domain Helpers
import { getStatusByFormat, formatSize, type Ebook } from "@/app/[locale]/(dashboard)/(member)/ebooks/ebook-utils";

const EBOOK_UX = {
  IMAGE_HOVER_DURATION: "duration-700",
  HOVER_TRANSFORM: "group-hover:scale-105 group-hover:-translate-y-1",
  CARD_SHADOW: "hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500",
} as const;

interface EbookGridCardProps {
  ebook: Ebook;
  onRead: () => void;
}

export function EbookGridCard({ ebook, onRead }: EbookGridCardProps) {
  const t = useTranslations("EbookLibrary");

  return (
    <Card 
      variant="glow" 
      padding="none" 
      rounded="3xl" 
      border="soft" 
      className={cn("group overflow-hidden", EBOOK_UX.CARD_SHADOW)}
    >
      <Stack spacing="none">
        <Box aspect="book" overflow="hidden" position="relative">
          <StorageImage
            src={ebook.book?.cover_url}
            alt={ebook.book?.title || ""}
            fill
            loading="lazy"
            className={cn(
              "opacity-95 transition-all ease-out-back", 
              EBOOK_UX.IMAGE_HOVER_DURATION, 
              EBOOK_UX.HOVER_TRANSFORM
            )}
          />

          <Overlay variant="blur" center className="opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md">
            <Box maxWidth="button-group" className="w-full">
              <Stack spacing="md" align="stretch" className="group-hover:translate-y-0 translate-y-4 transition-transform duration-500">
                <Button variant="glow" size="lg" rounded="xl" onClick={onRead} aria-label={`${t("read_now")}: ${ebook.book?.title}`}>
                  <Inline spacing="sm" justify="center">
                    <Play size={16} className="fill-current" /> {t("read_now")}
                  </Inline>
                </Button>
                <Button variant="outline" size="lg" rounded="xl" className="bg-white/10 text-white border-white/20 hover:bg-white/20" aria-label={`Download: ${ebook.book?.title}`}>
                  <Inline spacing="sm" justify="center">
                    <Download size={16} /> {t("download") || "Download"}
                  </Inline>
                </Button>
              </Stack>
            </Box>
          </Overlay>

          <Overlay.Area position="top-right">
            <StatusBadge status={getStatusByFormat(ebook.file_format)} label={ebook.file_format} />
          </Overlay.Area>
        </Box>

        <Card padding="lg" variant="ghost">
          <Stack spacing="lg" className="min-h-[110px]">
            <Stack spacing="xs">
              <Heading size="sm" lineClamp={2} weight="bold">
                {ebook.book?.title}
              </Heading>
              <Text variant="muted" weight="medium">
                {ebook.book?.author?.name || t("unknown_author")}
              </Text>
            </Stack>

            <Stack spacing="none">
              <Divider variant="soft" />
              <div className="pt-4">
                <Inline justify="between" align="center">
                  <Inline spacing="xs" align="center">
                    <FileText size={12} className="text-primary/60" />
                    <Text variant="caption" weight="black" uppercase tracking="widest">
                      {formatSize(ebook.file_size)}
                    </Text>
                  </Inline>
                  <Indicator variant="primary" pulse />
                </Inline>
              </div>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}
