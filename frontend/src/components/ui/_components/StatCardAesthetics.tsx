"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * LEVEL 2 & 3: ESTETIKA DASBOR (Feature Specific)
 * Standardized wrappers to ensure "Zero ClassName" in Dashboard components.
 */

export type StatCardVariant = "blue" | "emerald" | "amber" | "red" | "purple" | "indigo";

const variantGradients: Record<StatCardVariant, string> = {
  blue:    "from-blue-600 to-blue-400 shadow-blue-500/20",
  emerald: "from-emerald-600 to-emerald-400 shadow-emerald-500/20",
  amber:   "from-amber-600 to-orange-400 shadow-amber-500/20",
  red:     "from-red-600 to-rose-400 shadow-red-500/20",
  purple:  "from-purple-600 to-purple-400 shadow-purple-500/20",
  indigo:  "from-indigo-600 to-indigo-400 shadow-indigo-500/20",
};

// 1. Root Card Wrapper with Premium Glass & Gradient
export const StatCardRoot = ({ variant, children }: { variant: StatCardVariant; children: React.ReactNode }) => (
  <Box
    position="relative"
    overflow="hidden"
    rounded="xl"
    display="flex"
    direction="col"
    height="full"
    minHeight="60"
    className={cn(
      "group bg-gradient-to-br text-white transition-all duration-500 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 border border-white/10 active:scale-[0.98]",
      variantGradients[variant]
    )}
  >
    {/* Subtle Inner Glow */}
    <Box 
      position="absolute" 
      className="inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
    />
    {children}
  </Box>
);

// 2. Icon Container with Glassmorphism
export const StatIconBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    width="10"
    height="10"
    rounded="xl"
    display="flex"
    align="center"
    justify="center"
    background="surface"
    border="subtle"
    className="bg-white/20 border-white/10 text-white backdrop-blur-md shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
  >
    {children}
  </Box>
);

// 3. Progress Bar Track
export const ProgressBarRoot = ({ children }: { children: React.ReactNode }) => (
  <Box
    height="2"
    width="full"
    rounded="full"
    overflow="hidden"
    className="bg-white/15 border border-white/5 backdrop-blur-sm"
  >
    {children}
  </Box>
);

// 4. Progress Bar Fill with Motion Support
export const ProgressBarIndicator = ({ progress }: { progress: number }) => (
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${Math.min(progress, 100)}%` }}
    transition={{ duration: 1.2, ease: "circOut" }}
    className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] rounded-full"
  />
);

// 5. Aesthetic Typography Wrappers
export const StatLabel = ({ children }: { children: React.ReactNode }) => (
  <Box paddingBottom="xs">
    <Box as="span" className="text-white/60 font-black text-[10px] uppercase tracking-[0.15em] block">
      {children}
    </Box>
  </Box>
);

export const StatTrend = ({ children, active = false }: { children: React.ReactNode; active?: boolean }) => (
  <Box display="flex" align="center" gap="sm">
    {active && <Box className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse shadow-[0_0_4px_rgba(255,255,255,0.8)]" />}
    <Box as="span" className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
      {children}
    </Box>
  </Box>
);
