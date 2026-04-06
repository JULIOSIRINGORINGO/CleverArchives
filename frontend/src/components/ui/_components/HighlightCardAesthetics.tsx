"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

/**
 * LEVEL 3: ESTETIKA LOKAL (HighlightCard Specific)
 * Standardized wrappers to ensure "Zero ClassName" in the main UI.
 */

type HighlightVariant = "primary" | "secondary" | "success" | "warning";

const variantGradients: Record<HighlightVariant, string> = {
  primary: "bg-gradient-to-br from-primary to-blue-600",
  secondary: "bg-gradient-to-br from-slate-800 to-slate-900",
  success: "bg-gradient-to-br from-emerald-600 to-teal-500",
  warning: "bg-gradient-to-br from-amber-500 to-orange-400",
};

// 1. Root Highlight Card with gradient and decorative elements
export const HighlightCardRoot = ({ 
  children, 
  variant = "primary" 
}: { 
  children: React.ReactNode;
  variant?: HighlightVariant;
}) => (
  <Box
    rounded="xl"
    padding="lg"
    position="relative"
    overflow="hidden"
    display="flex"
    direction="col"
    justify="end"
    minHeight="full"
    height="full"
    className={cn(
      "min-h-[300px] border border-white/10 shadow-lg",
      variantGradients[variant]
    )}
  >
    {/* Decorative Premium Blur Element */}
    <Box
      position="absolute"
      width="40"
      height="40"
      background="white"
      rounded="full"
      opacity="10"
      className="top-0 right-0 blur-3xl -translate-y-1/2 translate-x-1/2"
    />
    
    <Box position="relative" zIndex="10">
      {children}
    </Box>
  </Box>
);

// 2. Premium Glassmorphism Icon Wrapper
export const HighlightIconBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    width="10"
    height="10"
    rounded="lg"
    border="subtle"
    display="flex"
    align="center"
    justify="center"
    marginBottom="md"
    className="bg-white/20 backdrop-blur-md border-white/20 text-white"
  >
    {children}
  </Box>
);

// 3. High-impact Title
export const HighlightTitle = ({ children }: { children: React.ReactNode }) => (
  <Box marginBottom="xs">
    <Text
      variant="heading"
      weight="black"
      color="white"
      className="text-2xl leading-tight tracking-tight block"
    >
      {children}
    </Text>
  </Box>
);

// 4. Readable Description with opacity
export const HighlightDescription = ({ children }: { children: React.ReactNode }) => (
  <Box marginBottom="lg" maxWidth="sm">
    <Text
      variant="body"
      weight="black"
      className="text-xs text-white/80 leading-relaxed block"
    >
      {children}
    </Text>
  </Box>
);

// 5. Specialized Button Wrapper for Dark Gradients
export const HighlightActionBtn = ({ 
  label, 
  onClick 
}: { 
  label: string;
  onClick?: () => void;
}) => (
  <Box width="full" height="11">
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full bg-white text-primary rounded-xl",
        "font-black text-sm shadow-sm transition-all duration-300",
        "hover:bg-white/90 active:scale-[0.98] border-none"
      )}
    >
      {label}
    </button>
  </Box>
);
