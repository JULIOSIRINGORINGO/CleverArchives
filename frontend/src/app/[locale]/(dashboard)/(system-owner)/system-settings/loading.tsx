"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function SystemSettingsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md opacity-60" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[--color-border] p-6 space-y-8">
        {/* Form Sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-px w-full bg-[--color-border]" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            {i === 1 && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t border-[--color-border]">
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
