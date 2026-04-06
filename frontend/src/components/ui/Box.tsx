import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type BoxAspect = "square" | "portrait" | "landscape" | "video" | "book";
type BoxMaxWidth = "xs" | "sm" | "md" | "lg" | "xl" | "3xl" | "full" | "button-group" | "bubble-sm" | "bubble-md";
type BoxPosition = "relative" | "absolute" | "static" | "fixed" | "sticky";
type BoxBackground = "surface" | "surface-soft" | "primary" | "primary-soft" | "muted-soft" | "white" | "transparent" | "error-soft" | "danger";

export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BoxProps extends Omit<React.AllHTMLAttributes<HTMLElement>, 'as'> {
  as?: React.ElementType;
  aspect?: BoxAspect;
  maxWidth?: BoxMaxWidth;
  maxHeight?: "none" | "160px" | "64px";
  overflow?: "hidden" | "visible" | "auto" | "none";
  position?: BoxPosition;
  background?: BoxBackground;
  border?: "none" | "subtle" | "primary" | "dashed" | "top" | "all";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  padding?: Spacing;
  paddingX?: Spacing;
  paddingY?: Spacing;
  paddingTop?: Spacing;
  paddingBottom?: Spacing;
  margin?: Spacing;
  marginTop?: Spacing;
  marginBottom?: Spacing;
  marginLeft?: Spacing;
  marginRight?: Spacing;
  minWidth?: "0" | "full" | "auto";
  minHeight?: "0" | "full" | "auto";
  spacing?: Spacing | "gap-5" | "chat-list-skeleton";
  alignSelf?: "start" | "center" | "end" | "stretch";
  flex?: "none" | "1" | "1.5" | "auto" | "initial";
  color?: "white" | "black" | "primary" | "muted" | "default" | "danger";
  shrink?: "0" | "1";
  asChild?: boolean;
  textAlign?: "left" | "center" | "right";
  mdWidth?: "80" | "full";
  mdDisplay?: "flex" | "hidden" | "none" | "block";
  mdDirection?: "row" | "col" | "row-reverse" | "col-reverse";
  transition?: "all" | "none";
  whiteSpace?: "normal" | "pre-wrap" | "nowrap";
  centered?: boolean;
  width?: "full" | "auto" | "10" | "11" | "12" | "14" | "16" | "20" | "80" | "96" | "px" | BoxMaxWidth;
  height?: "full" | "auto" | "screen" | "10" | "11" | "12" | "14" | "16" | "20" | "32" | "40" | "44" | "48" | "56" | "64" | "80" | "96" | "20px" | "16" | "20" | "px";
  cursor?: "pointer";
  scrollbar?: "custom" | "none";
  display?: "flex" | "inline-flex" | "block" | "inline-block" | "grid" | "none" | "hidden";
  gridCols?: "1" | "2" | "3" | "4" | "6" | "12";
  mdGridCols?: "1" | "2" | "3" | "4" | "6" | "12";
  lgDisplay?: "flex" | "none" | "block" | "hidden";
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  lgDirection?: "row" | "col" | "row-reverse" | "col-reverse";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "xs" | "sm" | "md" | "lg" | "xl" | "none";
  opacity?: "40" | "50" | "60" | "80" | "100";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  flexShrink?: "0" | "1";
  variant?: 
    | "none" 
    | "interactive" 
    | "icon-wrapper" 
    | "field-group" 
    | "avatar-box" 
    | "surface-panel"
    | "content-section"
    | "popover-container"
    | "upload-dropzone"
    | "list-item-group"
    | "centered-max"
    | "workspace"
    | "dropdown-anchor"
    | "dropdown-list-container"
    | "dropdown-list-scroll"
    | "ghost-surface"
    | "form-section-gap"
    | "form-item-gap"
    | "tight-list-gap"
    | "form-field-gap"
    | "upload-dropzone-content"
    | "footer-button-group"
    | "popover-glass"
    | "popover-solid"
    | "search-results-overlay"
    | "pill-group"
    | "pill-item"
    | "fill-remaining"
    | "list-row"
    | "list-row-active"
    | "avatar-icon"
    | "input-adornment-left"
    | "status-dot";
  isFirst?: boolean;
  hoverEffect?: "scale";
  animation?: "pulse" | "spin" | "none";
  scrollMarginTop?: "20" | "none";
}

