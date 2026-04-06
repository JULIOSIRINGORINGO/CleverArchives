import React from "react";
import { TrendingUp } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { SegmentedControl, SegmentOption } from "@/components/ui/SegmentedControl";
import { 
  ChartCardRoot, 
  ChartHeaderBox, 
  ChartSubtitle, 
  ChartBodyBox, 
  ChartTooltipRoot, 
  ChartGradientDef 
} from "./_components/ChartCardAesthetics";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";

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
 * Strictly follows SOP v5.6.0 with isolated aesthetics and Zero ClassName.
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
}: ChartCardProps) {
  const GRADIENT_ID = "clever-reading-activity-gradient";

  return (
    <ChartCardRoot>
      <ChartHeaderBox>
        <Box flex="1">
          <PanelSectionHeader icon={icon} iconVariant="primary" title={title} />
          {subtitle && (
            <ChartSubtitle>{subtitle}</ChartSubtitle>
          )}
        </Box>

        {segments && activeSegment && onSegmentChange && (
          <SegmentedControl
            options={segments}
            activeId={activeSegment}
            onChange={onSegmentChange}
          />
        )}
      </ChartHeaderBox>

      <ChartBodyBox>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
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
                    <ChartTooltipRoot>
                      <TrendingUp size={16} className="text-primary" />
                      <Text variant="caption" weight="black" color="black">
                        {payload[0].value} {unitLabel}
                      </Text>
                    </ChartTooltipRoot>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={4}
              fillOpacity={1}
              fill={`url(#${GRADIENT_ID})`}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartBodyBox>
    </ChartCardRoot>
  );
}
