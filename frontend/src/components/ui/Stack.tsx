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

const spacingMap: Record<Spacing, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

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
  const Component = asChild ? Slot : "div";

  return (
    <Component 
      ref={ref}
      className={cn(
        "flex flex-col", // Baseline
        spacingMap[spacing],
        isCentered ? "items-center justify-center" : cn(alignMap[align], justifyMap[justify]),
        centeredMaxWidth && "mx-auto max-w-full",
        isClickable && "cursor-pointer",
        mdDisplay && (mdDisplay === "hidden" || mdDisplay === "none" ? "md:hidden" : `md:${mdDisplay}`),
        mdDirection && `md:flex-${mdDirection}`,
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
Stack.displayName = "Stack";
