import * as React from "react";
import { cn } from "@/lib/utils";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "dashed" | "soft" | "bold";
  orientation?: "horizontal" | "vertical";
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

const variants = {
  solid: "border-border",
  dashed: "border-dashed border-border/40",
  soft: "border-border/5",
  bold: "border-border border-t-2",
};

const orientations = {
  horizontal: "w-full border-t",
  vertical: "h-full border-l",
};

const spacings = {
  none: "m-0",
  xs: "my-2",
  sm: "my-4",
  md: "my-6",
  lg: "my-8",
  xl: "my-12",
};

export function Divider({ 
  variant = "soft", 
  orientation = "horizontal", 
  spacing = "none",
  className, 
  ...props 
}: DividerProps) {
  return (
    <div 
      role="separator"
      className={cn(
        orientations[orientation],
        variants[variant],
        spacing !== "none" && orientation === "horizontal" && spacings[spacing],
        spacing !== "none" && orientation === "vertical" && spacings[spacing].replace("my-", "mx-"),
        className
      )}
      {...props}
    />
  );
}
