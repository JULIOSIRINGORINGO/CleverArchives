"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

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
  className?: string;
}

/**
 * RecommendationCarousel — Horizontal scrolling book carousel.
 * Handles loading, empty, and populated states.
 * Uses PanelSectionHeader from design system.
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
  className,
}: RecommendationCarouselProps) {
  const t = useTranslations("Dashboard");

  return (
    <Card className={cn("rounded-xl border border-border shadow-sm overflow-hidden bg-white", className)}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <PanelSectionHeader icon={<Sparkles size={16} />} title={title} />
          {viewAllHref && (
            <Link href={viewAllHref}>
              <Button variant="primary" size="sm" className="rounded-lg h-9 text-xs font-bold shadow-sm">
                {viewAllLabel} <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="flex gap-5 overflow-x-auto pb-4 pt-2 snap-x custom-scrollbar-h px-0.5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[220px] lg:min-w-[calc(16.66%-1.25rem)] flex-shrink-0 snap-start">
                <Skeleton className="aspect-[3/4] rounded-xl mb-3" />
                <Skeleton className="h-5 w-3/4 mb-1.5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : books.length > 0 ? (
            books.map((book) => (
              <Link 
                href={`${localePrefix}/catalog/${book.id}`} 
                key={book.id} 
                className="min-w-[220px] lg:min-w-[calc(16.66%-1.25rem)] flex-shrink-0 snap-start"
              >
                <div className="group cursor-pointer">
                  <div className="aspect-[3/4] rounded-xl bg-muted overflow-hidden relative mb-3 shadow-sm border border-border/50 group-hover:shadow-lg group-hover:border-primary/20 transition-all duration-300">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/10 group-hover:scale-110 transition-transform duration-700">
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                       <span className="text-white text-[10px] font-bold tracking-wider uppercase">{t("read_now", { fallback: "Read Now" })}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors px-1" title={book.title}>
                    {book.title}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5 line-clamp-1 px-1 opacity-80" title={book.author?.name || unknownAuthorLabel}>
                    {book.author?.name || unknownAuthorLabel}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex w-full items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground">
              <p className="font-bold text-sm flex items-center gap-2">
                <BookOpen size={16} />
                {emptyLabel}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
