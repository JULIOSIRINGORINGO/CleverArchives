"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function GenericListLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <Skeleton className="h-9 w-56 rounded-md" />
        <Skeleton className="h-4 w-80 rounded-md opacity-60" />
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="rounded-xl border border-[--color-border] bg-white overflow-hidden shadow-sm">
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
