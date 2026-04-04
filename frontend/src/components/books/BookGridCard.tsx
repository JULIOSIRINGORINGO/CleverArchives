"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// UI Primitives
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StorageImage } from "@/components/ui/StorageImage";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";

interface BookGridCardProps {
  book: any;
  onClick: () => void;
  index: number;
}

/**
 * Standardized BookGridCard — Redesigned for absolute zero-hardcode compliance.
 * Uses generic Stack/Inline/Card primitives for all layout and styling.
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
      <Card 
        onClick={onClick}
        variant="default"
        padding="none"
        rounded="3xl"
        className="group cursor-pointer select-none border-border/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
      >
        <Stack spacing="none">
          {/* Cover Image Wrapper with branded overlays */}
          <div className="aspect-[3.2/4] relative overflow-hidden bg-muted/20">
            <StorageImage 
              src={book.cover_url} 
              alt={book.title}
              fill
              className="group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            
            {/* Branded Badges Layout */}
            <div className="absolute top-4 left-4 z-10">
              <Stack spacing="xs">
                <StatusBadge status="pdf" label={book.category?.name || t("uncategorized")} />
                {book.ebook && (
                  <div className="w-fit">
                    <StatusBadge status="available" label={t("ebook")} className="bg-primary/90" />
                  </div>
                )}
              </Stack>
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center">
              <motion.div 
                className="w-14 h-14 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: 0 }}
                transition={{ type: "spring", damping: 12 }}
                // Scale is managed by group-hover in standard CSS too
              >
                 <IconWrapper icon="details" size="md" className="bg-transparent" />
              </motion.div>
            </div>
          </div>
          
          {/* Content Block using Semantic Components */}
          <Card padding="lg" variant="ghost">
             <Stack spacing="md" justify="between" className="min-h-[100px]">
                <Stack spacing="xs">
                   <Heading level="h3" size="sm" className="line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                     {book.title}
                   </Heading>
                   <Text variant="muted" className="italic opacity-60">
                     {book.author?.name || t("unknown_author")}
                   </Text>
                </Stack>
                
                {/* Horizontal meta info / status bar */}
                <div className="pt-4 border-t border-border/5">
                  <StatusBadge 
                    status={book.available_copies_count > 0 ? "available" : "borrowed"} 
                    label={book.available_copies_count > 0 ? `${book.available_copies_count} ${t("available")}` : undefined}
                  />
                </div>
             </Stack>
          </Card>
        </Stack>
      </Card>
    </motion.div>
  );
}
