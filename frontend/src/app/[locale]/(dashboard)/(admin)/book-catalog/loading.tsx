"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function BookCatalogLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md opacity-60 mt-2" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="bg-card border border-[--color-border] p-3 rounded-xl flex gap-3">
        <Skeleton className="h-10 flex-1 min-w-[200px] rounded-xl" />
        <Skeleton className="h-10 min-w-[150px] rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border border-[--color-border] rounded-2xl p-4 space-y-4 shadow-sm">
            <Skeleton className="w-full aspect-[2/3] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-[80%] rounded" />
              <Skeleton className="h-4 w-[60%] rounded opacity-60" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
