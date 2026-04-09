import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton Primitive
 * 
 * Provides a pulse animation placeholder for content that is loading.
 * Standardized to use our Variable Design System.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[--color-muted] opacity-30",
        className
      )}
      {...props}
    />
  );
}
