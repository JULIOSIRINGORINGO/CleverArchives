"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { IconWrapper, AppIconName } from "@/components/ui/IconWrapper";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { StorageImage } from "@/components/ui/StorageImage";
import { Overlay } from "@/components/ui/Overlay";
import Link from "next/link";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";

export interface BookAuthor {
  name: string;
}

export interface BookCategory {
  name: string;
}

export interface BookShelf {
  name: string;
}

export interface Book {
  id: number;
  title: string;
  cover_url?: string;
  description?: string;
  published_year?: string;
  isbn?: string;
  publisher?: string;
  available_copies_count: number;
  author?: BookAuthor;
  category?: BookCategory;
  shelf?: BookShelf;
}

export type BookStatusVariant = 'available' | 'borrowed' | 'pdf';

export interface ActionConfig {
  label: string;
  onClick?: () => void;
  href?: string;
  iconName?: AppIconName; 
}

const DEFAULT_METADATA = {
  shelf: "A-12",
  publisher: "Stellar Press",
  isbn: "N/A",
  year: "N/A"
} as const;

export const MODAL_ANIMATIONS: Record<string, Variants> = {
  itemEntrance: {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.06, ease: "easeOut" }
    })
  },
  titleEntrance: {
    hidden: { opacity: 0, x: -24 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "circOut" } 
    }
  }
};

export function getBookStatus(book: Book, t: (key: string) => string) {
  const isAvailable = book.available_copies_count > 0;
  return {
    variant: (isAvailable ? 'available' : 'borrowed') as BookStatusVariant,
    label: isAvailable 
      ? `${book.available_copies_count} ${t("available")}` 
      : t("borrowed")
  };
}

export const SectionMarker = () => (
  <Card variant="default" padding="none" rounded="none" className="w-1 h-4 bg-primary shrink-0 border-none" />
);

export function BookInfoGrid({ book }: { book: Book }) {
  const t = useTranslations("Catalog");

  const items: Array<{ label: string, value: string, icon: AppIconName }> = [
    { label: t("shelf"), value: book.shelf?.name || DEFAULT_METADATA.shelf, icon: "shelf" },
    { label: t("year"), value: book.published_year || DEFAULT_METADATA.year, icon: "year" },
    { label: t("publisher"), value: book.publisher || DEFAULT_METADATA.publisher, icon: "publisher" },
    { label: "ISBN", value: book.isbn || DEFAULT_METADATA.isbn, icon: "isbn" },
  ];

  return (
    <DashboardSection layout="modal-grid">
      {items.map((item, idx) => (
        <BookDetailItem 
          key={item.label}
          index={idx}
          label={item.label}
          value={item.value}
          iconName={item.icon}
        />
      ))}
    </DashboardSection>
  );
}

export function BookDetailItem({ label, value, iconName, index }: { 
  label: string, 
  value: string, 
  iconName: AppIconName, 
  index: number 
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={MODAL_ANIMATIONS.itemEntrance}
    >
      <Card variant="soft" padding="md" rounded="2xl" className="group h-full cursor-default select-none transition-shadow hover:shadow-lg hover:shadow-primary/5">
        <Stack spacing="sm">
           <IconWrapper 
              icon={iconName} 
              variant="primary" 
              size="md" 
              className="group-hover:scale-110 transition-transform duration-500" 
           />
           <Stack spacing="xs">
              <Text variant="label" className="opacity-70">{label}</Text>
              <Text variant="body" className="truncate tracking-tight font-semibold">{value}</Text>
           </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
}

export function SynopsisSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Stack spacing="md" asChild>
      <section aria-labelledby="synopsis-title">
        <Inline spacing="sm" align="center" className="ml-1">
          <SectionMarker />
          <Heading level="h4" size="xs" id="synopsis-title">{title}</Heading>
        </Inline>
        <Card variant="dashed" padding="lg" rounded="2xl">
          <Text variant="muted" className="italic leading-relaxed">
            {children}
          </Text>
        </Card>
      </section>
    </Stack>
  );
}

