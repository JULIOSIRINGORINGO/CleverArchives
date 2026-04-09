"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Calendar, Mail, FileText, Paperclip, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Skeleton } from "@/components/ui/Skeleton";
import { WorkspacePanelContent } from "@/components/ui/WorkspacePanel";

// Aesthetic Tier
import { SystemBadge } from "./SystemAesthetics";
import { AttachmentItem } from "@/components/features/messaging/_components/MessagingAesthetics";

interface SystemDetailViewProps {
  type: 'notification' | 'ticket';
  item: any;
  replies?: any[];
  loading?: boolean;
  onClose?: () => void;
  locale: string;
}

/**
 * Level 3: Local Aesthetic Wrappers
 */
const MessageBody = ({ children, shadow = false }: { children: React.ReactNode, shadow?: boolean }) => (
  <Box 
    padding="xl" 
    background="muted-soft" 
    rounded="2xl" 
    border="subtle" 
    shadow={shadow ? "sm" : "none"}
    className={cn(
      "text-sm leading-relaxed whitespace-pre-wrap transition-all",
      shadow && "shadow-inner"
    )}
  >
    {children}
  </Box>
);

const DetailBackButton = ({ onClick }: { onClick: () => void }) => (
  <Box 
    padding="xs" 
    rounded="lg" 
    transition="all" 
    cursor="pointer"
    marginTop="none"
    className="-mt-1 hover:bg-muted-soft"
    onClick={onClick}
  >
    <IconWrapper 
      icon="chevron-left" 
      size="sm" 
      isGhost 
      opacity="60" 
      className="hover:opacity-100" 
    />
  </Box>
);

const DetailStatus = ({ type, item }: { type: string, item: any }) => (
  <Box shrink="0">
    <StatusBadge 
      status={type === 'ticket' ? item.status : (item.read_at ? 'read' : 'new')} 
      label={type === 'ticket' ? item.status?.replace('_', ' ') : (!item.read_at ? 'new' : 'read')} 
      className={cn(
        type === 'notification' && !item.read_at && "bg-orange-500 shadow-orange-500/20 shadow-lg",
        type === 'notification' && item.read_at && "opacity-40"
      )}
    />
  </Box>
);

export function SystemDetailView({
  type,
  item,
  replies = [],
  loading = false,
  onClose,
  locale
}: SystemDetailViewProps) {
  const t = useTranslations("SystemHub");

  if (!item) {
    return (
      <WorkspacePanelContent display="flex" align="center" justify="center" flex="1">
        <Stack align="center" spacing="md" opacity="40">
          <IconWrapper icon="message" size="xl" isGhost />
          <Text variant="subheading" weight="semibold">
            {t("select_message_placeholder") || "Pilih percakapan untuk dibaca"}
          </Text>
        </Stack>
      </WorkspacePanelContent>
    );
  }

  return (
    <WorkspacePanelContent padding="xl" flex="1" overflow="auto">
      <Stack spacing="xl">
        {/* Header Section */}
        <Box display="flex" align="start" width="full" spacing="sm">
          {onClose && <DetailBackButton onClick={onClose} />}

          <Stack spacing="sm" flex="1">
            <Box display="flex" justify="between" align="baseline" width="full">
              <Heading level="h2" size="md" weight="bold">
                {type === 'notification' ? (item.metadata?.title || item.title) : item.title}
              </Heading>
              
              <DetailStatus type={type} item={item} />
            </Box>
            
            <Inline spacing="sm" align="center">
              <SystemBadge>
                <Inline spacing="xs" align="center">
                  <IconWrapper icon="calendar" size="xs" isGhost opacity="60" />
                  <Text variant="label-xs" color="muted">
                    {new Date(item.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                  </Text>
                </Inline>
              </SystemBadge>
              
              {type === 'notification' && (
                <Text variant="label-xs" color="primary">
                  {item.metadata?.sender_name || "System Administrator"}
                </Text>
              )}
            </Inline>
          </Stack>
        </Box>

        {/* Body Content */}
        <MessageBody shadow={type === 'ticket'}>
          {type === 'notification' 
            ? (item.metadata?.full_body || item.body) 
            : item.body
          }
        </MessageBody>

        {/* Attachments (Tickets only) */}
        {type === 'ticket' && item.attachments && item.attachments.length > 0 && (
          <Stack spacing="xs">
            <Inline spacing="xs" align="center">
              <IconWrapper icon="paperclip" size="xs" variant="primary" isGhost opacity="60" />
              <Heading level="h4" size="xs" weight="semibold">
                {t("attachment_label")} ({item.attachments.length})
              </Heading>
            </Inline>
            <Inline spacing="xs" wrap>
              {item.attachments.map((file: any) => (
                <AttachmentItem key={file.id} file={file} />
              ))}
            </Inline>
          </Stack>
        )}

        {/* Replies Section (Tickets only) */}
        {type === 'ticket' && (
          <Stack spacing="md">
            <Inline spacing="xs" align="center">
              <IconWrapper icon="message" size="xs" variant="primary" isGhost opacity="60" />
              <Heading level="h4" size="xs" weight="semibold">
                {t("replies")} ({replies.length})
              </Heading>
            </Inline>

            {loading ? (
              <Stack spacing="sm">
                {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </Stack>
            ) : replies.length === 0 ? (
              <Box padding="lg" background="muted-soft" border="dashed" rounded="xl" display="flex" align="center" justify="center" opacity="40">
                <Text variant="label-xs" weight="medium" color="muted">
                  {t("no_replies")}
                </Text>
              </Box>
            ) : (
              <Stack spacing="sm">
                {replies.map((reply: any) => (
                  <Card 
                    key={reply.id} 
                    padding="md" 
                    background="primary-soft" 
                    rounded="xl" 
                    border="subtle"
                  >
                    <Inline justify="between" align="center" width="full" paddingBottom="xs">
                        <Text variant="label-xs" weight="semibold" color="primary">
                          {reply.user_name || "Support Team"}
                        </Text>
                      <Text variant="caption" color="muted" opacity="60">
                        {new Date(reply.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                      </Text>
                    </Inline>
                    <Text variant="body-compact" color="muted">
                      {reply.body}
                    </Text>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </WorkspacePanelContent>
  );
}
