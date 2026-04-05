import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { 
  Box,
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
  className, 
  ...props 
}, ref) => {
  return (
    <Box 
      ref={ref}
      display="flex"
      direction="row"
      spacing={
        props.variant === "form-field-gap" ? "sm" : 
        props.variant === "chat-bubble-content-gap" ? "md" : 
        props.variant === "chat-date-separator" ? "md" : 
        spacing
      }
      align={
        (isCentered || props.variant === "chat-date-separator") ? "center" : 
        isStartCenter ? "center" : 
        props.variant === "chat-bubble-content-gap" ? "end" :
        align
      }
      justify={
        (isCentered || props.variant === "chat-date-separator") ? "center" : 
        isStartCenter ? "start" : 
        props.variant === "chat-bubble-content-gap" ? "start" :
        justify
      }
      cursor={isClickable ? "pointer" : undefined}
      className={cn(
        props.variant === "chat-date-separator" && "p-6",
        wrap ? "flex-wrap" : "flex-nowrap",
        className
      )}
      {...props}
    />
  );
});
Inline.displayName = "Inline";
