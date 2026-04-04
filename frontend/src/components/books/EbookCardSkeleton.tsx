import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Divider } from "@/components/ui/Divider";
import { cn } from "@/lib/utils";

export function EbookCardSkeleton({ className }: { className?: string }) {
  return (
    <Card 
      variant="default" 
      padding="none" 
      rounded="3xl" 
      border="soft" 
      className={cn("opacity-40", className)}
    >
      <Stack spacing="none">
        <Box aspect="book" overflow="hidden">
           <Skeleton className="w-full h-full" />
        </Box>
        <Card padding="lg" variant="ghost">
          <Stack spacing="lg" className="min-h-[110px]">
            <Stack spacing="xs">
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </Stack>
            <Stack spacing="none">
              <Divider variant="soft" />
              <div className="pt-4">
                <Skeleton className="h-3 w-1/4 rounded-md" />
              </div>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}
