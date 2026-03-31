"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function LoansLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md opacity-60 mt-2" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stats Cards (if any) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl shadow-sm" />
        ))}
      </div>

      {/* Tabs / Filters */}
      <div className="bg-card border border-[--color-border] p-2 rounded-xl flex gap-2 w-fit">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg bg-muted/50" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[--color-border] bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[--color-border] bg-muted/30">
                <th className="px-6 py-4"><Skeleton className="h-3 w-48 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-32 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-24 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-24 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-16 rounded ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[--color-border]/20">
                  <td className="px-6 py-4">
                    <div className="flex gap-4 items-center">
                      <Skeleton className="w-10 h-14 rounded bg-muted/80 shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-3 w-24 rounded opacity-60" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-28 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-3 w-16 rounded opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-6 py-4 text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
