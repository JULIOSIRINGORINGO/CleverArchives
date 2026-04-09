"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";
import { Box } from "@/components/ui/Box";
import { Heading } from "@/components/ui/Heading";
import { IconWrapper, IconWrapperVariant, AppIconName } from "@/components/ui/IconWrapper";
import { Inline } from "@/components/ui/Inline";

interface PanelSectionHeaderProps {
  icon: AppIconName | React.ReactNode;
  iconVariant?: IconWrapperVariant;
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * PanelSectionHeader — Standardized icon + title header for panel sections.
 * Optimized to handle both raw nodes and ICON_REGISTRY keys.
 * Corrected to use Heading level h4 to match Cart module aesthetics.
 */
export function PanelSectionHeader({
  icon,
  iconVariant = "avatar",
  title,
  subtitle,
  className,
}: PanelSectionHeaderProps) {
  return (
    <Box className={cn("flex flex-col gap-1.5", className)}>
      <Inline spacing="sm" align="center">
        {typeof icon === 'string' ? (
          <IconWrapper variant={iconVariant} icon={icon as AppIconName} />
        ) : (
          <IconWrapper variant={iconVariant}>
            {icon}
          </IconWrapper>
        )}
        <Heading level="h4" weight="bold">
          {title}
        </Heading>
      </Inline>
      {subtitle && (
        <Text variant="caption-muted" className="ml-0.5">
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
