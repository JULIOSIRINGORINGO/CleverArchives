"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-gr-6 animate-in fade-in duration-500">
      {/* Title area skeleton */}
      <div className="space-y-gr-3 py-gr-2">
        <Skeleton className="h-10 w-72 rounded-gr shadow-sm" />
        <Skeleton className="h-5 w-96 rounded-gr opacity-40" />
      </div>

      {/* Stats Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gr-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-gr shadow-md shadow-slate-200/50" />
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gr-6">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-gr shadow-md shadow-slate-100/30" />
        <Skeleton className="h-[400px] rounded-gr shadow-md shadow-slate-100/30" />
      </div>

      {/* List/Bottom area skeleton */}
      <div className="space-y-gr-4">
        <Skeleton className="h-8 w-48 rounded-gr opacity-60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gr-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-gr shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
