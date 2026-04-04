"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";
import { IconWrapper, IconWrapperVariant } from "@/components/ui/IconWrapper";
import { Inline } from "@/components/ui/Inline";

interface PanelSectionHeaderProps {
  icon: React.ReactNode;
  iconVariant?: IconWrapperVariant;
  title: string;
  titleVariant?: "heading" | "subheading" | "label";
  className?: string;
}

/**
 * PanelSectionHeader — Standardized icon + title header for panel sections.
 * Eliminates manual flex/gap/icon-color patterns in pages.
 */
export function PanelSectionHeader({
  icon,
  iconVariant = "primary",
  title,
  titleVariant = "subheading",
  className,
}: PanelSectionHeaderProps) {
  return (
    <Inline spacing="sm" align="center" className={className}>
      <IconWrapper variant={iconVariant} size="sm">
        {icon}
      </IconWrapper>
      <Text variant={titleVariant}>{title}</Text>
    </Inline>
  );
}
