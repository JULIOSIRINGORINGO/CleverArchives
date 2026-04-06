import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Box, BoxProps, Spacing } from "./Box";

export interface StackProps extends BoxProps {
  spacing?: Spacing;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  isCentered?: boolean;
  centeredMaxWidth?: boolean;
  isClickable?: boolean;
  variant?: BoxProps["variant"];
  // Explicitly expose styling props for better IDE support
  background?: BoxProps["background"];
  border?: BoxProps["border"];
  rounded?: BoxProps["rounded"];
  padding?: BoxProps["padding"];
}

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(({ 
  spacing = "md", 
  align = "stretch", 
  justify = "start", 
  isCentered = false,
  centeredMaxWidth = false,
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
      direction="col"
      gap={spacing}
      align={isCentered ? "center" : align}
      justify={isCentered ? "center" : justify}
      centered={centeredMaxWidth}
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
      className={className}
      {...props}
    />
  );
});
Stack.displayName = "Stack";
