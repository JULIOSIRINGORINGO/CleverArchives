import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { 
  BoxProps, 
  backgrounds, 
  borders, 
  roundings, 
  paddings, 
  flexMap, 
  shrinkMap,
  widths,
  widthMap,
  heightMap
} from "./Box";

type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface InlineProps extends BoxProps {
  spacing?: Spacing;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  isCentered?: boolean;
  isStartCenter?: boolean;
  isClickable?: boolean;
  variant?: BoxProps["variant"];
  // Explicitly expose styling props for better IDE support
  background?: BoxProps["background"];
  border?: BoxProps["border"];
  rounded?: BoxProps["rounded"];
  padding?: BoxProps["padding"];
}

const spacingMap: Record<Spacing, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export const Inline = React.forwardRef<HTMLDivElement, InlineProps>(({ 
  spacing = "md", 
  align = "center", 
  justify = "start", 
  wrap = false,
  isCentered = false,
  isStartCenter = false,
  isClickable = false,
  maxWidth,
  background,
  border,
  rounded,
  padding,
  flex,
  shrink,
  asChild = false,
  className, 
  ...props 
}, ref) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component 
      ref={ref}
      className={cn(
        "flex flex-row",
        props.variant === "form-field-gap" ? spacingMap["sm"] : 
        props.variant === "chat-bubble-content-gap" ? spacingMap["md"] : 
        props.variant === "chat-date-separator" ? spacingMap["md"] : 
        spacingMap[spacing],
        (isCentered || props.variant === "chat-date-separator") ? "items-center justify-center" : 
        isStartCenter ? "items-center justify-start" : 
        props.variant === "chat-bubble-content-gap" ? "items-end justify-start" :
        [alignMap[align], justifyMap[justify]],
        isClickable && "cursor-pointer",
        props.variant === "chat-date-separator" && "p-6",
        wrap ? "flex-wrap" : "flex-nowrap",
        maxWidth && widths[maxWidth],
        props.width && widthMap[props.width as keyof typeof widthMap],
        props.height && heightMap[props.height as keyof typeof heightMap],
        background && backgrounds[background],
        border && borders[border],
        rounded && roundings[rounded],
        padding && paddings[padding],
        flex && flexMap[flex],
        shrink && shrinkMap[shrink],
        className
      )}
      {...props}
    />
  );
});
Inline.displayName = "Inline";
