"use client";

import { cn } from "@/lib/utils";
import { DESIGN } from "@/config/design-system";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("animate-pulse bg-muted/40 rounded-xl", className)} />
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className={DESIGN.SPACE.ITEM_GAP}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 rounded-2xl bg-white/50 border border-border/10 flex items-center gap-4">
        <Skeleton className="w-10 h-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
    <div className="p-6 border border-border/10 rounded-2xl bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
    </div>
);
