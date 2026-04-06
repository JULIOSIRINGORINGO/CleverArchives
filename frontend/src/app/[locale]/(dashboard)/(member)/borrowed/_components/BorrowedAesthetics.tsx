"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Inline } from "@/components/ui/Inline";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { IconWrapper, AppIconName } from "@/components/ui/IconWrapper";
import { cn } from "@/lib/utils";

/**
 * LEVEL 3: ESTETIKA LOKAL (ISOLATION)
 * Segregates visual complex components to keep the main page logic "Zero ClassName".
 * Strictly following Section IV (Prop-Driven Layout).
 */

export const BorrowedGrid = ({ children }: { children: React.ReactNode }) => (
  // Using Pure Layout Props instead of raw className for vertical spacing
  <Box padding="none" className="pb-16 pt-0">
    {children}
  </Box>
);

export const BorrowedGroupHeader = ({ label, id, icon = "layers" }: { label: string; id: string; icon?: AppIconName }) => (
  <Inline align="center" spacing="sm" className="px-2 opacity-60 mb-1">
    <IconWrapper icon={icon} size="xs" isGhost color="primary" />
    <Text 
      variant="label-xs" 
      italic 
      tracking="widest" 
      className="text-muted-foreground font-black uppercase"
    >
      {label} (#{id})
    </Text>
    <Box flex="1" className="h-[1px] bg-gradient-to-r from-border/50 to-transparent" />
  </Inline>
);

export const BorrowedActionBtn = ({ 
  onClick, 
  label, 
  isLoading,
  icon = "loader"
}: { 
  onClick: () => void; 
  label: string; 
  isLoading?: boolean;
  icon?: AppIconName;
}) => (
  <Button
    size="sm"
    variant="outline"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    disabled={isLoading}
    className={cn(
      "rounded-2xl font-black gap-3 h-10 px-6 active:scale-95 transition-all text-[11px] border-none shadow-sm",
      "bg-muted/30 hover:bg-primary-soft hover:text-primary"
    )}
  >
    <IconWrapper icon={isLoading ? "loader" : icon as any} size="xs" isGhost color="primary" />
    {label}
  </Button>
);

export const GroupWrapper = ({ children }: { children: React.ReactNode }) => (
  <Stack spacing="none">
    {children}
  </Stack>
);
