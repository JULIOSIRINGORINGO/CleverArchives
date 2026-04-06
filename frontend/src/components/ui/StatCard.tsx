"use client";

import React from "react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { 
  StatCardRoot, 
  StatIconBox, 
  ProgressBarRoot, 
  ProgressBarIndicator, 
  StatLabel, 
  StatTrend,
  StatCardVariant 
} from "./_components/StatCardAesthetics";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";


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
} & (StatCardGoalProps | StatCardDefaultProps);


/**
 * StatCard — Premium Gradient KPI card with Zero ClassName implementation.
 * Strictly follows SOP v5.6.0 with isolated aesthetics and primitive layout.
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
}: StatCardProps) {
  return (
    <StatCardRoot variant={variant}>
      <Box padding="lg" position="relative" zIndex="10" height="full" display="flex" direction="col">
        {/* Top row: Title + Icon */}
        <Box display="flex" align="start" justify="between" width="full">
          <Box flex="1" minWidth="0">
            <Text 
              variant="heading" 
              weight="black" 
              color="white" 
              opacity="100" 
              className="text-xl tracking-tight capitalize drop-shadow-sm"
            >
              {title}
            </Text>
          </Box>
          <StatIconBox>
            <Icon size={20} strokeWidth={2.5} />
          </StatIconBox>
        </Box>

        {/* Center content: Massive Value */}
        <Box display="flex" direction="col" align="center" justify="center" flex="1">
          {loading ? (
            <Skeleton className="h-20 w-32 bg-white/20 rounded-xl" />
          ) : (
            <Box display="flex" align="baseline" gap="xs">
              <Text 
                variant="heading" 
                weight="black" 
                color="white" 
                className="text-8xl tabular-nums drop-shadow-2xl select-none"
              >
                {value}
              </Text>
              {isGoal && target && (
                <Text 
                  variant="body-strong" 
                  weight="black" 
                  color="white" 
                  opacity="40" 
                  className="text-2xl"
                >
                  / {target}
                </Text>
              )}
            </Box>
          )}
        </Box>

        {/* Bottom row: progress bar or trend */}
        <Box marginTop="auto">
          {isGoal ? (
            <Box spacing="none">
              <Box display="flex" justify="between" marginBottom="xs">
                <Text variant="label" weight="black" color="white" opacity="80" className="text-xs tracking-wider">
                  {Math.round(progress || 0)}% {completedLabel}
                </Text>
                <Text variant="label" weight="black" color="white" opacity="60" className="text-[10px] tracking-wider">
                  {targetLabel}: {target}
                </Text>
              </Box>
              <ProgressBarRoot>
                <ProgressBarIndicator progress={progress || 0} />
              </ProgressBarRoot>
            </Box>
          ) : (
            <Box display="flex" align="center" justify="between" width="full">
              <Box display="flex" align="center" gap="sm">
                <Box width="2" height="2" rounded="full" background="white" opacity="100" className="animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <Text 
                  variant="body-strong" 
                  weight="black" 
                  color="white" 
                  opacity="100" 
                  className="uppercase tracking-widest text-[11px] drop-shadow-md"
                >
                  {trend}
                </Text>
              </Box>
              <Box className="group-hover:translate-x-1 transition-transform opacity-60">
                <ArrowUpRight size={16} strokeWidth={3} className="text-white" />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </StatCardRoot>
  );
}
