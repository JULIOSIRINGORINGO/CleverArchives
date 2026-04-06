"use client";

import { ReactNode, memo } from "react";
import { cn } from "@/lib/utils";
import { DESIGN } from "@/config/design-system";
import { Box, BoxProps } from "./Box";

interface LayoutProps extends BoxProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageBody - Standardized container for dashboard content areas.
 * Automatically applies DESIGN.SPACE.PAGE_PAD and DESIGN.SPACE.PANEL_GAP.
 */
export const PageBody = memo(({ 
  children, className, ...props 
}: LayoutProps) => (
  <Box 
    flex="1"
    display="flex"
    direction="col"
    mdDirection="row"
    height="full"
    overflow="hidden"
    background="surface-soft"
    className={cn(
      DESIGN.SPACE.PAGE_PAD,
      DESIGN.SPACE.PANEL_GAP,
      className
    )}
    {...props}
  >
    {children}
  </Box>
));

/**
 * SidebarArea - Standardized sidebar container.
 * Automatically applies DESIGN.LAYOUT.SIDEBAR tokens.
 */
export const SidebarArea = memo(({ 
  children, className, isHidden, ...props 
}: LayoutProps & { isHidden?: boolean }) => (
  <Box 
    display="flex"
    direction="col"
    className={cn(
      DESIGN.LAYOUT.SIDEBAR,
      "gap-4 transition-all duration-300",
      isHidden ? "hidden md:flex" : "flex",
      className
    )}
    {...props}
  >
    {children}
  </Box>
));

/**
 * MainArea - Standardized main content container.
 * Automatically applies DESIGN.LAYOUT.MAIN tokens.
 */
export const MainArea = memo(({ 
  children, className, isHidden, ...props 
}: LayoutProps & { isHidden?: boolean }) => (
  <Box 
    display="flex"
    direction="col"
    className={cn(
      DESIGN.LAYOUT.MAIN, 
      isHidden ? "hidden md:flex" : "flex",
      className
    )}
    {...props}
  >
    {children}
  </Box>
));

PageBody.displayName = "PageBody";
SidebarArea.displayName = "SidebarArea";
MainArea.displayName = "MainArea";
