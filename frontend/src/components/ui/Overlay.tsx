import * as React from "react";
import { Box, BoxProps, Spacing } from "./Box";
import { cn } from "@/lib/utils";

interface OverlayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  variant?: "glass" | "solid" | "transparent" | "blur" | "gradient";
  padding?: Spacing;
  position?: BoxProps["position"];
  center?: boolean;
}

interface OverlayAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
}

const variantStyles = {
  glass: "bg-white/10 backdrop-blur-[2px] border border-white/20",
  solid: "bg-background",
  transparent: "bg-transparent",
  blur: "backdrop-blur-[8px] bg-primary/10",
  gradient: "bg-gradient-to-t from-black/80 via-black/20 to-transparent",
};

const areaPositions = {
  "top-right": "absolute top-4 right-4 z-20",
  "top-left": "absolute top-4 left-4 z-20",
  "bottom-right": "absolute bottom-4 right-4 z-20",
  "bottom-left": "absolute bottom-4 left-4 z-20",
  center: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20",
};

const OverlayRoot = ({ 
  variant = "transparent", 
  padding, 
  position = "absolute",
  center = false,
  className, 
  ...props 
}: OverlayProps) => {
  return (
    <Box 
      position={position}
      padding={padding}
      className={cn(
        "inset-0 z-10",
        variantStyles[variant as keyof typeof variantStyles],
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
