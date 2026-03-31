"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-80 rounded-md opacity-60 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card border border-[--color-border] p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start md:items-center shadow-sm">
            <Skeleton className="w-16 h-20 rounded-md shrink-0 bg-muted/80" />
            <div className="space-y-2 flex-1 w-full">
              <div className="flex justify-between items-start gap-4">
                <Skeleton className="h-5 w-[60%] sm:w-64 rounded" />
                <Skeleton className="h-6 w-24 rounded-full shrink-0" />
              </div>
              <Skeleton className="h-4 w-32 rounded opacity-60" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-28 rounded opacity-60" />
                <Skeleton className="h-4 w-28 rounded opacity-60" />
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto self-end">
              <Skeleton className="h-9 w-24 rounded-lg ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
