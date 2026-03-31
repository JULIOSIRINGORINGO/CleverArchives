"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, onValueChange, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          "w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary",
          className
        )}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(Number(e.target.value));
        }}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
