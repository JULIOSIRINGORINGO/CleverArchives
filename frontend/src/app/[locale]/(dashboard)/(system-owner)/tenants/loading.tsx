"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function TenantsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md opacity-60" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-[--color-border] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-muted]/50">
                <th className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-20 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-32 rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-16 px-auto mx-auto rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-16 px-auto mx-auto rounded" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto rounded" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-20 rounded opacity-60" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20 rounded" /></td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-40 rounded opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-8 mx-auto rounded" /></td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2">
                    <Skeleton className="h-8 w-24 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
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
