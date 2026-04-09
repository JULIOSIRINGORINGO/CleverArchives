import React from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { ChartTooltipRoot, ChartGradientDef } from "./ChartCardAesthetics";

interface DynamicChartWrapperProps {
  data: Array<{ name: string; count: number }>;
  unitLabel?: string;
}

export default function DynamicChartWrapper({ data, unitLabel = "" }: DynamicChartWrapperProps) {
  const GRADIENT_ID = "clever-reading-activity-gradient";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <ChartGradientDef id={GRADIENT_ID} />
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
                  <Box className="text-primary">
                    <TrendingUp size={16} />
                  </Box>
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
  );
}
