import * as React from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
  inverted?: boolean;
  lineClamp?: number;
  weight?: "bold" | "black" | "semibold";
}

const sizeMap: Record<HeadingSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg leading-tight",
  xl: "text-xl tracking-tight",
  "2xl": "text-2xl tracking-tighter",
  "3xl": "text-3xl tracking-tighter",
};

const weightMap = {
  bold: "font-bold",
  black: "font-black",
  semibold: "font-semibold",
};

export function Heading({ 
  level = "h3", 
  size = "md", 
  inverted = false, 
  lineClamp,
  weight = "bold",
  className, 
  ...props 
}: HeadingProps) {
  const Tag = level;
  
  return (
    <Tag 
      className={cn(
        sizeMap[size],
        weightMap[weight],
        lineClamp && `line-clamp-${lineClamp}`,
        inverted ? "text-white" : "text-foreground",
        className
      )}
      {...props}
    />
  );
}
