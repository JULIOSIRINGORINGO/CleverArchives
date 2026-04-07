"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { WorkspacePanelHeader, WorkspacePanelContent } from "@/components/ui/WorkspacePanel";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { SystemSectionHeader, SystemUnreadBadge, SystemListLoading, SystemListEmpty } from "./SystemAesthetics";
import { SystemAlerts } from "./SystemAlerts";
import { SystemHistory } from "./SystemHistory";

interface SystemMasterListProps {
  hub: any;
  onSelectItem: (item: any) => void;
  translations: any;
}

/**
 * SystemMasterList (Level 3 Component)
 * Manages the unified stream of notifications and tickets.
 * SOP v5.6.0 compliance - Decoupled from orchestrator.
 */
export function SystemMasterList({ hub, onSelectItem, translations: t }: SystemMasterListProps) {
  return (
    <Box 
      width="full" 
      flex="1" 
      display="flex" 
      direction="col" 
      minHeight="0" 
      background="surface" 
      rounded="3xl" 
      border="subtle" 
      shadow="sm" 
      overflow="hidden"
    >
      <WorkspacePanelHeader border="bottom" paddingX="lg" paddingY="md">
        <SystemSectionHeader
          iconKey="message"
          title={t("message_list")}
          badge={<SystemUnreadBadge count={hub.unreadCount} />}
          action={
            <ActionMenu 
              triggerVariant="ghost"
              items={[
                {
                  label: t("clear_all"),
                  icon: "trash",
                  variant: "danger",
                  onClick: hub.handleClearAll
                }
              ]}
            />
          }
        />
      </WorkspacePanelHeader>

      <WorkspacePanelContent padding="md" flex="1" overflow="auto">
         <Stack spacing="xs">
           {hub.loading || hub.sentLoading ? (
             <SystemListLoading message={t("loading") || "Memuat..."} />
           ) : hub.unifiedList.length === 0 ? (
             <SystemListEmpty message={t("empty_list") || "Belum ada pesan"} />
           ) : (
              hub.unifiedList.map((item: any) => (
                item.itemType === 'notification' ? (
                  <SystemAlerts 
                    key={`notif-${item.id}`}
                    notifications={[item]}
                    loading={false}
                    onOpen={() => onSelectItem(item)}
                    onDelete={hub.handleDeleteNotif}
                    onMarkAllRead={() => {}} 
                    onClearAll={() => {}}
                    dateLocale={hub.dateFnsLocale}
                  />
                ) : (
                  <SystemHistory 
                    key={`ticket-${item.id}`}
                    messages={[item]}
                    loading={false}
                    onOpen={() => onSelectItem(item)}
                    onClear={() => {}}
                    dateLocale={hub.dateFnsLocale}
                  />
                )
              ))
           )}
         </Stack>
      </WorkspacePanelContent>
    </Box>
  );
}
