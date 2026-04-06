"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

/**
 * LEVEL 3: ESTETIKA LOKAL (SegmentedControl Specific)
 * Standardized wrappers to ensure "Zero ClassName" in the main UI.
 * Inspired by the premium "Floating White" look of FilterTabs.
 */

// 1. Root Pill Container with soft porcelain background
export const SegmentRoot = ({ children, fullWidth }: { children: React.ReactNode, fullWidth?: boolean }) => (
  <Box
    display={fullWidth ? "flex" : "inline-flex"}
    width={fullWidth ? "full" : undefined}
    align="center"
    background="surface-soft"
    rounded="full"
    padding="xs"
    border="subtle"
    className="bg-slate-100/80 shadow-inner"
  >
    {children}
  </Box>
);

// 2. Individual Segment Toggle with Floating Effect
export const SegmentButton = ({ 
  children, 
  isActive, 
  onClick 
}: { 
  children: React.ReactNode, 
  isActive: boolean,
  onClick: () => void
}) => {
  const isLabel = typeof children === "string";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-4 py-1.5 rounded-full transition-all duration-500 whitespace-nowrap overflow-hidden group flex items-center justify-center min-w-[36px]",
        isActive 
          ? "bg-primary text-white shadow-lg shadow-primary/30 ring-1 ring-primary/20" 
          : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
      )}
    >
      {isLabel ? (
        <Text
          variant="caption"
          weight={isActive ? "black" : "bold"}
          className={cn(
            "text-[11px] tracking-wide relative z-10 transition-colors uppercase",
            isActive ? "text-white" : "text-inherit"
          )}
        >
          {children}
        </Text>
      ) : (
        <div className={cn(
          "relative z-10 transition-all duration-300",
          isActive ? "scale-110 text-white" : "text-inherit hover:scale-110"
        )}>
          {children}
        </div>
      )}
      
      {/* Subtle hover glow effect */}
      {!isActive && (
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
};
