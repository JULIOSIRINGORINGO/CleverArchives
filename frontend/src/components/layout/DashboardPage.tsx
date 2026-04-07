"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

interface DashboardPageProps {
  children?: ReactNode;
  /** Primary area for buttons, search bars, etc. */
  headerActions?: ReactNode;
  /** Alias for headerActions for backward compatibility */
  headerControls?: ReactNode;
  /** Fixed footer area for pagination or sticky actions */
  footer?: ReactNode;
  title?: ReactNode;
  subtitle?: string;
  badge?: string;
  icon?: ReactNode;
  className?: string;
  /** If true, removes the default padding from the content container */
  noPadding?: boolean;
  /** If true, the internal scroll container is disabled (useful for Messaging) */
  hideScroll?: boolean;
  /** If true, the PageHeader is not rendered */
  hideHeader?: boolean;
}

/**
 * DashboardPage - The standard wrapper for all dashboard pages.
 */
export function DashboardPage({ 
  children, 
  headerActions,
  headerControls, 
  footer,
  title, 
  subtitle,
  badge, 
  icon,
  className,
  noPadding = false,
  hideScroll = false,
  hideHeader = false
}: DashboardPageProps) {
  // Use headerActions as primary, fallback to headerControls
  const finalHeaderActions = headerActions || headerControls;

  return (
    <div className={cn(
      "flex flex-col flex-1 min-h-0 h-full overflow-hidden animate-in fade-in duration-150", 
      className
    )}>
      {!hideHeader && (
        <PageHeader 
          title={title || ""} 
          subtitle={subtitle}
          badge={badge} 
          icon={icon}
          className={cn(noPadding ? "" : "")}
        >
          {finalHeaderActions}
        </PageHeader>
      )}
      
      <div className={cn(
        "flex-1 min-h-0 overflow-hidden flex flex-col relative",
        noPadding ? "" : "px-4 md:px-6 py-4 md:py-6"
      )}>
        <div className={cn(
          "flex-1 min-h-0",
          hideScroll ? "flex flex-col" : "overflow-y-auto overflow-x-hidden"
        )}>
          {children}
        </div>
        
        {footer && (
          <div className="sticky bottom-0 z-30 w-full bg-[#f1f5f9] border-t border-border/10 px-6 py-4 mt-auto">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
