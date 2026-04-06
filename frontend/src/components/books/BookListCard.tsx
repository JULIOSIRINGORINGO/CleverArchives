"use client";

import { BookOpen } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { IconWrapper, AppIconName } from "@/components/ui/IconWrapper";
import { cn } from "@/lib/utils";

interface BookListCardProps {
  coverUrl?: string;
  title: string;
  author: string;
  category?: string;
  status: string;
  metadata: {
    label: string;
    value: string;
    icon: AppIconName;
    iconColor?: string;
  }[];
  action?: React.ReactNode;
  className?: string;
  isCompact?: boolean;
  typeIcon?: AppIconName;
  typeLabel?: string;
}

/**
 * BookListCard - Standardized horizontal card for book lists (History, Borrowed).
 * Refactored to use IconWrapper for consistent typography and icons.
 */
export function BookListCard({
  coverUrl,
  title,
  author,
  category,
  status,
  metadata,
  action,
  className,
  isCompact = false,
  typeIcon,
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
          {typeIcon && (
            <IconWrapper 
              icon={typeIcon} 
              size="xs" 
              className="shrink-0 transition-transform group-hover/card:scale-110" 
            />
          )}

          {/* 1-Line Table Row */}
          <Inline justify="between" spacing="lg" flex="1" className="min-w-0">
            <Box flex="1" className="min-w-0">
              <Stack spacing="none" className="min-w-0">
                <Text 
                  variant="subheading" 
                  weight="bold" 
                  tracking="tight" 
                  className="line-clamp-1"
                >
                  {title}
                </Text>
                <Text 
                  variant="caption" 
                  italic 
                  className="text-muted-foreground opacity-90 line-clamp-1"
                >
                  {author}
                </Text>
              </Stack>
            </Box>

            <Inline justify="end" spacing="xl" flex="1" className="shrink-0">
              <Box className="hidden lg:block">
                <Inline spacing="lg">
                  {metadata.map((item, idx) => (
                    <Inline key={idx} spacing="xs" align="center">
                      <IconWrapper 
                        icon={item.icon} 
                        size="xs" 
                        isGhost 
                        opacity="60" 
                        color="primary" 
                      />
                      <Text 
                        variant="caption" 
                        weight="bold" 
                        className="whitespace-nowrap"
                      >
                        {item.value}
                      </Text>
                    </Inline>
                  ))}
                </Inline>
              </Box>
              
              <Inline spacing="lg" align="center">
                {category && <CategoryBadge label={category} className="hidden sm:flex" />}
                <StatusBadge status={status} />
                {action && <Box>{action}</Box>}
              </Inline>
            </Inline>
          </Inline>
        </Inline>
      </Box>
    );
  }

  // Standard View (Zero ClassName Compliant Typography)
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
      <Inline spacing="lg" align="start" flex="1">
        {/* Type Indicator + Book Cover Container */}
        <Inline spacing="lg" align="center" className="shrink-0">
          {typeIcon && (
            <IconWrapper 
              icon={typeIcon} 
              size="md" 
              className="shrink-0 transition-transform group-hover/card:scale-110" 
            />
          )}

          <Box 
            rounded="xl"
            border="subtle"
            background="muted-soft"
            className="w-16 sm:w-18 aspect-[3.2/4] overflow-hidden shrink-0 transition-transform duration-700 group-hover:scale-105"
          >
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Box className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <BookOpen size={24} />
              </Box>
            )}
          </Box>
        </Inline>

        {/* Content Section */}
        <Inline flex="1" align="center" justify="between" spacing="lg" wrap className="w-full">
          <Box className="md:w-[40%]">
            <Stack spacing="xs">
              {category && <CategoryBadge label={category} className="h-6 px-2 text-[9px] w-fit" />}
              <Text 
                as="h4" 
                variant="heading" 
                weight="bold" 
                tracking="tight" 
                className="group-hover:text-primary transition-colors duration-300 line-clamp-1"
              >
                {title}
              </Text>
              <Text 
                variant="subheading" 
                weight="medium" 
                italic
                className="text-muted-foreground truncate"
              >
                {author}
              </Text>
            </Stack>
          </Box>

          {/* Metadata Grid (Systematic with IconWrapper) */}
          <Inline flex="1" spacing="xl" wrap className="gap-y-1">
            {metadata.map((item, idx) => (
              <Stack key={idx} spacing="none">
                <Text 
                  variant="label-xs" 
                  weight="bold" 
                  tracking="tight" 
                  className="text-muted-foreground/60 mb-1"
                >
                  {item.label}
                </Text>
                <Inline spacing="xs" align="center">
                  <IconWrapper 
                    icon={item.icon} 
                    size="xs" 
                    isGhost 
                    opacity="60" 
                    color="primary" 
                  />
                  <Text 
                    variant="subheading" 
                    weight="bold" 
                    tracking="tight"
                  >
                    {item.value}
                  </Text>
                </Inline>
              </Stack>
            ))}
          </Inline>

          {/* Dynamic Action Section */}
          <Inline 
            justify="end" 
            align="center" 
            spacing="lg" 
            className={cn(
              "shrink-0 w-full md:w-auto md:pl-4",
              status && action && "md:border-l md:border-border/10"
            )}
          >
            {status && <StatusBadge status={status} className={cn(action && "hidden sm:flex")} />}
            {action && <Box className="shrink-0">{action}</Box>}
          </Inline>
        </Inline>
      </Inline>
    </Box>
  );
}

/**
 * Static Skeleton for consistent loading states.
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
