"use client";

import { LucideIcon, ArrowUpRight, BookOpen } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

interface BookListCardProps {
  coverUrl?: string;
  title: string;
  author: string;
  status: string;
  metadata: {
    label: string;
    value: string;
    icon: LucideIcon;
    iconColor?: string;
  }[];
  action?: React.ReactNode;
  className?: string;
  isCompact?: boolean;
  typeIcon?: LucideIcon;
  typeLabel?: string;
}

/**
 * BookListCard - A standardized horizontal card for book lists (History, Borrowed).
 * Ensures consistency across the dashboard and avoids "manual" design repeating.
 */
export function BookListCard({
  coverUrl,
  title,
  author,
  status,
  metadata,
  action,
  className,
  isCompact = false,
  typeIcon: TypeIcon,
  typeLabel
}: BookListCardProps) {
  if (isCompact) {
    return (
      <Box 
        background="white"
        border="subtle"
        rounded="xl"
        shadow="sm"
        padding="none"
        className={cn(
          "group/card transition-all duration-300 relative overflow-hidden px-5 py-2.5",
          className
        )}
      >
        <Inline spacing="lg" align="center" flex="1">
          {/* Compact Type Icon */}
          {TypeIcon && (
            <Box 
              background="primary-soft"
              rounded="lg"
              className="w-8 h-8 flex items-center justify-center text-primary shrink-0 transition-transform group-hover/card:scale-110"
            >
              <TypeIcon size={16} strokeWidth={2.5} />
            </Box>
          )}

          {/* 1-Line Table Row */}
          <Inline justify="between" spacing="lg" flex="1" className="min-w-0">
            <Box flex="1" className="min-w-0">
              <Stack spacing="none" className="min-w-0">
                <Text variant="subheading" weight="bold" tracking="tight" className="text-slate-800 truncate">
                  {title}
                </Text>
                <Text variant="caption" weight="medium" className="text-slate-500 italic truncate opacity-90">
                  {author}
                </Text>
              </Stack>
            </Box>

            <Inline justify="end" spacing="xl" flex="1" className="shrink-0">
              <Box className="hidden lg:block">
                <Inline spacing="lg">
                  {metadata.map((item, idx) => (
                    <Inline key={idx} spacing="xs" align="center">
                      <Box background="muted-soft" rounded="md" className="w-6 h-6 flex items-center justify-center text-indigo-600">
                        <item.icon size={12} strokeWidth={2.5} />
                      </Box>
                      <Text variant="caption" weight="bold" className="text-slate-800 whitespace-nowrap">
                        {item.value}
                      </Text>
                    </Inline>
                  ))}
                </Inline>
              </Box>
              
              <Inline spacing="lg" align="center">
                <StatusBadge status={status} className="scale-90 origin-right transition-transform group-hover/card:scale-100" />
                {action && <Box className="scale-90 origin-right -ml-2">{action}</Box>}
              </Inline>
            </Inline>
          </Inline>
        </Inline>
      </Box>
    );
  }

  // Standard View (Ultra-Precise Spacing)
  return (
    <Box 
      background="white"
      border="subtle"
      rounded="xl"
      shadow="sm"
      className={cn(
        "group/card transition-all duration-300 relative overflow-hidden h-fit hover:shadow-xl p-4 sm:p-5",
        className
      )}
    >
      <Inline spacing="lg" align="center" flex="1">
        {/* Type Indicator + Book Cover Container */}
        <Inline spacing="lg" align="center" className="shrink-0">
          {/* Integrated Type Icon */}
          {TypeIcon && (
            <Box 
              background="primary-soft"
              rounded="xl"
              border="subtle"
              shadow="sm"
              className="w-10 h-10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover/card:scale-110"
            >
              <TypeIcon size={20} strokeWidth={2.5} />
            </Box>
          )}

          <Box 
            rounded="xl"
            border="subtle"
            background="muted-soft"
            className="w-16 sm:w-18 aspect-[3.2/4] overflow-hidden shrink-0 transition-transform duration-700 group-hover/card:scale-105"
          >
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Box className="w-full h-full flex items-center justify-center text-slate-300">
                <BookOpen size={24} />
              </Box>
            )}
          </Box>
        </Inline>

        {/* Tight Content Section with Large Readability */}
        <Inline flex="1" align="center" justify="between" spacing="lg" wrap className="w-full">
          <Box className="md:w-[40%]">
            <Text 
              as="h4" 
              variant="heading" 
              weight="bold" 
              tracking="tight" 
              className="group-hover/card:text-primary transition-colors duration-300 line-clamp-1"
            >
              {title}
            </Text>
            <Text variant="subheading" weight="medium" className="text-slate-500 italic truncate">
              {author}
            </Text>
          </Box>

          <Inline flex="1" spacing="xl" wrap className="gap-y-1">
            {metadata.map((item, idx) => (
              <Stack key={idx} spacing="none">
                <Text variant="caption" weight="bold" tracking="tight" className="text-slate-500 mb-1">
                  {item.label}
                </Text>
                <Inline spacing="xs" align="center">
                  <item.icon size={12} className="text-indigo-600" />
                  <Text variant="subheading" weight="bold" tracking="tight" className="text-slate-900">
                    {item.value}
                  </Text>
                </Inline>
              </Stack>
            ))}
          </Inline>

          <Inline 
            justify="between" 
            align="center" 
            spacing="lg" 
            className={cn(
              "shrink-0 w-full md:w-auto pl-4 h-11",
              status && action && "border-l border-border/10"
            )}
          >
            {status && <StatusBadge status={status} className={cn("scale-100", action && "hidden sm:flex")} />}
            {action && <Box className="shrink-0">{action}</Box>}
          </Inline>
        </Inline>
      </Inline>
    </Box>
  );
}

/**
 * Static Skeleton for consistent loading states across pages.
 */
BookListCard.Skeleton = function BookListCardSkeleton({ count = 3, isCompact = false }: { count?: number; isCompact?: boolean }) {
  return (
    <Stack spacing="lg" className={cn(!isCompact && "pt-6 pb-12")}>
      {Array.from({ length: count }).map((_, i) => (
        <Box 
          key={i} 
          background="white"
          border="subtle"
          shadow="sm"
          className={cn(
            "animate-pulse",
            isCompact ? "h-14 rounded-xl" : "h-32 rounded-[2.2rem]"
          )} 
        />
      ))}
    </Stack>
  );
};
