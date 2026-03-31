"use client";

import React from 'react';

/**
 * Skeleton for MemberDashboard — mirrors the welcome header, 3 stat cards, 
 * recommended section, and digital library card.
 */
const MemberDashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 py-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full skeleton" />
            <div className="h-3 w-20 rounded skeleton" />
          </div>
          <div className="h-9 w-64 rounded skeleton" />
          <div className="h-4 w-80 rounded skeleton opacity-60" />
        </div>
        <div className="h-12 w-40 rounded-2xl skeleton" />
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl skeleton" />
        ))}
      </div>

      {/* Bottom section: recommended + digital library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl skeleton" />
        <div className="h-72 rounded-2xl skeleton" />
      </div>
    </div>
  );
};

export default MemberDashboardSkeleton;
