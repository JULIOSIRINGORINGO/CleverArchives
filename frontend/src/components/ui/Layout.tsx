"use client";

import { ReactNode, memo } from "react";
import { cn } from "@/lib/utils";
import { DESIGN } from "@/config/design-system";

import { BoxProps, backgrounds, borders, roundings, shadows, paddings, flexMap, shrinkMap, widths } from "./Box";

interface LayoutProps extends BoxProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageBody - Standardized container for dashboard content areas.
 * Automatically applies DESIGN.SPACE.PAGE_PAD and DESIGN.SPACE.PANEL_GAP.
 */
export const PageBody = memo(({ 
  children, className, flex, shrink, background, border, rounded, shadow, padding, maxWidth, overflow, position, ...props 
}: LayoutProps) => (
  <div 
    className={cn(
      "flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50/50",
      DESIGN.SPACE.PAGE_PAD,
      DESIGN.SPACE.PANEL_GAP,
      flex && flexMap[flex],
      shrink && shrinkMap[shrink],
      background && backgrounds[background],
      border && borders[border],
      rounded && roundings[rounded],
      shadow && shadows[shadow],
      padding && paddings[padding],
      maxWidth && widths[maxWidth],
      overflow === "hidden" && "overflow-hidden",
      overflow === "auto" && "overflow-auto",
      position,
      className
    )}
    {...(props as any)}
  >
    {children}
  </div>
));

/**
 * SidebarArea - Standardized sidebar container.
 * Automatically applies DESIGN.LAYOUT.SIDEBAR tokens.
 */
export const SidebarArea = memo(({ 
  children, className, isHidden, flex, shrink, background, border, rounded, shadow, padding, maxWidth, overflow, position, ...props 
}: LayoutProps & { isHidden?: boolean }) => (
  <div 
    className={cn(
      DESIGN.LAYOUT.SIDEBAR,
      "flex flex-col gap-4 transition-all duration-300",
      isHidden ? "hidden md:flex" : "flex",
      flex && flexMap[flex],
      shrink && shrinkMap[shrink],
      background && backgrounds[background],
      border && borders[border],
      rounded && roundings[rounded],
      shadow && shadows[shadow],
      padding && paddings[padding],
      maxWidth && widths[maxWidth],
      overflow === "hidden" && "overflow-hidden",
      overflow === "auto" && "overflow-auto",
      position,
      className
    )}
    {...(props as any)}
  >
    {children}
  </div>
));

/**
 * MainArea - Standardized main content container.
 * Automatically applies DESIGN.LAYOUT.MAIN tokens.
 */
export const MainArea = memo(({ 
  children, className, isHidden, flex, shrink, background, border, rounded, shadow, padding, maxWidth, overflow, position, ...props 
}: LayoutProps & { isHidden?: boolean }) => (
  <div 
    className={cn(
      DESIGN.LAYOUT.MAIN, 
      "flex flex-col",
      isHidden ? "hidden md:flex" : "flex",
      flex && flexMap[flex],
      shrink && shrinkMap[shrink],
      background && backgrounds[background],
      border && borders[border],
      rounded && roundings[rounded],
      shadow && shadows[shadow],
      padding && paddings[padding],
      maxWidth && widths[maxWidth],
      overflow === "hidden" && "overflow-hidden",
      overflow === "auto" && "overflow-auto",
      position,
      className
    )}
    {...(props as any)}
  >
    {children}
  </div>
));

PageBody.displayName = "PageBody";
SidebarArea.displayName = "SidebarArea";
MainArea.displayName = "MainArea";
