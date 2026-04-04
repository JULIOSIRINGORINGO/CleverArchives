"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "gradient" | "solid" | "transparent" | "blur";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  position?: "absolute" | "fixed" | "relative";
  center?: boolean;
}

const variantStyles = {
  gradient: "bg-gradient-to-t from-black/80 via-black/20 to-transparent",
  solid: "bg-black/40",
  transparent: "bg-transparent",
  blur: "backdrop-blur-[8px] bg-primary/10",
};

const paddings = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
};

interface OverlayAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
}

const areaPositions = {
  "top-right": "absolute top-4 right-4 z-20",
  "top-left": "absolute top-4 left-4 z-20",
  "bottom-right": "absolute bottom-4 right-4 z-20",
  "bottom-left": "absolute bottom-4 left-4 z-20",
  center: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20",
};

const OverlayRoot = ({ 
  variant = "transparent", 
  padding = "none", 
  position = "absolute",
  center = false,
  className, 
  ...props 
}: OverlayProps) => {
  return (
    <div 
      className={cn(
        position,
        "inset-0 z-10",
        variantStyles[variant],
        paddings[padding],
        center && "flex items-center justify-center text-center",
        className
      )}
      {...props}
    />
  );
};

const OverlayArea = ({ position = "center", className, ...props }: OverlayAreaProps) => (
  <div className={cn(areaPositions[position], className)} {...props} />
);

export const Overlay = Object.assign(OverlayRoot, {
  Area: OverlayArea,
});
