"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { isSameDay } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { ChatBubble } from "./ChatBubble";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text as UIText } from "@/components/ui/Text";
import { Locale } from "date-fns";

interface Message {
  id: number | string;
  title?: string;
  body: string;
  sender_name?: string;
  sender_id: number | string;
  recipient_type?: string;
  recipient_name?: string | null;
  recipient_id?: number | string | null;
  sender_last_seen?: string | null;
  recipient_last_seen?: string | null;
  created_at: string;
  isOptimistic?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: number | string;
  loading?: boolean;
  activeMatchId?: number | string | null;
  className?: string;
  dateFnsLocale: Locale;
}

export function MessageList({ 
  messages, 
  currentUserId,
  loading = false,
  activeMatchId = null,
  dateFnsLocale
}: MessageListProps) {
  const t = useTranslations("Messaging");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || loading) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  if (loading) {
    return (
      <Stack 
        spacing="lg" 
        padding="lg" 
        flex="1" 
        justify="end"
        animation="pulse"
        overflow="hidden"
        minHeight="0"
      >
        {[1, 2, 3, 4].map(i => (
          <Box 
            key={i} 
            width="md" 
            height="14" 
            background="muted-soft" 
            rounded="2xl" 
            alignSelf={i % 2 === 0 ? "end" : "start"}
          />
        ))}
      </Stack>
    );
  }

  if (messages.length === 0) {
    return (
      <Stack 
        flex="1" 
        align="center" 
        justify="center" 
        padding="xl"
        spacing="md"
        opacity="40"
      >
        <IconWrapper icon="message" size="xl" isGhost />
        <Stack spacing="none" align="center">
          <UIText variant="heading" color="black">
            {t("no_messages")}
          </UIText>
          <UIText variant="caption-muted" italic>
            {t("start_conversation")}
          </UIText>
        </Stack>
      </Stack>
    );
  }

  return (
    <Box 
      ref={scrollContainerRef}
      flex="1" 
      display="flex"
      direction="col"
      padding="lg"
      background="white"
      overflowY="auto"
      overflowX="hidden"
      height="full"
      scrollbar="custom"
    >
      <Stack spacing="sm" width="full">
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const showDivider = !prevMsg || !isSameDay(new Date(msg.created_at), new Date(prevMsg.created_at));

          return (
            <React.Fragment key={msg.id}>
              {showDivider && (
                <Inline 
                  width="full" 
                  align="center" 
                  justify="center"
                  marginTop="lg"
                  marginBottom="lg"
                >
                  <Box flex="1" height="px" background="muted-soft" />
                  <Box paddingX="md">
                    <UIText variant="caption-muted" color="muted" selectNone>
                      {new Date(msg.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </UIText>
                  </Box>
                  <Box flex="1" height="px" background="muted-soft" />
                </Inline>
              )}
              <ChatBubble 
                message={msg} 
                currentUserId={currentUserId}
                isActiveMatch={activeMatchId === msg.id}
              />
            </React.Fragment>
          );
        })}
        <Box height="10" shrink="0" />
      </Stack>
    </Box>
  );
}
