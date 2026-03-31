"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function CatalogLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
      {/* Hero / Header */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-8">
        <Skeleton className="h-12 w-64 md:w-96 rounded-lg" />
        <Skeleton className="h-5 w-[80%] md:w-[600px] rounded-md opacity-60" />
      </div>

      {/* Search / Filters */}
      <div className="bg-card border border-[--color-border] p-4 rounded-2xl flex flex-col md:flex-row gap-4 max-w-3xl mx-auto shadow-sm">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-full md:w-32 rounded-xl" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={`h-8 rounded-full ${i % 2 === 0 ? 'w-24' : 'w-32'}`} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-8">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="space-y-3 group">
            <Skeleton className="w-full aspect-[2/3] rounded-2xl shadow-sm" />
            <div className="space-y-1.5 px-1">
              <Skeleton className="h-4 w-[90%] rounded" />
              <Skeleton className="h-3 w-[60%] rounded opacity-60" />
            </div>
            <div className="flex gap-1 px-1 pt-1">
              <Skeleton className="h-2.5 w-12 rounded" />
              <Skeleton className="h-2.5 w-12 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
