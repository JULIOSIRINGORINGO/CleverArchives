"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface WorkspacePanelProps extends HTMLMotionProps<"div"> {
  isStatic?: boolean;
  fullHeight?: boolean;
}

const WorkspacePanel = React.forwardRef<HTMLDivElement, WorkspacePanelProps>(
  ({ className, isStatic = false, fullHeight = false, children, ...props }, ref) => {
    const containerClasses = cn(
      "bg-white border border-border/40 rounded-[2.5rem] shadow-sm flex flex-col min-h-0 overflow-hidden",
      fullHeight && "h-full flex-1",
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
          {...props}
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

interface WorkspacePanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showDivider?: boolean
}

const WorkspacePanelHeader = React.forwardRef<HTMLDivElement, WorkspacePanelHeaderProps>(
  ({ className, showDivider = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "p-8 pb-6 flex items-center justify-between shrink-0",
        showDivider && "border-b border-border/20",
        className
      )}
      {...props}
    />
  )
)
WorkspacePanelHeader.displayName = "WorkspacePanelHeader"

const WorkspacePanelContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-y-auto px-8 py-6 custom-scrollbar", className)}
      {...props}
    />
  )
)
WorkspacePanelContent.displayName = "WorkspacePanelContent"

interface WorkspacePanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  showDivider?: boolean
}

const WorkspacePanelFooter = React.forwardRef<HTMLDivElement, WorkspacePanelFooterProps>(
  ({ className, showDivider = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "p-8 pt-6 shrink-0",
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
