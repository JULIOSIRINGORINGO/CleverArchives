"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type IconWrapperVariant = "primary" | "warning" | "danger" | "success" | "muted";
type IconWrapperSize = "sm" | "md" | "lg";

interface IconWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: IconWrapperVariant;
  size?: IconWrapperSize;
}

const variantStyles: Record<IconWrapperVariant, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-50 text-amber-500",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-emerald-50 text-emerald-500",
  muted: "bg-muted text-muted-foreground",
};

const sizeStyles: Record<IconWrapperSize, string> = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
};

const IconWrapper = React.forwardRef<HTMLDivElement, IconWrapperProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
IconWrapper.displayName = "IconWrapper";

export { IconWrapper };
export type { IconWrapperVariant, IconWrapperSize };
