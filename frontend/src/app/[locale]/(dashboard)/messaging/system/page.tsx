"use client";

import React from "react";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { useTranslations } from "next-intl";

// Logic Tier
import { useSystemHub } from "@/hooks/useSystemHub";

// UI Primitives
import { WorkspacePanel, WorkspacePanelHeader } from "@/components/ui/WorkspacePanel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Aesthetics Tier (Level 2)
import {
  SystemLayout,
  SystemMainPanel,
  SystemSidePanel,
  SystemSectionHeader
} from "./_components/SystemAesthetics";

// Components Tier (Level 3)
import { SystemNavigation } from "./_components/SystemNavigation";
import { SystemMasterList } from "./_components/SystemMasterList";
import { SystemCompose } from "./_components/SystemCompose";
import { SystemDetailView } from "./_components/SystemDetailView";

export default function SystemCommunicationPage() {
  const t = useTranslations("SystemHub");
  const hub = useSystemHub();

  return (
    <DashboardPage title={t("system_alerts")} hideHeader={true} hideScroll={true}>
      <SystemLayout>
        {/* Left Sidebar: Navigation + Master List */}
        <SystemSidePanel>
          <SystemNavigation
            layoutMode={hub.layoutMode}
            setLayoutMode={hub.setLayoutMode}
            translations={t}
          />
          <SystemMasterList
            hub={hub}
            onSelectItem={hub.handleSelectItem}
            translations={t}
          />
        </SystemSidePanel>

        {/* Right Panel: Viewport Area (Detail) */}
        <SystemMainPanel>
          <WorkspacePanel
            fullHeight
            border="subtle"
            rounded="3xl"
            background="surface"
            display="flex"
            direction="col"
            minHeight="0"
            overflow="hidden"
          >
            {hub.layoutMode === 'compose' ? (
              <>
                <WorkspacePanelHeader border="bottom" paddingX="lg" paddingY="md">
                  <SystemSectionHeader iconKey="send" title={t("compose_title")} />
                </WorkspacePanelHeader>
                <SystemCompose submitting={hub.submitting} onSendMessage={hub.handleSendMessage} />
              </>
            ) : (
              <SystemDetailView
                type={hub.selectedNotif ? 'notification' : 'ticket'}
                item={hub.selectedNotif || hub.selectedTicket}
                replies={hub.ticketReplies}
                loading={hub.ticketLoading}
                onClose={() => {
                  hub.setSelectedNotif(null);
                  hub.setSelectedTicket(null);
                }}
                locale={hub.locale}
              />
            )}
          </WorkspacePanel>
        </SystemMainPanel>
      </SystemLayout>

      {/* Confirmation Dialogs Only */}
      <ConfirmDialog
        isOpen={hub.deleteConfirmOpen}
        onClose={() => hub.setDeleteConfirmOpen(false)}
        onConfirm={hub.confirmDeleteNotif}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={hub.clearConfirmOpen}
        onClose={() => hub.setClearConfirmOpen(false)}
        onConfirm={hub.confirmClearAll}
        title={t("clear_confirm_title")}
        description={t("clear_confirm_desc")}
        confirmLabel={t("clear_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />
    </DashboardPage>
  );
}
