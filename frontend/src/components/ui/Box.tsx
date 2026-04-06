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
  overflowX?: "hidden" | "visible" | "auto" | "none";
  overflowY?: "hidden" | "visible" | "auto" | "none";
  position?: BoxPosition;
  background?: BoxBackground;
  border?: "none" | "subtle" | "primary" | "dashed" | "top" | "bottom" | "all";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  padding?: Spacing;
  paddingX?: Spacing;
  paddingY?: Spacing;
  paddingTop?: Spacing;
  paddingBottom?: Spacing;
  margin?: Spacing;
  marginTop?: Spacing | "auto";
  marginBottom?: Spacing | "auto";
  marginLeft?: Spacing | "auto";
  marginRight?: Spacing | "auto";
  minWidth?: "0" | "full" | "auto";
  minHeight?: "0" | "full" | "auto";
  spacing?: Spacing | "gap-5";
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
  width?: "full" | "auto" | "2" | "6" | "10" | "11" | "12" | "14" | "16" | "20" | "80" | "96" | "px" | BoxMaxWidth;
  height?: "full" | "auto" | "screen" | "2" | "6" | "10" | "11" | "12" | "14" | "16" | "20" | "32" | "40" | "44" | "48" | "56" | "64" | "80" | "96" | "20px" | "px";
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
  variant?: "none" | "interactive" | "icon-wrapper" | "surface-panel" | "centered-max" | "workspace" | "ghost-surface" | "fill-remaining";
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
  auto: "h-auto",
  screen: "h-screen",
  "2": "h-2",
  "6": "h-6",
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
  auto: "w-auto",
  "2": "w-2",
  "6": "w-6",
  "10": "w-10",
  "11": "w-11",
  "12": "w-12",
  "14": "w-14",
  "16": "w-16",
  "20": "w-20",
  "80": "w-80",
  "96": "w-96",
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
  bottom: "border-b border-border/50",
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

const SPACING_MAP: Record<string, Record<string, string>> = {
  p:  { none: "p-0", xs: "p-2", sm: "p-3", md: "p-4", lg: "p-6", xl: "p-8" },
  px: { none: "px-0", xs: "px-2", sm: "px-3", md: "px-4", lg: "px-6", xl: "px-8" },
  py: { none: "py-0", xs: "py-2", sm: "py-3", md: "py-4", lg: "py-6", xl: "py-8" },
  pt: { none: "pt-0", xs: "pt-2", sm: "pt-3", md: "pt-4", lg: "pt-6", xl: "pt-8" },
  pb: { none: "pb-0", xs: "pb-2", sm: "pb-3", md: "pb-4", lg: "pb-6", xl: "pb-8" },
  m:  { none: "m-0", xs: "m-2", sm: "m-3", md: "m-4", lg: "m-6", xl: "m-8" },
  mt: { none: "mt-0", xs: "mt-2", sm: "mt-3", md: "mt-4", lg: "mt-6", xl: "mt-8", auto: "mt-auto" },
  mb: { none: "mb-0", xs: "mb-2", sm: "mb-3", md: "mb-4", lg: "mb-6", xl: "mb-8", auto: "mb-auto" },
  ml: { none: "ml-0", xs: "ml-2", sm: "ml-3", md: "ml-4", lg: "ml-6", xl: "ml-8", auto: "ml-auto" },
  mr: { none: "mr-0", xs: "mr-2", sm: "mr-3", md: "mr-4", lg: "mr-6", xl: "mr-8", auto: "mr-auto" },
  g:  { none: "gap-0", xs: "gap-1", sm: "gap-2", md: "gap-4", lg: "gap-6", xl: "gap-8", "gap-5": "gap-5" },
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

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(({ 
  aspect, 
  maxWidth, 
  overflow = "visible", 
  overflowX,
  overflowY,
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
        padding && SPACING_MAP.p[padding],
        paddingX && SPACING_MAP.px[paddingX],
        paddingY && SPACING_MAP.py[paddingY],
        paddingTop && SPACING_MAP.pt[paddingTop],
        paddingBottom && SPACING_MAP.pb[paddingBottom],
        margin && SPACING_MAP.m[margin],
        marginTop && SPACING_MAP.mt[marginTop],
        marginBottom && SPACING_MAP.mb[marginBottom],
        marginLeft && SPACING_MAP.ml[marginLeft],
        marginRight && SPACING_MAP.mr[marginRight],
        minWidth === "0" && "min-w-0",
        minWidth === "full" && "min-w-full",
        minWidth === "auto" && "min-w-auto",
        minHeight === "0" && "min-h-0",
        minHeight === "full" && "min-h-full",
        minHeight === "auto" && "min-h-auto",
        flex && flexMap[flex],
        shrink && shrinkMap[shrink],
        alignSelf && `self-${alignSelf}`,
        overflow === "hidden" && "overflow-hidden",
        overflow === "auto" && "overflow-auto",
        overflowX === "hidden" && "overflow-x-hidden",
        overflowX === "auto" && "overflow-x-auto",
        overflowY === "hidden" && "overflow-y-hidden",
        overflowY === "auto" && "overflow-y-auto",
        textAlign && `text-${textAlign}`,
        transition === "all" && "transition-all",
        whiteSpace && `whitespace-${whiteSpace}`,
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
        mdDisplay && `md:${mdDisplay === "none" ? "hidden" : mdDisplay}`,
        mdWidth === "80" && "md:w-80",
        mdWidth === "full" && "md:w-full",
        gridCols && `grid-cols-${gridCols}`,
        mdGridCols && `md:grid-cols-${mdGridCols}`,
        lgDisplay && `lg:${lgDisplay === "none" ? "hidden" : lgDisplay}`,
        props.color === "muted" && "text-muted-foreground",
        props.color === "danger" && "text-red-500",
        animation && `animate-${animation}`,
        scrollMarginTop === "20" && "scroll-mt-20",
        direction && `flex-${direction}`,
        mdDirection && `md:flex-${mdDirection}`,
        lgDirection && `lg:flex-${lgDirection}`,
        align && `items-${align}`,
        justify && `justify-${justify === "between" ? "between" : justify === "around" ? "around" : justify === "evenly" ? "evenly" : justify}`,
        spacing && SPACING_MAP.g[spacing],
        gap && SPACING_MAP.g[gap],
        shadow && shadows[shadow],
        flexShrink && shrinkMap[flexShrink],
        variant === "interactive" && "hover:bg-muted/10 transition-colors",
        variant === "icon-wrapper" && "flex items-center justify-center transition-transform",
        variant === "surface-panel" && "flex-1 bg-white relative w-full overflow-hidden",
        variant === "centered-max" && "mx-auto max-w-full",
        variant === "workspace" && "flex flex-col h-full w-full",
        variant === "ghost-surface" && "border-none p-0 bg-transparent",
        variant === "fill-remaining" && "flex-1 h-full min-h-0 overflow-hidden flex-col flex",
        opacity && `opacity-${opacity}`,
        isFirst && "first:border-0",
        hoverEffect === "scale" && "group-hover:scale-110",
        className
      )}
      {...props}
    />
  );
});
Box.displayName = "Box";
