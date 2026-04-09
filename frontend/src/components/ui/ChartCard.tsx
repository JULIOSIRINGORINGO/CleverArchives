import React from "react";
import dynamic from "next/dynamic";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { SegmentedControl, SegmentOption } from "@/components/ui/SegmentedControl";
import { 
  ChartCardRoot, 
  ChartHeaderBox, 
  ChartSubtitle, 
  ChartBodyBox, 
} from "./_components/ChartCardAesthetics";
import { Box } from "@/components/ui/Box";
import { Skeleton } from "@/components/ui/Skeleton";

// Dynamic import for recharts to reduce main bundle size
const DynamicChartWrapper = dynamic(() => import("./_components/DynamicChartWrapper"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-lg" />
});

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
 * Updated: Uses dynamic import for recharts to maintain "local app" performance.
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
        <DynamicChartWrapper data={data} unitLabel={unitLabel} />
      </ChartBodyBox>
    </ChartCardRoot>
  );
}
