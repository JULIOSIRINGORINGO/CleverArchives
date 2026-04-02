"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitPanelLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ratio of the primary panel. Default 1.6 */
  primaryRatio?: number;
}

/**
 * SplitPanelLayout — A responsive two-column layout wrapper for dashboard pages.
 * Manages height, overflow, gap, and padding internally.
 */
export function SplitPanelLayout({
  primaryRatio = 1.6,
  className,
  children,
  ...props
}: SplitPanelLayoutProps) {
  const childArray = React.Children.toArray(children);
  const primary = childArray[0];
  const secondary = childArray.slice(1);

  return (
    <div
      className={cn(
        "flex-1 h-full min-h-0 overflow-hidden flex flex-col lg:flex-row gap-6 p-6"
      )}
      {...props}
    >
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ flex: primaryRatio }}
      >
        {primary}
      </div>

      {secondary.length > 0 && (
        <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
          {secondary}
        </div>
      )}
    </div>
  );
}
