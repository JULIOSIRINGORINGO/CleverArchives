"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Clock, MoreVertical, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFriendlyDistance } from "@/lib/date-utils";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Skeleton } from "@/components/ui/Skeleton";

// Aesthetic Tier
import { SystemEmptyState, SystemBadge } from "./SystemAesthetics";
import { ListRow, AvatarIcon } from "@/components/features/messaging/_components/MessagingAesthetics";

interface SystemHistoryProps {
  messages: any[];
  loading: boolean;
  onOpen: (msg: any) => void;
  onClear: () => void;
  dateLocale: any;
}

export function SystemHistory({
  messages,
  loading,
  onOpen,
  onClear,
  dateLocale,
}: SystemHistoryProps) {
  const t = useTranslations("SystemHub");

  return (
    <Stack spacing="xs">
      {loading ? (
        <Stack spacing="xs">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </Stack>
      ) : messages.length === 0 ? (
        <SystemEmptyState icon={Mail} message={t("no_sent_history") || "Belum ada riwayat bantuan."} />
      ) : (
        messages.map((msg) => (
          <ListRow 
            key={msg.id}
            active={false}
            onClick={() => onOpen(msg)}
          >
            <Box display="flex" align="center" spacing="md" width="full" minWidth="0">
              <Box position="relative" shrink="0">
                <AvatarIcon background="warning-soft">
                  <IconWrapper 
                    icon="history" 
                    color="amber" 
                    size="sm"
                    isGhost
                  />
                </AvatarIcon>
              </Box>

              <Box flex="1" overflow="hidden" minWidth="0" display="flex" direction="col" justify="center" gap="xs">
                <Box display="flex" justify="between" align="baseline" width="full" minWidth="0">
                  <Box flex="1" minWidth="0">
                    <Text 
                      weight="bold" 
                      variant="body-strong"
                      color="black"
                      lineClamp="1"
                    >
                      {msg.title || msg.subject || "Pesan Sistem"}
                    </Text>
                  </Box>
                  <Box shrink="0" marginLeft="xs">
                    <Text variant="caption" color="muted" opacity="60">
                      {formatFriendlyDistance(new Date(msg.created_at), { addSuffix: true, locale: dateLocale })}
                    </Text>
                  </Box>
                </Box>
                <Box display="flex" justify="end" width="full">
                  <SystemBadge variant={msg.status === 'open' ? "primary" : "muted"}>
                    <Text variant="caption" weight="bold">
                      {(msg.itemType === 'notification' && !msg.read_at) ? "NEW" : (msg.status?.toUpperCase().replace('_', ' ') || "DONE")}
                    </Text>
                  </SystemBadge>
                </Box>
              </Box>
            </Box>
          </ListRow>
        ))
      )}
    </Stack>
  );
}
