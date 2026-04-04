import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type BoxAspect = "square" | "portrait" | "landscape" | "video" | "book";
type BoxMaxWidth = "xs" | "sm" | "md" | "lg" | "xl" | "3xl" | "full" | "button-group" | "bubble-sm" | "bubble-md";
type BoxPosition = "relative" | "absolute" | "static" | "fixed" | "sticky";
type BoxBackground = "surface" | "primary" | "primary-soft" | "muted-soft" | "white" | "transparent";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  aspect?: BoxAspect;
  maxWidth?: BoxMaxWidth;
  maxHeight?: "none" | "160px" | "64px";
  overflow?: "hidden" | "visible" | "auto" | "none";
  position?: BoxPosition;
  background?: BoxBackground;
  border?: "none" | "subtle" | "primary" | "dashed" | "top";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "custom-bubble";
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  flex?: "none" | "1" | "1.5" | "auto" | "initial";
  shrink?: "0" | "1";
  asChild?: boolean;
  textAlign?: "left" | "center" | "right";
  transition?: "all" | "none";
  whiteSpace?: "normal" | "pre-wrap" | "nowrap";
  centered?: boolean;
  width?: "10" | "full" | BoxMaxWidth;
  height?: "10" | "16" | "full";
  cursor?: "pointer";
  scrollbar?: "custom" | "none";
  display?: "flex" | "inline-flex" | "block" | "inline-block" | "grid" | "none" | "hidden";
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
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
    | "chat-bubble-me"
    | "chat-bubble-them"
    | "chat-input-container"
    | "chat-message-list-container"
    | "chat-date-badge"
    | "chat-divider-line"
    | "chat-list-skeleton"
    | "input-adornment-left"
    | "list-row"
    | "list-row-active"
    | "avatar-icon"
    | "chat-search-badge"
    | "chat-empty-state"
    | "chat-panel"
    | "chat-bubble-content-gap"
    | "chat-date-separator";
  isFirst?: boolean;
  hoverEffect?: "scale";
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
  "bubble-md": "max-w-[90%] sm:max-w-[80%]",
};

export const backgrounds = {
  surface: "bg-background",
  primary: "bg-primary",
  "primary-soft": "bg-primary/5",
  "muted-soft": "bg-muted/5",
  white: "bg-white",
  transparent: "bg-transparent",
};

export const borders = {
  none: "border-none",
  subtle: "border border-border/50",
  primary: "border border-primary",
  dashed: "border border-dashed border-border/60",
  top: "border-t border-border/50",
};

export const roundings = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
  "custom-bubble": "rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px]",
};

export const paddings = {
  none: "p-0",
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
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

export const gapStyles = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
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
  flex,
  shrink,
  textAlign,
  transition,
  whiteSpace,
  maxHeight,
  centered,
  width,
  height,
  cursor,
  scrollbar,
  display,
  direction,
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
  className, 
  ...props 
}, ref) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component 
      ref={ref}
      className={cn(
        position,
        aspect && aspects[aspect],
        maxWidth && widths[maxWidth],
        background && backgrounds[background],
        border && borders[border],
        rounded && roundings[rounded],
        padding && paddings[padding],
        flex && flexMap[flex],
        shrink && shrinkMap[shrink],
        overflow === "hidden" && "overflow-hidden",
        overflow === "auto" && "overflow-auto",
        textAlign && `text-${textAlign}`,
        transition === "all" && "transition-all",
        whiteSpace === "pre-wrap" && "whitespace-pre-wrap",
        whiteSpace === "nowrap" && "whitespace-nowrap",
        maxHeight === "160px" && "max-h-[160px]",
        maxHeight === "64px" && "max-h-[64px]",
        centered && "mx-auto",
        width === "10" && "w-10",
        width === "full" && "w-full",
        height === "10" && "h-10",
        height === "16" && "h-16",
        height === "full" && "h-full",
        cursor === "pointer" && "cursor-pointer",
        scrollbar === "custom" && "custom-scrollbar",
        scrollbar === "none" && "scrollbar-none",
        display === "flex" && "flex",
        display === "inline-flex" && "inline-flex",
        display === "block" && "block",
        display === "inline-block" && "inline-block",
        display === "grid" && "grid",
        (display === "none" || display === "hidden") && "hidden",
        direction === "row" && "flex-row",
        direction === "col" && "flex-col",
        direction === "row-reverse" && "flex-row-reverse",
        direction === "col-reverse" && "flex-col-reverse",
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
        gap && gapStyles[gap],
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
        variant === "dropdown-anchor" && "relative w-full",
        variant === "dropdown-list-container" && "absolute w-full z-50 top-full mt-2 left-0",
        variant === "dropdown-list-scroll" && "max-h-[160px] overflow-auto custom-scrollbar",
        variant === "ghost-surface" && "border-none p-0 bg-transparent",
        variant === "chat-empty-state" && "flex-1 flex flex-col items-center justify-center p-8",
        variant === "chat-panel" && "h-full flex flex-col w-full border border-border/50 bg-gradient-to-b from-white to-slate-50/30 relative",
        variant === "chat-date-separator" && "",
        variant === "input-adornment-left" && "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 z-10 flex items-center justify-center",
        variant === "list-row" && "w-full text-left transition-all p-4 rounded-2xl flex items-center gap-4 hover:bg-muted/50",
        variant === "list-row-active" && "bg-primary/5 ring-1 ring-primary/20",
        variant === "avatar-icon" && "shrink-0 flex items-center justify-center bg-primary/10 text-primary font-bold w-11 h-11 rounded-xl",
        variant === "chat-search-badge" && "absolute right-2 top-1/2 -translate-y-1/2 bg-muted-soft rounded-md border border-border/50 px-2 py-1 flex items-center gap-1",
        opacity === "40" && "opacity-40",
        opacity === "50" && "opacity-50",
        opacity === "60" && "opacity-60",
        opacity === "80" && "opacity-80",
        opacity === "100" && "opacity-100",
        variant === "centered-max" && "mx-auto max-w-full",
        isFirst && "first:border-0",
        hoverEffect === "scale" && "group-hover:scale-110",
        className
      )}
      {...props}
    />
  );
});
Box.displayName = "Box";
