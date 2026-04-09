"use client";

import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Loader2 } from "lucide-react";
import { Text } from "@/components/ui/Text";

export default function DashboardGlobalLoading() {
  return (
    <Box 
      className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-300"
    >
      <Stack align="center" spacing="md" className="opacity-60">
        <IconWrapper size="lg" isGhost color="primary">
          <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
        </IconWrapper>
        <Text variant="subheading" weight="medium" color="muted">
          Menyiapkan Workspace...
        </Text>
      </Stack>
    </Box>
  );
}
