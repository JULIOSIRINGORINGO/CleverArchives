import * as React from "react";
import { cn } from "@/lib/utils";

interface IndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "muted";
  size?: "xs" | "sm" | "md";
  pulse?: boolean;
}

const variants = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-emerald-500",
  danger: "bg-rose-500",
  muted: "bg-muted-foreground/30",
};

const sizes = {
  xs: "w-1.5 h-1.5",
  sm: "w-2.5 h-2.5",
  md: "w-4 h-4",
};

export function Indicator({ 
  variant = "primary", 
  size = "xs", 
  pulse = true,
  className, 
  ...props 
}: IndicatorProps) {
  return (
    <div 
      className={cn(
        "rounded-full shrink-0",
        variants[variant],
        sizes[size],
        pulse && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}
