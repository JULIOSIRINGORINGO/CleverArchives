"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { SegmentedControl, SegmentOption } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  data: Array<{ name: string; count: number }>;
  unitLabel?: string;
  /** Time range segments */
  segments?: SegmentOption[];
  activeSegment?: string;
  onSegmentChange?: (id: string) => void;
  className?: string;
}

/**
 * ChartCard — Area chart card with optional segmented time-range control.
 * Encapsulates all Recharts configuration and tooltip styling.
 */
export function ChartCard({
  title,
  subtitle,
  icon,
  data,
  unitLabel = "",
  segments,
  activeSegment,
  onSegmentChange,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn("rounded-xl border border-border shadow-sm overflow-hidden bg-white", className)}>
      <CardHeader className="p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <PanelSectionHeader icon={icon} iconVariant="primary" title={title} />
            {subtitle && (
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5 ml-11">{subtitle}</p>
            )}
          </div>

          {segments && activeSegment && onSegmentChange && (
            <SegmentedControl
              options={segments}
              activeId={activeSegment}
              onChange={onSegmentChange}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-8">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="chartCardGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                  <stop offset="50%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border shadow-xl p-3 rounded-xl flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        <span className="font-bold text-sm">{payload[0].value} {unitLabel}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-primary)"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#chartCardGradient)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
