"use client";

import React from 'react';

/**
 * Skeleton for AdminDashboard — mirrors the welcome header, 4 stat cards,
 * and 2-column recent borrowings / due today sections.
 */
const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-72 rounded skeleton" />
        <div className="h-4 w-56 rounded skeleton opacity-60" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl skeleton" />
        ))}
      </div>

      {/* 2-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent borrowings */}
        <div className="rounded-2xl skeleton h-80" />
        {/* Due today */}
        <div className="rounded-2xl skeleton h-80" />
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