export function BookModalIdentity({ 
  coverUrl, title, author, category, status, statusLabel, onClose 
}: {
  coverUrl?: string, 
  title: string, 
  author: string, 
  category: string, 
  status: BookStatusVariant, 
  statusLabel: string, 
  onClose?: () => void
}) {
  return (
    <section className="relative w-full h-full group overflow-hidden" role="region" aria-label={title}>
      <StorageImage 
        src={coverUrl} 
        alt={title} 
        className="transition-transform duration-[2000ms] group-hover:scale-105" 
      />
      
      <Overlay variant="gradient" />
      
      <Overlay className="p-8">
        <Stack justify="between" className="h-full">
           <Inline justify="between" align="start">
              <StatusBadge status="pdf" label={category} />
              
              {onClose && (
                <Button 
                  onClick={onClose} 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 md:hidden active:scale-95 transition-all"
                  aria-label="Close modal"
                >
                  <IconWrapper icon="close" size="xs" variant="muted" className="bg-transparent" />
                </Button>
              )}
           </Inline>
           
           <Stack spacing="md">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={MODAL_ANIMATIONS.titleEntrance}
              >
                 <Heading level="h2" size="3xl" inverted className="drop-shadow-sm">{title}</Heading>
                 <Text variant="body" className="text-white/60 font-semibold mt-1">{author}</Text>
              </motion.div>
              
              <StatusBadge 
                status={status} 
                label={statusLabel} 
                className="w-fit shadow-xl"
              />
           </Stack>
        </Stack>
      </Overlay>
    </section>
  );
}

export const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute top-6 right-6 z-20 hidden md:block">
    <Button 
      onClick={onClose} 
      variant="secondary" 
      size="icon" 
      rounded="xl" 
      className="active:scale-90 transition-all hover:shadow-lg"
      aria-label="Close details"
    >
      <IconWrapper icon="close" size="sm" variant="muted" className="bg-transparent" />
    </Button>
  </div>
);

export const ModalContent = ({ children }: { children: React.ReactNode }) => (
  <WorkspacePanelContent className="p-6 md:p-12 scrollbar-none">
    <DashboardSection layout="full" spaced>
      {children}
    </DashboardSection>
  </WorkspacePanelContent>
);

const FinalActionButton = ({ action, variant = "primary" }: { action: ActionConfig, variant?: "primary" | "ghost" }) => {
  const content = (
    <Button 
      size="lg" 
      variant={variant} 
      rounded="2xl" 
      onClick={action.onClick}
      className={cn(
        "w-full group transition-all duration-300", 
        variant === "primary" && "shadow-2xl shadow-primary/20 hover:shadow-primary/40", 
        action.href && "w-full"
      )}
    >
      <Inline spacing="sm" align="center" justify="center" className="w-full">
        <Text variant="body" className={cn("font-bold", variant === "primary" ? "text-white" : "text-muted-foreground")}>
          {action.label}
        </Text>
        {action.iconName && (
          <IconWrapper 
            icon={action.iconName} 
            size="sm" 
            className="bg-transparent text-current group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" 
          />
        )}
      </Inline>
    </Button>
  );

  if (action.href) {
    return <Link href={action.href} className="w-full block h-full focus-none" onClick={action.onClick}>{content}</Link>;
  }

  return content;
};

export const ModalFooter = ({ primaryAction, secondaryAction }: { primaryAction?: ActionConfig, secondaryAction?: ActionConfig }) => (
  <WorkspacePanelFooter showDivider={false} className="border-t border-border/5 pt-0">
    <Inline spacing="md" align="center" className="w-full">
      {secondaryAction && (
        <div className="w-full sm:w-auto px-10">
           <FinalActionButton action={secondaryAction} variant="ghost" />
        </div>
      )}
      
      {primaryAction && (
        <div className="flex-1 w-full">
           <FinalActionButton action={primaryAction} variant="primary" />
        </div>
      )}
    </Inline>
  </WorkspacePanelFooter>
);
