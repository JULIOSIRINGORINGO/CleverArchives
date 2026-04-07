"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Megaphone, X, Calendar, Shield, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text as UIText } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

// Aesthetic Tier
import { SystemBadge } from "./SystemAesthetics";
import { AttachmentItem } from "@/components/features/messaging/_components/MessagingAesthetics";

/**
 * Level 3: Local Aesthetic Wrappers
 */
const MessageBody = ({ children, shadow = false }: { children: React.ReactNode, shadow?: boolean }) => (
  <Box 
    padding="xl" 
    background="muted-soft" 
    rounded="2xl" 
    border="subtle" 
    className={cn(
      "text-sm leading-relaxed whitespace-pre-wrap",
      shadow && "shadow-inner"
    )}
  >
    {children}
  </Box>
);

interface SystemDetailModalsProps {
  selectedNotif: any | null;
  onCloseNotif: () => void;
  selectedTicket: any | null;
  onCloseTicket: () => void;
  ticketReplies: any[];
  ticketLoading: boolean;
  deleteConfirmOpen: boolean;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  clearConfirmOpen: boolean;
  onCloseClear: () => void;
  onConfirmClear: () => void;
  locale: string;
}

export function SystemDetailModals({
  selectedNotif,
  onCloseNotif,
  selectedTicket,
  onCloseTicket,
  ticketReplies,
  ticketLoading,
  deleteConfirmOpen,
  onCloseDelete,
  onConfirmDelete,
  clearConfirmOpen,
  onCloseClear,
  onConfirmClear,
  locale
}: SystemDetailModalsProps) {
  const t = useTranslations("SystemHub");

  return (
    <>
      {/* Notification Detail Modal */}
      <Modal isOpen={!!selectedNotif} onClose={onCloseNotif} variant="lg">
        {selectedNotif && (
          <>
            <WorkspacePanelHeader border="bottom">
              <Inline spacing="md" align="center">
                <IconWrapper icon="notification" variant="primary" size="md" />
                <Stack spacing="none">
                  <Heading level="h3" size="xs" weight="semibold">
                    {t("detail_announcement")}
                  </Heading>
                  <UIText variant="label-xs" color="muted">
                    System Hub
                  </UIText>
                </Stack>
              </Inline>
              <Button variant="ghost" size="icon" rounded="full" onClick={onCloseNotif}>
                <IconWrapper icon="close" size="xs" variant="muted" />
              </Button>
            </WorkspacePanelHeader>
            
            <WorkspacePanelContent padding="xl">
              <Stack spacing="lg">
                <Stack spacing="sm">
                  <Heading level="h2" size="md" weight="semibold">
                    {selectedNotif.metadata?.title || selectedNotif.title}
                  </Heading>
                  <Inline spacing="sm" align="center">
                    <SystemBadge>
                      <Inline spacing="xs" align="center">
                        <IconWrapper icon="calendar" size="xs" variant="muted" isGhost />
                        <UIText variant="label-xs" color="muted">
                          {new Date(selectedNotif.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                        </UIText>
                      </Inline>
                    </SystemBadge>
                    <UIText variant="label" color="muted" opacity="40">/ </UIText>
                    <UIText variant="label-xs" color="primary">
                      {selectedNotif.metadata?.sender_name || "System"}
                    </UIText>
                  </Inline>
                </Stack>

                <MessageBody>
                  {selectedNotif.metadata?.full_body || selectedNotif.body}
                </MessageBody>
              </Stack>
            </WorkspacePanelContent>

            <WorkspacePanelFooter border="top" display="flex" justify="end">
              <Button onClick={onCloseNotif} variant="secondary" rounded="xl">
                {t("close")}
              </Button>
            </WorkspacePanelFooter>
          </>
        )}
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal isOpen={!!selectedTicket} onClose={onCloseTicket} variant="lg">
        {selectedTicket && (
          <>
            <WorkspacePanelHeader border="bottom">
              <Inline spacing="md" align="center">
                <IconWrapper icon="mail" variant="warning" size="md" />
                <Stack spacing="none">
                  <Heading level="h3" size="xs" weight="semibold">
                    {t("ticket_detail")}
                  </Heading>
                  <UIText variant="label-xs" color="muted">
                    Support Case
                  </UIText>
                </Stack>
              </Inline>
              <Button variant="ghost" size="icon" rounded="full" onClick={onCloseTicket}>
                <IconWrapper icon="close" size="xs" variant="muted" />
              </Button>
            </WorkspacePanelHeader>

            <WorkspacePanelContent padding="xl">
              <Stack spacing="xl">
                <Stack spacing="sm">
                  <Heading level="h2" size="sm" weight="bold">
                    {selectedTicket.title}
                  </Heading>
                  <Inline spacing="sm" align="center">
                    <SystemBadge>
                      <UIText variant="label-xs" color="muted">
                        {new Date(selectedTicket.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                      </UIText>
                    </SystemBadge>
                    <StatusBadge status={selectedTicket.status} label={selectedTicket.status?.replace('_', ' ')} />
                  </Inline>
                </Stack>

                <MessageBody shadow>
                  {selectedTicket.body}
                </MessageBody>

                {/* Attachments Section */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <Stack spacing="xs">
                    <Inline spacing="xs" align="center">
                      <IconWrapper icon="paperclip" size="xs" variant="primary" isGhost opacity="60" />
                      <Heading level="h4" size="xs" weight="semibold">
                        {t("attachment_label")} ({selectedTicket.attachments.length})
                      </Heading>
                    </Inline>
                    <Inline spacing="xs" wrap>
                      {selectedTicket.attachments.map((file: any) => (
                        <AttachmentItem key={file.id} file={file} />
                      ))}
                    </Inline>
                  </Stack>
                )}

                <Stack spacing="md">
                  <Inline spacing="xs" align="center">
                    <IconWrapper icon="message" size="xs" variant="primary" isGhost opacity="60" />
                    <Heading level="h4" size="xs" weight="semibold">
                      {t("replies")} ({ticketReplies.length})
                    </Heading>
                  </Inline>

                  {ticketLoading ? (
                    <Stack spacing="sm">
                      {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                    </Stack>
                  ) : ticketReplies.length === 0 ? (
                    <Box padding="lg" background="muted-soft" border="dashed" rounded="xl" display="flex" align="center" justify="center" opacity="60">
                      <UIText variant="label-xs" color="muted">
                        {t("no_replies")}
                      </UIText>
                    </Box>
                  ) : (
                    <Stack spacing="sm">
                      {ticketReplies.map((reply) => (
                        <Card 
                          key={reply.id} 
                          padding="md" 
                          background="primary-soft" 
                          rounded="xl" 
                          border="subtle"
                        >
                          <Inline justify="between" align="center" width="full" paddingBottom="xs">
                            <UIText variant="label-xs" color="primary">
                              {reply.user_name || "Support Team"}
                            </UIText>
                            <UIText variant="caption" color="muted" opacity="60">
                              {new Date(reply.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                            </UIText>
                          </Inline>
                          <UIText variant="body-compact" color="muted">
                            {reply.body}
                          </UIText>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </WorkspacePanelContent>

            <WorkspacePanelFooter border="top" display="flex" justify="end">
              <Button onClick={onCloseTicket} variant="secondary" rounded="xl">
                {t("close")}
              </Button>
            </WorkspacePanelFooter>
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={onCloseClear}
        onConfirm={onConfirmClear}
        title={t("clear_confirm_title")}
        description={t("clear_confirm_desc")}
        confirmLabel={t("clear_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />
    </>
  );
}
