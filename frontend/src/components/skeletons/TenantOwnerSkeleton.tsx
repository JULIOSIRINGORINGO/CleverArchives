"use client";

import React from 'react';

const TenantOwnerSkeleton = () => {
  return (
    <div className="flex h-screen bg-muted/20 dark:bg-slate-950 text-foreground font-sans overflow-hidden">
      {/* Sidebar Skeleton */}
      <aside className="w-72 border-r bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden shrink-0">
        <div className="p-8 pb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl skeleton shadow-lg shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-24 rounded skeleton" />
            <div className="h-3 w-16 rounded skeleton opacity-50" />
          </div>
        </div>
        <div className="flex-1 px-4 space-y-8 mt-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-2 w-20 rounded skeleton mx-4 opacity-30" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 w-full rounded-2xl skeleton" />
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Skeleton */}
        <header className="h-16 border-b bg-background/80 backdrop-blur-md px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="h-6 w-40 rounded skeleton" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full skeleton" />
            <div className="h-8 w-8 rounded-full skeleton" />
            <div className="h-8 w-8 rounded-full skeleton" />
            <div className="h-8 w-32 rounded-full skeleton" />
          </div>
        </header>

        {/* Page Content Skeleton */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full space-y-10">
            {/* Title */}
            <div className="h-10 w-64 rounded skeleton" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-3xl skeleton" />
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
              <div className="h-12 w-full rounded-2xl skeleton" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 rounded-3xl border border-muted skeleton opacity-30 h-40" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantOwnerSkeleton;
