"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Box, BoxProps, backgrounds, borders, roundings, shadows, paddings, flexMap, shrinkMap, widths } from "./Box";
import { cn } from "@/lib/utils";

type WorkspacePanelProps = Omit<HTMLMotionProps<"div">, "transition"> & Omit<BoxProps, keyof React.HTMLAttributes<HTMLDivElement> | "transition"> & {
  isStatic?: boolean;
  fullHeight?: boolean;
  children?: React.ReactNode;
  transition?: HTMLMotionProps<"div">["transition"];
};

const WorkspacePanel = React.forwardRef<HTMLDivElement, WorkspacePanelProps>(
  ({ 
    className, isStatic = false, fullHeight = false, children, 
    flex, flexShrink, background, border, rounded, shadow, padding, width, overflow, position, ...props 
  }, ref) => {
    const containerClasses = cn(
      "bg-white border border-border/40 flex flex-col min-h-0",
      !rounded && "rounded-[2.5rem]",
      !overflow && "overflow-hidden",
      overflow === "hidden" && "overflow-hidden",
      overflow === "auto" && "overflow-auto",
      fullHeight && "h-full flex-1",
      flex && flex in flexMap && flexMap[flex as keyof typeof flexMap],
      flexShrink !== undefined && flexShrink.toString() in shrinkMap && shrinkMap[flexShrink.toString() as keyof typeof shrinkMap],
      background && background in backgrounds && backgrounds[background as keyof typeof backgrounds],
      border && border in borders && borders[border as keyof typeof borders],
      rounded && rounded in roundings && roundings[rounded as keyof typeof roundings],
      shadow && shadow in shadows && shadows[shadow as keyof typeof shadows],
      padding && padding in paddings && paddings[padding as keyof typeof paddings],
      width && width in widths && widths[width as keyof typeof widths],
      position,
      className
    );

    if (!isStatic) {
      return (
        <motion.div
          ref={ref}
          initial={props.initial || { opacity: 0, y: 10 }}
          animate={props.animate || { opacity: 1, y: 0 }}
          transition={props.transition || { duration: 0.4, ease: "circOut" }}
          className={containerClasses}
          {...(props as any)}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={containerClasses} {...(props as any)}>
        {children}
      </div>
    )
  }
)
WorkspacePanel.displayName = "WorkspacePanel"

interface WorkspacePanelHeaderProps extends BoxProps {
  showDivider?: boolean
}

const WorkspacePanelHeader = React.forwardRef<HTMLDivElement, WorkspacePanelHeaderProps>(
  ({ className, showDivider = true, background, border, rounded, shadow, padding, flex, flexShrink, width, overflow, position, ...props }, ref) => (
    <Box
      ref={ref}
      background={background}
      border={border}
      rounded={rounded}
      shadow={shadow}
      padding={padding}
      flex={flex}
      flexShrink={flexShrink}
      width={width}
      overflow={overflow}
      position={position}
      className={cn(
        "px-8 py-6 flex items-center justify-between shrink-0",
        showDivider && "border-b border-border/20",
        className
      )}
      {...props}
    />
  )
)
WorkspacePanelHeader.displayName = "WorkspacePanelHeader"

interface WorkspacePanelContentProps extends BoxProps {}

const WorkspacePanelContent = React.forwardRef<HTMLDivElement, WorkspacePanelContentProps>(
  ({ className, background, flex = "1", overflow = "auto", padding, variant, ...props }, ref) => (
    <Box
      ref={ref}
      flex={flex}
      overflow={overflow}
      background={background}
      padding={padding}
      variant={variant}
      className={cn(
        variant !== "none" && "px-8 py-6",
        "custom-scrollbar",
        className
      )}
      {...props}
    />
  )
)
WorkspacePanelContent.displayName = "WorkspacePanelContent"

interface WorkspacePanelFooterProps extends BoxProps {
  showDivider?: boolean
}

const WorkspacePanelFooter = React.forwardRef<HTMLDivElement, WorkspacePanelFooterProps>(
  ({ className, showDivider = true, background, border, rounded, shadow, padding, flex, flexShrink, width, overflow, position, variant, ...props }, ref) => (
    <Box
      ref={ref}
      background={background}
      border={border}
      rounded={rounded}
      shadow={shadow}
      padding={padding}
      flex={flex}
      flexShrink={flexShrink}
      width={width}
      overflow={overflow}
      position={position}
      variant={variant}
      className={cn(
        variant !== "none" && "px-8 py-6",
        "shrink-0",
        showDivider && "border-t border-border/20",
        className
      )}
      {...props}
    />
  )
)
WorkspacePanelFooter.displayName = "WorkspacePanelFooter"

export {
  WorkspacePanel,
  WorkspacePanelHeader,
  WorkspacePanelContent,
  WorkspacePanelFooter,
}
