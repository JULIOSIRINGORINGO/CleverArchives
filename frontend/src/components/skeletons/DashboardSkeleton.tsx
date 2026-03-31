"use client";

import React from 'react';

/**
 * Full-page dashboard skeleton that mirrors StandardLayout (sidebar + navbar + content).
 * Used by AuthGuard during initial session restore so the transition feels seamless.
 */
const DashboardSkeleton = () => {
  return (
    <div className="flex h-screen bg-muted/20 dark:bg-slate-950 text-foreground overflow-hidden animate-in fade-in duration-300">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden shrink-0">
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl skeleton shadow-lg shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 rounded skeleton" />
            <div className="h-3 w-16 rounded skeleton opacity-50" />
          </div>
        </div>
        <div className="flex-1 px-3 space-y-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-2 w-16 rounded skeleton mx-3 opacity-30" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-9 w-full rounded-xl skeleton" style={{ width: `${Math.floor(Math.random() * 20) + 80}%` }} />
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Skeleton */}
        <header className="h-16 border-b bg-background/80 backdrop-blur-md px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="h-5 w-48 rounded skeleton" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full skeleton" />
            <div className="h-8 w-8 rounded-full skeleton" />
            <div className="h-8 w-32 rounded-full skeleton" />
          </div>
        </header>

        {/* Page Content Skeleton */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Title area */}
            <div className="space-y-2">
              <div className="h-8 w-72 rounded skeleton" />
              <div className="h-4 w-96 rounded skeleton opacity-60" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl skeleton" />
              ))}
            </div>

            {/* Content area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 rounded-2xl skeleton" />
              <div className="h-72 rounded-2xl skeleton" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
