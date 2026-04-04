"use client";

import { memo, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Box } from "./Box";
import { Text } from "./Text";
import { Inline } from "./Inline";

interface AppListRowProps {
  icon?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  metadata?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  isCompact?: boolean;
}

export const AppListRow = memo(({
  icon,
  title,
  subtitle,
  metadata,
  action,
  onClick,
  active = false,
  className,
  isCompact = false
}: AppListRowProps) => (
  <Box 
    asChild={!!onClick}
    variant={active ? "list-row-active" : "list-row"}
    className={cn(!onClick && "cursor-default", className)}
    onClick={onClick}
    padding={isCompact ? "md" : "lg"}
  >
    {icon && (
      <Box variant="avatar-icon" width={isCompact ? "10" : "11"} height={isCompact ? "10" : "11"}>
        {icon}
      </Box>
    )}

    <Box flex="1" overflow="hidden">
      <Inline justify="between" align="baseline" spacing="sm">
        <Text variant="list-title" weight="bold" className={cn(active && "text-primary")}>
          {title}
        </Text>
        {metadata && (
          <Text variant="list-metadata">
            {metadata}
          </Text>
        )}
      </Inline>
      
      {(subtitle || action) && (
        <Inline justify="between" align="end" spacing="sm" className="mt-0.5">
          {subtitle && (
            <Box flex="1" overflow="hidden">
              <Text variant="list-subtitle">
                {subtitle}
              </Text>
            </Box>
          )}
          {action && (
            <Box shrink="0" className="scale-90 -mr-2 origin-right">
              {action}
            </Box>
          )}
        </Inline>
      )}
    </Box>
  </Box>
));

AppListRow.displayName = "AppListRow";
