"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function BorrowedLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-52 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md opacity-60 mt-2" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-[--color-border] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6">
            <Skeleton className="w-24 h-36 rounded-lg bg-muted/80 shrink-0 mx-auto sm:mx-0" />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-4 w-32 rounded opacity-60" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded opacity-60" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <Skeleton className="h-full w-[40%] bg-primary/40 rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded opacity-60" />
                  <Skeleton className="h-4 w-24 rounded text-danger" />
                </div>
              </div>
              <div className="pt-2">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
