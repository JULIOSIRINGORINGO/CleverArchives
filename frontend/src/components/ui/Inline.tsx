import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Box, BoxProps, Spacing } from "./Box";

export interface InlineProps extends Omit<BoxProps, "wrap"> {
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
  mdDisplay,
  mdDirection,
  asChild = false,
  className, 
  ...props 
}, ref) => {
  return (
    <Box 
      ref={ref}
      as={asChild ? Slot : "div"}
      display="flex"
      direction="row"
      gap={spacing}
      align={isCentered || isStartCenter ? "center" : align}
      justify={isCentered ? "center" : (isStartCenter ? "start" : justify)}
      whiteSpace={wrap ? "normal" : "nowrap"}
      cursor={isClickable ? "pointer" : undefined}
      mdDisplay={mdDisplay}
      mdDirection={mdDirection}
      maxWidth={maxWidth}
      background={background}
      border={border}
      rounded={rounded}
      padding={padding}
      flex={flex}
      shrink={shrink}
      className={cn(
        wrap ? "flex-wrap" : "flex-nowrap",
        className
      )}
      {...props}
    />
  );
});
Inline.displayName = "Inline";
