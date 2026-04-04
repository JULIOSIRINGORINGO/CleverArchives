"use client";

import { useTranslations, useLocale } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { SplitPanelLayout } from "@/components/layout/SplitPanelLayout";

// UI Components & Logic from Domain Layer
import {
  BookModalIdentity,
  BookInfoGrid,
  SynopsisSection,
  ModalHeader,
  ModalContent,
  ModalFooter,
  type Book,
  getBookStatus
} from "./BookModalUI";

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}


export default function BookDetailModal({ book, isOpen, onClose }: BookDetailModalProps) {
  const t = useTranslations("Catalog");
  const locale = useLocale();

  if (!book || !isOpen) return null;

  // Domain Logic extracted to Helper
  const status = getBookStatus(book, t);
  const authorName = book.author?.name || t("unknown_author");
  const categoryName = book.category?.name || t("uncategorized");
  const synopsis = book.description || t("no_description");

  return (
    <Modal variant="xl" isOpen={isOpen} onClose={onClose}>
      <SplitPanelLayout>

        {/* Left: Branding & Identity */}
        <SplitPanelLayout.Left>
          <BookModalIdentity
            coverUrl={book.cover_url}
            title={book.title}
            author={authorName}
            category={categoryName}
            status={status.variant}
            statusLabel={status.label}
            onClose={onClose}
          />
        </SplitPanelLayout.Left>

        {/* Right: Detailed Metadata & Actions */}
        <SplitPanelLayout.Right>
          <ModalHeader onClose={onClose} />

          <ModalContent>
            {/* The Smart Component handles internal mapping logic */}
            <BookInfoGrid book={book} />

            <SynopsisSection title={t("synopsis")}>
              {synopsis}
            </SynopsisSection>
          </ModalContent>

          <ModalFooter
            primaryAction={{
              label: t("details"),
              href: `/${locale}/catalog/${book.id}/copies`,
              iconName: "details",
              onClick: onClose
            }}
            secondaryAction={{
              label: t("close"),
              onClick: onClose
            }}
          />
        </SplitPanelLayout.Right>

      </SplitPanelLayout>
    </Modal>
  );
}
