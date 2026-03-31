"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-2 border-b border-[--color-border] pb-6">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md opacity-60 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-6 p-4 rounded-2xl border border-[--color-border] bg-card items-center shadow-sm">
              <Skeleton className="w-16 h-24 rounded-lg bg-muted/80 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-[80%] rounded" />
                <Skeleton className="h-4 w-[60%] rounded opacity-60" />
                <Skeleton className="h-3 w-20 rounded pt-2" />
              </div>
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl border border-[--color-border] bg-card space-y-6 shadow-sm sticky top-24">
            <Skeleton className="h-6 w-32 rounded mb-4" />
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded opacity-60" />
                <Skeleton className="h-5 w-8 rounded" />
              </div>
              <div className="flex justify-between pt-4 border-t border-[--color-border]/50">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-6 w-12 rounded" />
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-xl mt-6" />
            <Skeleton className="h-4 w-48 rounded opacity-60 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
