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
  | "chat-body"
  | "chat-timestamp"
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
  color?: "white" | "black" | "primary" | "muted" | "default";
}

const variantStyles: Record<TextVariant, string> = {
  heading: "text-lg",
  subheading: "text-sm",
  body: "text-base",
  "body-strong": "text-base font-bold",
  caption: "text-[10px]",
  "caption-muted": "text-[10px] font-bold italic opacity-60",
  label: "text-[10px]",
  "label-muted": "text-[10px] opacity-60",
  "label-strong": "text-[10px] font-bold",
  "button-label": "text-sm font-bold text-white",
  "chat-body": "text-[13px] leading-relaxed",
  "chat-timestamp": "text-[9px] font-black",
  "list-title": "font-bold text-[13px] truncate transition-colors",
  "list-subtitle": "font-medium text-[11px] truncate opacity-60",
  "list-metadata": "text-[10px] font-bold text-muted-foreground/60 italic",
  muted: "text-xs",
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
  "chat-body": "p",
  "chat-timestamp": "span",
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
    weight = "medium",
    opacity,
    lineClamp,
    italic,
    selectNone,
    ...props 
  }, ref) => {
    const Tag = as || defaultTag[variant] || "span";
    return React.createElement(
      Tag,
      {
        ref,
        className: cn(
          variantStyles[variant], 
          trackingStyles[tracking],
          weightStyles[weight],
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
