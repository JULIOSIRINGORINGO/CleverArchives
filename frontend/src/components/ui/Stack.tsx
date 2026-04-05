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
  className, 
  ...props 
}, ref) => {
  return (
    <Box 
      ref={ref}
      display="flex"
      direction="col"
      spacing={
        props.variant === "form-section-gap" ? "lg" : 
        props.variant === "form-item-gap" ? "sm" :
        props.variant === "tight-list-gap" ? "none" :
        props.variant === "upload-dropzone-content" ? "xs" :
        props.variant === "footer-button-group" ? "md" :
        props.variant === "chat-list-skeleton" ? "lg" :
        spacing
      }
      align={isCentered || props.variant === "upload-dropzone-content" || props.variant === "chat-list-skeleton" ? "center" : align}
      justify={isCentered || props.variant === "upload-dropzone-content" || props.variant === "chat-list-skeleton" ? "center" : justify}
      centered={centeredMaxWidth || props.variant === "footer-button-group" || props.variant === "chat-list-skeleton"}
      cursor={(isClickable || props.variant === "upload-dropzone-content") ? "pointer" : undefined}
      className={cn(
        props.variant === "chat-list-skeleton" && "h-full animate-pulse justify-end",
        className
      )}
      {...props}
    />
  );
});
Stack.displayName = "Stack";
