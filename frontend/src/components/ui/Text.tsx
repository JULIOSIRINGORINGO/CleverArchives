"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TextVariant =
  | "heading"
  | "subheading"
  | "body"
  | "body-strong"
  | "caption"
  | "caption-muted"
  | "label"
  | "label-muted"
  | "label-strong"
  | "button-label"
  | "body-compact"
  | "micro-strong"
  | "list-title"
  | "list-subtitle"
  | "list-metadata"
  | "muted";

type TextTracking = "none" | "tight" | "tighter" | "wide" | "widest";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  uppercase?: boolean;
  tracking?: TextTracking;
  weight?: "normal" | "medium" | "semibold" | "bold" | "black";
  whiteSpace?: "normal" | "pre-wrap" | "nowrap";
  opacity?: "40" | "50" | "60" | "80" | "100";
  lineClamp?: "1" | "2" | "none";
  italic?: boolean;
  selectNone?: boolean;
  color?: "white" | "black" | "primary" | "muted" | "default" | "danger";
  textAlign?: "left" | "center" | "right";
}

const variantStyles: Record<TextVariant, string> = {
  heading: "text-lg",
  subheading: "text-sm",
  body: "text-base",
  "body-strong": "text-base",
  caption: "text-[10px]",
  "caption-muted": "text-[10px] italic opacity-60",
  label: "text-[10px]",
  "label-muted": "text-[10px] opacity-60",
  "label-strong": "text-[10px]",
  "button-label": "text-sm text-white",
  "body-compact": "text-[13px] leading-relaxed",
  "micro-strong": "text-[9px]",
  "list-title": "text-[13px] truncate transition-colors",
  "list-subtitle": "text-[11px] truncate opacity-60",
  "list-metadata": "text-[10px] text-muted-foreground/60 italic",
  muted: "text-xs",
};

const variantDefaultWeights: Partial<Record<TextVariant, TextProps["weight"]>> = {
  heading: "bold",
  subheading: "semibold",
  "body-strong": "bold",
  "caption-muted": "bold",
  "label-strong": "bold",
  "button-label": "bold",
  "micro-strong": "black",
  "list-title": "bold",
  "list-metadata": "bold",
};

const trackingStyles: Record<TextTracking, string> = {
  none: "tracking-normal",
  tight: "tracking-tight",
  tighter: "tracking-tighter",
  wide: "tracking-wide",
  widest: "tracking-widest",
};

const weightStyles = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  black: "font-black",
};

const defaultTag: Record<TextVariant, TextProps["as"]> = {
  heading: "h3",
  subheading: "h4",
  body: "p",
  "body-strong": "p",
  caption: "p",
  "caption-muted": "p",
  label: "span",
  "label-muted": "span",
  "label-strong": "span",
  "button-label": "span",
  "body-compact": "p",
  "micro-strong": "span",
  "list-title": "h4",
  "list-subtitle": "p",
  "list-metadata": "span",
  muted: "span",
};

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    variant = "body", 
    as, 
    className, 
    children, 
    uppercase, 
    tracking = "none", 
    weight,
    opacity,
    lineClamp,
    italic,
    selectNone,
    ...props 
  }, ref) => {
    const Tag = as || defaultTag[variant] || "span";
    const finalWeight = weight || variantDefaultWeights[variant] || "normal";
    
    return React.createElement(
      Tag,
      {
        ref,
        className: cn(
          variantStyles[variant], 
          trackingStyles[tracking],
          weightStyles[finalWeight],
          uppercase && "uppercase",
          variant === "muted" && "text-muted-foreground/60",
          variant === "label" && "text-muted-foreground",
          props.whiteSpace === "pre-wrap" && "whitespace-pre-wrap",
          props.whiteSpace === "nowrap" && "whitespace-nowrap",
          opacity === "40" && "opacity-40",
          opacity === "50" && "opacity-50",
          opacity === "60" && "opacity-60",
          opacity === "80" && "opacity-80",
          opacity === "100" && "opacity-100",
          lineClamp === "1" && "line-clamp-1",
          lineClamp === "2" && "line-clamp-2",
          italic && "italic",
          selectNone && "select-none",
          props.color === "white" && "text-white",
          props.color === "black" && "text-black",
          props.color === "primary" && "text-primary",
          props.color === "muted" && "text-muted-foreground",
          props.color === "danger" && "text-red-500",
          props.textAlign === "left" && "text-left",
          props.textAlign === "center" && "text-center",
          props.textAlign === "right" && "text-right",
          className
        ),
        ...props,
      },
      children
    );
  }
);
Text.displayName = "Text";

export { Text };
export type { TextVariant };
