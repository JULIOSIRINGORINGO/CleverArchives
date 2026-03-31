"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md opacity-60 mt-2" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-[--color-border] p-4 rounded-2xl flex flex-wrap items-center gap-4 shadow-sm">
        <Skeleton className="h-10 flex-1 min-w-[200px] rounded-xl" />
        <Skeleton className="h-10 min-w-[150px] rounded-xl" />
        <Skeleton className="h-10 min-w-[150px] rounded-xl" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[--color-border] bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[--color-border] bg-muted/30">
                <th className="px-6 py-4"><Skeleton className="h-3 w-20 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-16 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-24 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-16 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-24 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-16 ml-auto rounded" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[--color-border]/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-40 rounded opacity-60" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-28 rounded" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20 rounded" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-3 w-24 rounded opacity-60" /></td>
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
