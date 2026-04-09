"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Shield, Bell, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFriendlyDistance } from "@/lib/date-utils";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Skeleton } from "@/components/ui/Skeleton";

// Aesthetic Tier
import { SystemEmptyState, SystemUnreadStripe, SystemBadge } from "./SystemAesthetics";
import { ListRow, AvatarIcon } from "@/components/features/messaging/_components/MessagingAesthetics";

const NotificationActions = ({ onDelete }: { onDelete: () => void }) => {
  const t = useTranslations("SystemHub");
  return (
    <Box 
      position="absolute"
      zIndex="10"
      className="top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => e.stopPropagation()}
    >
      <ActionMenu 
        triggerVariant="ghost"
        items={[
          {
            label: t("delete") || "Hapus",
            icon: "trash",
            variant: "danger",
            onClick: onDelete
          }
        ]}
      />
    </Box>
  );
};

interface SystemAlertsProps {
  notifications: any[];
  loading: boolean;
  onOpen: (notif: any) => void;
  onDelete: (id: number) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  dateLocale: any;
}

export function SystemAlerts({
  notifications,
  loading,
  onOpen,
  onDelete,
  onMarkAllRead,
  onClearAll,
  dateLocale,
} : SystemAlertsProps) {
  const t = useTranslations("SystemHub");

  return (
    <Stack spacing="xs">
      {loading ? (
        <Stack spacing="xs">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </Stack>
      ) : notifications.length === 0 ? (
        <SystemEmptyState icon={Bell} message={t("empty_notifs") || "Belum ada notifikasi sistem."} />
      ) : (
        notifications.map((notif) => (
          <ListRow 
            key={notif.id}
            active={false}
            onClick={() => onOpen(notif)}
          >
            <Box display="flex" align="center" spacing="md" width="full" minWidth="0" position="relative">
              <Box position="relative" shrink="0">
                <AvatarIcon background="warning-soft">
                  <IconWrapper 
                    icon="notification" 
                    color="amber" 
                    size="sm"
                    isGhost
                  />
                </AvatarIcon>
                {!notif.read_at && <SystemUnreadStripe />}
              </Box>

              <Box flex="1" overflow="hidden" minWidth="0" display="flex" direction="col" justify="center" gap="xs">
                <Box display="flex" justify="between" align="baseline" width="full" minWidth="0">
                  <Box flex="1" minWidth="0">
                    <Text 
                      variant="body-strong"
                      color="black"
                      lineClamp="1"
                    >
                      {notif.title}
                    </Text>
                  </Box>
                  <Box shrink="0" marginLeft="xs" paddingRight="xl">
                    <Text variant="caption" color="muted" opacity="60">
                      {formatFriendlyDistance(new Date(notif.created_at), { addSuffix: true, locale: dateLocale })}
                    </Text>
                  </Box>
                </Box>
                <Box display="flex" justify="end" width="full" paddingRight="xl">
                  <SystemBadge variant={!notif.read_at ? "primary" : "muted"}>
                    <Text variant="caption">
                      {!notif.read_at ? "NEW" : "READ"}
                    </Text>
                  </SystemBadge>
                </Box>
              </Box>
            </Box>

            <NotificationActions onDelete={() => onDelete(notif.id)} />
          </ListRow>
        ))
      )}
    </Stack>
  );
}
