"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Play, Download, FileText } from "lucide-react";

// UI Components
import { BookListCard } from "@/components/books/BookListCard";
import { Inline } from "@/components/ui/Inline";
import { Button } from "@/components/ui/Button";

// Domain Helpers
import { formatSize, type Ebook } from "@/app/[locale]/(dashboard)/(member)/ebooks/ebook-utils";

interface EbookListRowProps {
  ebook: Ebook;
  onRead: () => void;
}

export function EbookListRow({ ebook, onRead }: EbookListRowProps) {
  const t = useTranslations("EbookLibrary");

  return (
    <BookListCard
      coverUrl={ebook.book?.cover_url}
      title={ebook.book?.title || ""}
      author={ebook.book?.author?.name || t("unknown_author")}
      status={ebook.file_format}
      metadata={[{ label: t("size"), value: formatSize(ebook.file_size), icon: FileText }]}
      action={
        <Inline spacing="sm">
          <Button variant="glow" size="sm" rounded="lg" onClick={onRead} aria-label={t("read_now")}>
            <Inline spacing="xs"><Play size={12} className="fill-current" /> {t("read") || "Read"}</Inline>
          </Button>
          <Button variant="outline" size="sm" rounded="lg" className="w-9 p-0" aria-label="Download ebook">
            <Download size={12} />
          </Button>
        </Inline>
      }
    />
  );
}
