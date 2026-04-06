"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

/**
 * LEVEL 3: ESTETIKA LOKAL (WelcomeHeader Specific)
 * Standardized wrappers to ensure "Zero ClassName" in the main UI.
 */

// 1. Root Container for the whole greeting
export const WelcomeContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    as="span"
    display="flex"
    align="center"
    gap="sm"
    className="select-none"
  >
    {children}
  </Box>
);

// 2. The "Welcome Back" cursive part
export const GreetingText = ({ children }: { children: React.ReactNode }) => (
  <Text
    as="span"
    variant="heading"
    weight="black"
    className="font-cursive text-[2.5rem] leading-tight text-primary drop-shadow-sm lowercase pr-1"
  >
    {children}
  </Text>
);

// 3. The User's Name cursive part
export const UserNameText = ({ children }: { children: React.ReactNode }) => (
  <Text
    as="span"
    variant="heading"
    weight="black"
    className="font-cursive text-[2.5rem] leading-tight text-slate-800 drop-shadow-sm"
  >
    {children}
  </Text>
);
