"use client";

import React from "react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

type StatCardVariant = "blue" | "emerald" | "amber" | "red" | "purple" | "indigo";

interface StatCardGoalProps {
  isGoal: true;
  target: number;
  progress: number;
  completedLabel: string;
  targetLabel: string;
}

interface StatCardDefaultProps {
  isGoal?: false;
  target?: never;
  progress?: never;
  completedLabel?: never;
  targetLabel?: never;
}

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  variant?: StatCardVariant;
  loading?: boolean;
  className?: string;
} & (StatCardGoalProps | StatCardDefaultProps);

const variantGradients: Record<StatCardVariant, string> = {
  blue:    "from-blue-600 to-blue-400",
  emerald: "from-emerald-600 to-emerald-400",
  amber:   "from-amber-600 to-orange-400",
  red:     "from-red-600 to-rose-400",
  purple:  "from-purple-600 to-purple-400",
  indigo:  "from-indigo-600 to-indigo-400",
};

/**
 * StatCard — Gradient stat card with optional goal progress bar.
 * Used in dashboards for displaying KPI metrics.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "blue",
  loading = false,
  isGoal,
  target,
  progress,
  completedLabel,
  targetLabel,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden rounded-xl border border-white/10 transition-all duration-300 cursor-pointer h-full min-h-[140px] bg-gradient-to-br text-white",
      variantGradients[variant],
      className
    )}>
      <CardContent className="p-5 relative z-10">
        {/* Top row: value + icon */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white/60 font-bold text-[10px] uppercase tracking-wider">{title}</h3>
            {loading ? (
              <Skeleton className="h-8 w-12 mt-2 bg-white/20" />
            ) : (
              <div className="text-2xl font-black mt-1.5 tabular-nums tracking-tighter">
                {isGoal ? (
                  <div className="flex items-end gap-1">
                    <span className="text-2xl">{value}</span>
                    <span className="text-white/40 text-sm font-bold mb-1">/ {target}</span>
                  </div>
                ) : value}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-white/20 group-hover:scale-105 group-hover:rotate-3 transition-transform border border-white/10">
            <Icon size={20} />
          </div>
        </div>

        {/* Bottom row: progress bar or trend */}
        {isGoal ? (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-white/60">
              <span>{Math.round(progress)}% {completedLabel}</span>
              <span>{targetLabel}: {target}</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white transition-all duration-1000 ease-out rounded-full"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
              <span className="text-[10px] font-bold text-white/60 leading-none uppercase tracking-wider">{trend}</span>
            </div>
            <ArrowUpRight size={14} className="text-white/40 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
