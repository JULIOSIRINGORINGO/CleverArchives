"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Button } from "@/components/ui/Button";

/**
 * CatalogAesthetics — Level 2 Wrapper Components
 * Strictly following SOP 5.6.0 (Zero ClassName in Logic Tier).
 * This file centralizes all visual complexity for the Catalog feature.
 */

interface WrapperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  children: React.ReactNode;
  color?: "default" | "muted" | "primary" | "white" | "danger" | "black";
}

/**
 * Enhanced Card for Book Display
 */
export const BookCardWrapper = ({ children, className, ...props }: WrapperProps) => (
  <Card
    background="white"
    padding="none"
    rounded="3xl"
    className={cn(
      "group cursor-pointer select-none border-border/5 hover:border-primary/20",
      "hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98] transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </Card>
);

/**
 * Fixed aspect ratio container for Book Covers
 */
export const BookCoverWrapper = ({ children, className, ...props }: WrapperProps) => (
  <Box
    aspect="book"
    position="relative"
    overflow="hidden"
    background="muted-soft"
    className={className}
    {...props}
  >
    {children}
  </Box>
);

/**
 * Overlay for Hover actions on covers
 */
export const BookHoverOverlay = ({ children, className, ...props }: WrapperProps) => (
  <Box
    position="absolute"
    display="flex"
    align="center"
    justify="center"
    zIndex="20"
    className={cn(
      "inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-700",
      className
    )}
    {...props}
  >
    {children}
  </Box>
);

/**
 * Branded Badge Container
 */
export const BookBadgeContainer = ({ children, className, ...props }: WrapperProps) => (
  <Box
    position="absolute"
    zIndex="10"
    className={cn(
      "top-4 left-4",
      className
    )}
    {...props}
  >
    {children}
  </Box>
);

/**
 * Standardized Book Content Block
 */
export const BookContentBlock = ({ children, className, ...props }: WrapperProps) => (
  <Card
    padding="lg"
    variant="none"
    background="transparent"
    border="none"
    className={cn("w-full", className)}
    {...props}
  >
    <Stack spacing="md" justify="between" className="min-h-[100px]">
      {children}
    </Stack>
  </Card>
);

/**
 * Standard trigger for the Hover Action in Catalog
 */
export const BookHoverAction = ({ onClick }: { onClick?: (e: React.MouseEvent) => void }) => (
  <Button
    variant="floating"
    size="none"
    rounded="full"
    onClick={(e) => {
      e.stopPropagation();
      onClick?.(e);
    }}
    className="w-14 h-14 flex items-center justify-center"
  >
    <ArrowUpRight size={24} strokeWidth={3} />
  </Button>
);

/**
 * Branded Gradient Button for Catalog actions
 */
export const CatalogActionButton = ({ children, className, ...props }: any) => (
  <Button 
    size="sm" 
    variant="primary"
    rounded="full"
    className={cn("flex items-center gap-2 px-5 h-9 font-semibold shadow-lg shadow-primary/20", className)}
    {...props}
  >
    <Inline spacing="xs" align="center">
      {children}
      <ArrowUpRight size={14} strokeWidth={2.5} className="ml-0.5" />
    </Inline>
  </Button>
);
