"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { Box } from "./Box";
import { Inline } from "./Inline";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  label: string;
  className?: string;
}

/**
 * CategoryBadge - Level 1 UI Component for standardized Metadata tagging.
 * Specifically designed for Categories (Books, Assets, etc.)
 */
export function CategoryBadge({ label, className }: CategoryBadgeProps) {
  return (
    <Box 
      background="primary" 
      rounded="full"
      className={cn(
        "inline-flex items-center h-7 px-4 shadow-lg shadow-primary/20 border border-white/10 shrink-0",
        className
      )}
    >
      <Inline spacing="xs" align="center">
        <Bookmark size={11} strokeWidth={2.5} className="text-white" />
        <Text 
          variant="label-xs" 
          className="text-white leading-none shadow-sm"
        >
          {label}
        </Text>
      </Inline>
    </Box>
  );
}
