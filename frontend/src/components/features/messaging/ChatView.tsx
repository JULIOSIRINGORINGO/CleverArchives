"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { ChatPanel } from "./ChatPanel";

import { Locale } from "date-fns";

interface ChatViewProps {
  selectedThread: any;
  messages: any[];
  currentUserId: number | string;
  onSend: (text: string) => void;
  onClearChat: () => void;
  loading: boolean;
  sending: boolean;
  translations: any;
  subtitle?: string;
  onBack?: () => void;
  dateFnsLocale: Locale;
}

export function ChatView({
  selectedThread,
  messages,
  currentUserId,
  onSend,
  onClearChat,
  loading,
  sending,
  translations: t,
  subtitle,
  onBack,
  dateFnsLocale
}: ChatViewProps) {
  if (!selectedThread) {
    return (
      <Box
        variant="fill-remaining"
        align="center"
        justify="center"
        padding="xl"
        background="white"
        border="subtle"
        rounded="3xl"
        shadow="sm"
        display="hidden"
        mdDisplay="flex"
      >
        <Stack spacing="lg" align="center" opacity="40" maxWidth="md" centered>
          <IconWrapper
            icon="message"
            size="xl"
            isGhost
          />
          <Stack spacing="xs" align="center">
            <Text variant="heading" textAlign="center">
              {t("choose_conversation")}
            </Text>
            <Text variant="caption-muted" textAlign="center">
              {t("choose_conversation_desc")}
            </Text>
          </Stack>
          <Box paddingTop="lg">
            <Inline spacing="xs" align="center">
              <IconWrapper preset="security-note" />
              <Text variant="caption-muted">{t("security_note")}</Text>
            </Inline>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box variant="fill-remaining" direction="col">
      <ChatPanel
        title={selectedThread.partnerName}
        subtitle={subtitle || t("online")}
        messages={messages}
        currentUserId={currentUserId}
        onSend={onSend}
        onClearChat={onClearChat}
        onBack={onBack}
        loading={loading}
        sending={sending}
        placeholder={t("type_message_placeholder")}
        dateFnsLocale={dateFnsLocale}
      />
    </Box>
  );
}
