"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function ActivityLogsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md opacity-60" />
      </div>

      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[--color-border] p-6">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[--color-border] before:to-transparent">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon marker */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-[--color-border] bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded font-bold" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
