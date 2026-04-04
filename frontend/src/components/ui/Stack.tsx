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
  widths
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
  asChild = false,
  className, 
  ...props 
}, ref) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component 
      ref={ref}
      className={cn(
        "flex flex-col",
        props.variant === "form-section-gap" ? spacingMap["lg"] : 
        props.variant === "form-item-gap" ? spacingMap["sm"] :
        props.variant === "tight-list-gap" ? spacingMap["none"] :
        props.variant === "upload-dropzone-content" ? spacingMap["xs"] :
        props.variant === "footer-button-group" ? spacingMap["md"] :
        props.variant === "chat-list-skeleton" ? spacingMap["lg"] :
        spacingMap[spacing],
        (isCentered || props.variant === "upload-dropzone-content" || props.variant === "chat-list-skeleton") ? "items-center justify-center" : [alignMap[align], justifyMap[justify]],
        (centeredMaxWidth || props.variant === "footer-button-group" || props.variant === "chat-list-skeleton") && "mx-auto max-w-full",
        (isClickable || props.variant === "upload-dropzone-content") && "cursor-pointer",
        props.variant === "chat-list-skeleton" && "h-full animate-pulse justify-end",
        maxWidth && widths[maxWidth],
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
