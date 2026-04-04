"use client";

import { ReactNode, memo } from "react";
import { cn } from "@/lib/utils";
import { DESIGN } from "@/config/design-system";

interface TabSystemProps {
  children: ReactNode;
  className?: string;
}

/**
 * TabContainer - Universal container for dashboard navigation tabs.
 * Enforces standardized radius, background, and height.
 */
export const TabContainer = memo(({ children, className }: TabSystemProps) => (
  <div className={cn(
    DESIGN.LAYOUT.TAB_H,
    "flex p-1 bg-white border border-border/40 rounded-2xl",
    className
  )}>
    {children}
  </div>
));

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  className?: string;
}

/**
 * TabButton - Premium interactive button for dashboard navigation.
 * Standardizes the 'Active vs Inactive' visual state across the workstation.
 */
export const TabButton = memo(({ active, onClick, icon, label, className }: TabButtonProps) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex-1 flex items-center justify-center gap-2 rounded-xl font-bold transition-all text-xs",
      active 
        ? "bg-primary text-white" 
        : "text-muted-foreground hover:bg-muted/50",
      className
    )}
  >
    {icon} {label}
  </button>
));

TabContainer.displayName = "TabContainer";
TabButton.displayName = "TabButton";
