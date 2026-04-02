"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";
import { IconWrapper, IconWrapperVariant } from "@/components/ui/IconWrapper";

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
    <div className={cn("flex items-center gap-3", className)}>
      <IconWrapper variant={iconVariant} size="sm">
        {icon}
      </IconWrapper>
      <Text variant={titleVariant}>{title}</Text>
    </div>
  );
}
