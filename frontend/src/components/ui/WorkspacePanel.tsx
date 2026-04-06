"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Box, BoxProps } from "./Box";
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
    // The main container as a Box to leverage its internal class logic
    const PanelContainer = (
      <Box
        ref={ref}
        flex={flex}
        flexShrink={flexShrink}
        background={background}
        border={border}
        rounded={rounded || "3xl"} // Default to 3xl if not provided
        shadow={shadow}
        padding={padding}
        width={width}
        overflow={overflow || "hidden"}
        position={position}
        display="flex"
        direction="col"
        minHeight="0"
        className={cn(
          "bg-white border-border/40",
          fullHeight && "h-full flex-1",
          className
        )}
      >
        {children}
      </Box>
    );

    if (!isStatic) {
      return (
        <motion.div
          initial={props.initial || { opacity: 0, y: 10 }}
          animate={props.animate || { opacity: 1, y: 0 }}
          transition={props.transition || { duration: 0.4, ease: "circOut" }}
          className={fullHeight ? "h-full flex-1 flex flex-col" : "flex flex-col"}
          {...(props as any)}
        >
          {PanelContainer}
        </motion.div>
      )
    }

    return PanelContainer;
  }
)
WorkspacePanel.displayName = "WorkspacePanel"

interface WorkspacePanelHeaderProps extends BoxProps {
  showDivider?: boolean
}

const WorkspacePanelHeader = React.forwardRef<HTMLDivElement, WorkspacePanelHeaderProps>(
  ({ className, showDivider = true, ...props }, ref) => (
    <Box
      ref={ref}
      display="flex"
      align="center"
      justify="between"
      shrink="0"
      paddingX="lg"
      paddingY="md"
      className={cn(
        "px-8 py-6",
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
  ({ className, padding, variant, ...props }, ref) => (
    <Box
      ref={ref}
      flex="1"
      overflow="auto"
      padding={padding}
      variant={variant}
      className={cn(
        variant !== "none" && !padding && "px-4 py-2",
        "custom-scrollbar transition-all",
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
  ({ className, showDivider = true, variant, ...props }, ref) => (
    <Box
      ref={ref}
      shrink="0"
      variant={variant}
      className={cn(
        variant !== "none" && "px-8 py-6",
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
