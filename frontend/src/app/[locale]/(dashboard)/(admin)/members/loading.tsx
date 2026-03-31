"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function MembersLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md opacity-60 mt-2" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-[--color-border] p-3 rounded-xl flex gap-3">
        <Skeleton className="h-10 flex-1 min-w-[200px] rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Table Area */}
      <div className="rounded-2xl border border-[--color-border] bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[--color-border] bg-muted/30">
                <th className="px-6 py-4"><Skeleton className="h-3 w-32 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-40 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-24 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-20 rounded ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[--color-border]/20">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-20 rounded opacity-60" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 rounded" />
                      <Skeleton className="h-3 w-28 rounded opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
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
