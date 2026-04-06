"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

/**
 * LEVEL 3: ESTETIKA LOKAL (RecommendationCarousel Specific)
 * Standardized wrappers to ensure "Zero ClassName" in the main UI.
 */

// 1. Root Carousel Container (The Card Wrapper)
export const RecommendationRoot = ({ children }: { children: React.ReactNode }) => (
  <Box
    background="white"
    rounded="xl"
    border="subtle"
    shadow="sm"
    overflow="hidden"
    padding="md"
    paddingBottom="xs"
  >
    {children}
  </Box>
);

// 2. Header Layout
export const RecommendationHeaderBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    display="flex"
    align="center"
    justify="between"
    marginBottom="md"
    paddingX="xs"
  >
    {children}
  </Box>
);

// 3. Horizontal Scroll Container with Snap Support
export const RecommendationScrollArea = ({ children }: { children: React.ReactNode }) => (
  <Box
    display="flex"
    gap="md"
    overflowX="auto"
    paddingBottom="md"
    paddingX="xs"
    className="snap-x scroll-smooth custom-scrollbar-h flex-nowrap"
  >
    {children}
  </Box>
);

// 4. Individual Book Item Wrapper (Handles 5-item grid and snapping)
export const RecommendationItemWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box 
    flexShrink="0"
    className="snap-start min-w-[240px] lg:min-w-[calc(20%-1.25rem)]"
  >
    {children}
  </Box>
);

// 5. Book Item Internal Layout
export const BookItemRoot = ({ children }: { children: React.ReactNode }) => (
  <Box minWidth="0" className="group cursor-pointer">
    {children}
  </Box>
);

// 6. Book Cover Aesthetic (Aspect 3/4 + Overlay)
export const BookCoverBox = ({ children, overlayText = "Read Now" }: { children: React.ReactNode, overlayText?: string }) => (
  <Box
    aspect="portrait"
    rounded="xl"
    background="surface-soft"
    overflow="hidden"
    position="relative"
    marginBottom="sm"
    border="subtle"
    className="shadow-sm group-hover:shadow-lg group-hover:border-primary/20 transition-all duration-500"
  >
    {/* The main image/placeholder */}
    <Box width="full" height="full" className="group-hover:scale-110 transition-transform duration-700">
      {children}
    </Box>

    {/* Premium Gradient Overlay */}
    <Box
      position="absolute"
      display="flex"
      align="end"
      padding="md"
      className="inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <Text
        variant="caption"
        weight="black"
        color="white"
        className="uppercase tracking-widest text-[9px]"
      >
        {overlayText}
      </Text>
    </Box>
  </Box>
);

// 7. Book Metadata Box (Title + Author)
export const BookInfoBox = ({ children }: { children: React.ReactNode }) => (
  <Box paddingX="xs">
    {children}
  </Box>
);

// 8. Book Title with truncation and hover effect
export const BookTitleText = ({ children, title }: { children: React.ReactNode, title?: string }) => (
  <Text 
    variant="body" 
    weight="black" 
    className="text-sm line-clamp-1 group-hover:text-primary transition-colors block" 
    title={title}
  >
    {children}
  </Text>
);

// 9. Book Author with truncation
export const BookAuthorText = ({ children, title }: { children: React.ReactNode, title?: string }) => (
  <Text 
    variant="caption" 
    weight="bold" 
    opacity="60" 
    className="mt-0.5 line-clamp-1 block" 
    title={title}
  >
    {children}
  </Text>
);

// 10. Loading/Skeleton State Wrapper
export const RecommendationSkeletonItem = ({ children }: { children: React.ReactNode }) => (
  <RecommendationItemWrapper>
    {children}
  </RecommendationItemWrapper>
);

// 11. Empty State Box
export const RecommendationEmptyState = ({ children }: { children: React.ReactNode }) => (
  <Box
    width="full"
    display="flex"
    align="center"
    justify="center"
    padding="xl"
    rounded="xl"
    border="dashed"
    className="min-h-[200px] opacity-60"
  >
    {children}
  </Box>
);