export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

export const aspects = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  book: "aspect-[3.2/4]",
  landscape: "aspect-[4/3]",
  video: "aspect-video",
};

export const widths = {
  xs: "max-w-[160px]",
  sm: "max-w-[200px]",
  "button-group": "max-w-[180px]",
  md: "max-w-[400px]",
  lg: "max-w-[600px]",
  xl: "max-w-[800px]",
  "3xl": "max-w-3xl",
  full: "w-full",
  "bubble-sm": "max-w-[85%] sm:max-w-[75%]",
  "bubble-md": "max-w-[90%] sm:max-w-[75%]",
  "1/5": "w-1/5",
  "4/5": "w-4/5",
};

export const heightMap = {
  full: "h-full",
  "10": "h-10",
  "11": "h-11",
  "12": "h-12",
  "14": "h-14",
  "16": "h-16",
  "20": "h-20",
  px: "h-px",
};

export const widthMap = {
  full: "w-full",
  "10": "w-10",
  "11": "w-11",
  "12": "w-12",
  "14": "w-14",
  "16": "w-16",
  "20": "w-20",
  px: "w-px",
};

export const backgrounds = {
  surface: "bg-background",
  "surface-soft": "bg-slate-50/50",
  primary: "bg-primary",
  "primary-soft": "bg-primary/5",
  "muted-soft": "bg-muted/5",
  white: "bg-white",
  transparent: "bg-transparent",
  "error-soft": "bg-red-50",
  danger: "bg-red-500",
};

export const borders = {
  none: "border-none",
  subtle: "border border-border/50",
  primary: "border border-primary",
  dashed: "border border-dashed border-border/60",
  top: "border-t border-border/50",
  all: "border border-border",
};

export const roundings = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-[24px]",
  full: "rounded-full",
};

