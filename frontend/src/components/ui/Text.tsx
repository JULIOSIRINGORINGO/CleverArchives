"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TextVariant =
  | "heading"
  | "subheading"
  | "body"
  | "caption"
  | "label"
  | "muted";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

const variantStyles: Record<TextVariant, string> = {
  heading: "text-lg font-bold leading-tight text-foreground tracking-tight",
  subheading: "text-sm font-bold text-foreground leading-snug",
  body: "text-sm font-medium text-foreground",
  caption: "text-xs font-medium text-muted-foreground italic leading-relaxed",
  label: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
  muted: "text-xs text-muted-foreground/60 font-medium",
};

const defaultTag: Record<TextVariant, TextProps["as"]> = {
  heading: "h3",
  subheading: "h4",
  body: "p",
  caption: "p",
  label: "span",
  muted: "span",
};

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = "body", as, className, children, ...props }, ref) => {
    const Tag = as || defaultTag[variant] || "span";
    return React.createElement(
      Tag,
      {
        ref,
        className: cn(variantStyles[variant], className),
        ...props,
      },
      children
    );
  }
);
Text.displayName = "Text";

export { Text };
export type { TextVariant };
