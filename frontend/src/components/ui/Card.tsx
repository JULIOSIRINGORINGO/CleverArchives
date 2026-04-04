import * as React from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "soft" | "dashed" | "outline" | "ghost" | "ghost-surface";
type CardPadding = "none" | "xs" | "sm" | "md" | "lg" | "xl";
type CardRounding = "none" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  rounded?: CardRounding;
  border?: "none" | "soft" | "bold";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", rounded = "xl", border = "soft", ...props }, ref) => {
    const variants: Record<CardVariant, string> = {
      default: "bg-[--color-surface]",
      soft: "bg-[--color-muted]/50",
      dashed: "bg-[--color-muted]/30 border-dashed border-2",
      outline: "bg-transparent border",
      ghost: "bg-transparent",
      "ghost-surface": "bg-transparent border-none p-0",
    };

    const paddings: Record<CardPadding, string> = {
      none: "p-0",
      xs: "p-2",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
    };

    const rounding: Record<CardRounding, string> = {
      none: "rounded-none",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
    };

    const borderStyles = {
      none: "border-0",
      soft: "border border-border/5",
      bold: "border border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-300 overflow-hidden",
          variants[variant],
          paddings[padding],
          rounding[rounded],
          borderStyles[border],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