export const paddings = {
  none: "p-0",
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

export const paddingsX = {
  none: "px-0",
  xs: "px-2",
  sm: "px-3",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
};

export const paddingsY = {
  none: "py-0",
  xs: "py-2",
  sm: "py-3",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
};

export const paddingsTop = {
  none: "pt-0",
  xs: "pt-2",
  sm: "pt-3",
  md: "pt-4",
  lg: "pt-6",
  xl: "pt-8",
};

export const paddingsBottom = {
  none: "pb-0",
  xs: "pb-2",
  sm: "pb-3",
  md: "pb-4",
  lg: "pb-6",
  xl: "pb-8",
};

export const margins = {
  none: "m-0",
  xs: "m-2",
  sm: "m-3",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
};

export const marginsTop = {
  none: "mt-0",
  xs: "mt-2",
  sm: "mt-3",
  md: "mt-4",
  lg: "mt-6",
  xl: "mt-8",
};

export const marginsBottom = {
  none: "mb-0",
  xs: "mb-2",
  sm: "mb-3",
  md: "mb-4",
  lg: "mb-6",
  xl: "mb-8",
};

export const marginsRight = {
  none: "mr-0",
  xs: "mr-2",
  sm: "mr-3",
  md: "mr-4",
  lg: "mr-6",
  xl: "mr-8",
};

export const marginsLeft = {
  none: "ml-0",
  xs: "ml-2",
  sm: "ml-3",
  md: "ml-4",
  lg: "ml-6",
  xl: "ml-8",
};

export const flexMap = {
  none: "flex-none",
  "1": "flex-1",
  "1.5": "flex-[1.5]",
  auto: "flex-auto",
  initial: "flex-initial",
};

export const shrinkMap = {
  "0": "shrink-0",
  "1": "shrink-1",
};

export const spacingMap: Record<Spacing | "gap-5" | "chat-list-skeleton", string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  "gap-5": "gap-5",
  lg: "gap-6",
  xl: "gap-8",
  "chat-list-skeleton": "gap-4",
};

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(({ 
  aspect, 
  maxWidth, 
  overflow = "visible", 
  position = "static",
  background,
  border,
  rounded,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingBottom,
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  minWidth,
  minHeight,
  spacing,
  flex,
  shrink,
  textAlign,
  alignSelf,
  transition,
  whiteSpace,
  animation,
  maxHeight,
  centered,
  width,
  height,
  cursor,
  scrollbar,
  display,
  gridCols,
  mdGridCols,
  mdDisplay,
  lgDisplay,
  scrollMarginTop,
  direction,
  mdDirection,
  lgDirection,
  align,
  justify,
  gap,
  shadow,
  flexShrink,
  variant = "none",
  isFirst = false,
  hoverEffect,
  asChild = false,
  opacity,
  as: ComponentType = "div",
  mdWidth,
  className, 
  ...props 
}, ref) => {
  const Component = asChild ? Slot : ComponentType;

  return (
    <Component 
      ref={ref}
      className={cn(
        position,
        aspect && aspects[aspect],
        maxWidth && widths[maxWidth],
        background && backgrounds[background as keyof typeof backgrounds],
        border && borders[border as keyof typeof borders],
        rounded && roundings[rounded],
        padding && paddings[padding],
        paddingX && paddingsX[paddingX],
        paddingY && paddingsY[paddingY],
        paddingTop && paddingsTop[paddingTop],
        paddingBottom && paddingsBottom[paddingBottom],
        margin && margins[margin],
        marginTop && marginsTop[marginTop],
        marginBottom && marginsBottom[marginBottom],
        marginLeft && marginsLeft[marginLeft],
        marginRight && marginsRight[marginRight],
        minWidth === "0" && "min-w-0",
        minWidth === "full" && "min-w-full",
        minWidth === "auto" && "min-w-auto",
        minHeight === "0" && "min-h-0",
        minHeight === "full" && "min-h-full",
        minHeight === "auto" && "min-h-auto",
        flex && flexMap[flex],
        shrink && shrinkMap[shrink],
        alignSelf === "start" && "self-start",
        alignSelf === "center" && "self-center",
        alignSelf === "end" && "self-end",
        alignSelf === "stretch" && "self-stretch",
        overflow === "hidden" && "overflow-hidden",
        overflow === "auto" && "overflow-auto",
        textAlign && `text-${textAlign}`,
        transition === "all" && "transition-all",
        whiteSpace === "pre-wrap" && "whitespace-pre-wrap",
        whiteSpace === "nowrap" && "whitespace-nowrap",
        maxHeight === "160px" && "max-h-[160px]",
        maxHeight === "64px" && "max-h-[64px]",
        centered && "mx-auto",
        width && widthMap[width as keyof typeof widthMap],
        height && heightMap[height as keyof typeof heightMap],
        cursor === "pointer" && "cursor-pointer",
        scrollbar === "custom" && "custom-scrollbar",
        scrollbar === "none" && "scrollbar-none",
        display === "flex" && "flex",
        display === "inline-flex" && "inline-flex",
        display === "block" && "block",
        display === "inline-block" && "inline-block",
        display === "grid" && "grid",
        mdDisplay === "flex" && "md:flex",
        mdDisplay === "hidden" && "md:hidden",
        mdDisplay === "none" && "md:hidden",
        width === "80" && "w-80",
        mdWidth === "80" && "md:w-80",
        mdWidth === "full" && "md:w-full",
        gridCols === "1" && "grid-cols-1",
        gridCols === "2" && "grid-cols-2",
        gridCols === "3" && "grid-cols-3",
        gridCols === "4" && "grid-cols-4",
        gridCols === "6" && "grid-cols-6",
        gridCols === "12" && "grid-cols-12",
        mdGridCols === "1" && "md:grid-cols-1",
        mdGridCols === "2" && "md:grid-cols-2",
        mdGridCols === "3" && "md:grid-cols-3",
        mdGridCols === "4" && "md:grid-cols-4",
        mdGridCols === "6" && "md:grid-cols-6",
        mdGridCols === "12" && "md:grid-cols-12",
        display === "none" && "none",
        display === "hidden" && "hidden",
        mdDisplay === "flex" && "md:flex",
        mdDisplay === "none" && "md:none",
        mdDisplay === "block" && "md:block",
        mdDisplay === "hidden" && "md:hidden",
        lgDisplay === "flex" && "lg:flex",
        lgDisplay === "none" && "lg:none",
        lgDisplay === "block" && "lg:block",
        lgDisplay === "hidden" && "lg:hidden",
        props.color === "muted" && "text-muted-foreground",
        props.color === "danger" && "text-red-500",
        animation === "pulse" && "animate-pulse",
        animation === "spin" && "animate-spin",
        scrollMarginTop === "20" && "scroll-mt-20",
        direction === "row" && "flex-row",
        direction === "col" && "flex-col",
        direction === "row-reverse" && "flex-row-reverse",
        direction === "col-reverse" && "flex-col-reverse",
        mdDirection === "row" && "md:flex-row",
        mdDirection === "col" && "md:flex-col",
        mdDirection === "row-reverse" && "md:flex-row-reverse",
        mdDirection === "col-reverse" && "md:flex-col-reverse",
        lgDirection === "row" && "lg:flex-row",
        lgDirection === "col" && "lg:flex-col",
        lgDirection === "row-reverse" && "lg:flex-row-reverse",
        lgDirection === "col-reverse" && "lg:flex-col-reverse",
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        align === "baseline" && "items-baseline",
        align === "stretch" && "items-stretch",
        justify === "start" && "justify-start",
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        justify === "between" && "justify-between",
        justify === "around" && "justify-around",
        justify === "evenly" && "justify-evenly",
        spacing && spacingMap[spacing],
        shadow && shadows[shadow],
        flexShrink && shrinkMap[flexShrink],
        variant === "interactive" && "hover:bg-muted/10 transition-colors",
        variant === "icon-wrapper" && "flex items-center justify-center transition-transform",
        variant === "field-group" && "bg-muted/5 border border-border/50 rounded-xl overflow-hidden transition-all focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20",
        variant === "avatar-box" && "w-10 h-10 bg-primary/5 border border-border/50 rounded-xl flex items-center justify-center shrink-0",
        variant === "surface-panel" && "flex-1 bg-white relative w-full overflow-hidden",
        variant === "content-section" && "p-6",
        variant === "popover-container" && "rounded-xl overflow-hidden bg-gradient-to-b from-white to-slate-50/50 border border-border/50 z-50",
        variant === "upload-dropzone" && "p-8 border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/[0.01]",
        variant === "list-item-group" && "p-4 border-t border-border/50 w-full text-left cursor-pointer hover:bg-muted/10 transition-colors",
        variant === "centered-max" && "mx-auto max-w-full",
        variant === "workspace" && "flex flex-col h-full w-full",
        variant === "popover-glass" && "absolute top-full z-50 mt-2 rounded-2xl border border-white/50 bg-white/80 p-2 shadow-2xl backdrop-blur-xl",
        variant === "popover-solid" && "absolute top-full z-50 mt-2 rounded-2xl border border-border bg-white p-2 shadow-2xl",
        variant === "search-results-overlay" && "absolute z-50 w-full mt-2 bg-white/80 backdrop-blur-md border border-border shadow-2xl rounded-2xl overflow-hidden max-h-52 overflow-y-auto custom-scrollbar",
        variant === "dropdown-anchor" && "relative w-full",
        variant === "dropdown-list-container" && "absolute w-full z-50 top-full mt-2 left-0",
        variant === "dropdown-list-scroll" && "max-h-[160px] overflow-auto custom-scrollbar",
        variant === "ghost-surface" && "border-none p-0 bg-transparent",
        variant === "pill-group" && "flex w-full p-1 bg-white border border-border/50 rounded-2xl shadow-sm shadow-black/[0.02]",
        variant === "pill-item" && "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm",
        variant === "fill-remaining" && "flex-1 h-full min-h-0 overflow-hidden flex flex-col",
        variant === "list-row" && "hover:bg-primary/5 transition-all duration-200 border-none outline-none",
        variant === "list-row-active" && "bg-primary/10 border-none outline-none ring-0 focus:ring-0",
        variant === "avatar-icon" && "shrink-0 flex items-center justify-center bg-primary/10 text-primary font-bold w-11 h-11 rounded-xl",
        variant === "input-adornment-left" && "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 z-10 flex items-center justify-center",
        variant === "status-dot" && "absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full transition-transform hover:scale-110",
        opacity === "40" && "opacity-40",
        opacity === "50" && "opacity-50",
        opacity === "60" && "opacity-60",
        opacity === "80" && "opacity-80",
        opacity === "100" && "opacity-100",
        isFirst && "first:border-0",
        hoverEffect === "scale" && "group-hover:scale-110",
        className
      )}
      {...props}
    />
  );
});
Box.displayName = "Box";
