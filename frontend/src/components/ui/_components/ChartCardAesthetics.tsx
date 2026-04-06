"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

/**
 * LEVEL 3: ESTETIKA LOKAL (ChartCard Specific)
 * Standardized wrappers to ensure "Zero ClassName" in the main UI.
 */

// 1. Root Card Container with consistent shadow and rounded corners
export const ChartCardRoot = ({ children }: { children: React.ReactNode }) => (
  <Box
    rounded="xl"
    border="subtle"
    shadow="sm"
    overflow="hidden"
    background="white"
    height="full"
    display="flex"
    direction="col"
  >
    {children}
  </Box>
);

// 2. Responsive Header Box for Title and Segmented Control
export const ChartHeaderBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    padding="md"
    paddingBottom="none"
    display="flex"
    direction="col"
    mdDirection="row"
    align="start"
    mdAlign="center"
    justify="between"
    gap="md"
  >
    {children}
  </Box>
);

// 3. Subtitle for context
export const ChartSubtitle = ({ children }: { children: React.ReactNode }) => (
  <Box paddingLeft="lg" paddingTop="xs">
    <Text
      variant="caption"
      weight="bold"
      color="muted"
      className="text-[10px] tracking-wide block"
    >
      {children}
    </Text>
  </Box>
);

// 4. Main Body wrapper with fixed height stability
export const ChartBodyBox = ({ children }: { children: React.ReactNode }) => (
  <Box padding="md" paddingTop="xl" flex="1" width="full">
    <Box height="56" width="full" className="md:h-[220px]">
      {children}
    </Box>
  </Box>
);

// 5. Premium Tooltip Glassmorphism
export const ChartTooltipRoot = ({ children }: { children: React.ReactNode }) => (
  <Box
    background="white"
    border="subtle"
    shadow="xl"
    padding="sm"
    rounded="xl"
    display="flex"
    align="center"
    gap="sm"
    className="backdrop-blur-md bg-white/80"
  >
    {children}
  </Box>
);

// 6. v5.6.0 Signature Gradient Definition
export const ChartGradientDef = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
      <stop offset="50%" stopColor="#2563EB" stopOpacity={0.1} />
      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
    </linearGradient>
  </defs>
);
