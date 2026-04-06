"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { ListRow, AvatarIcon, StatusDot } from "./_components/MessagingAesthetics";
import { Text } from "@/components/ui/Text";
import { formatFriendlyDistance } from "@/lib/date-utils";
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

interface Thread {
  partnerId: number;
  partnerName: string;
  lastMessage: Message;
  messages: Message[];
  lastSeen?: string | null;
}

interface ThreadItemProps {
  thread: any; // Using any or the specific Thread interface above
  isSelected: boolean;
  onClick: () => void;
  currentUserId: number | string;
  dateFnsLocale: Locale;
  youPrefix: string;
}

export function ThreadItem({
  thread,
  isSelected,
  onClick,
  currentUserId,
  dateFnsLocale,
  youPrefix
}: ThreadItemProps) {
  return (
    <ListRow
      active={isSelected}
      onClick={onClick}
    >
      <Box display="flex" align="center" spacing="md" width="full" minWidth="0">
        <Box 
          position="relative"
          shrink="0"
        >
          <AvatarIcon>
            <Text weight="bold" color="primary">
              {thread.partnerName[0]}
            </Text>
          </AvatarIcon>
          {/* Status Dot */}
          <StatusDot />
        </Box>

        <Box flex="1" overflow="hidden" minWidth="0" display="flex" direction="col" justify="center">
          <Box display="flex" justify="between" align="baseline" width="full" minWidth="0">
            <Box flex="1" minWidth="0">
              <Text 
                weight="bold" 
                variant="body-strong"
                color="black"
                lineClamp="1"
              >
                {thread.partnerName}
              </Text>
            </Box>
            <Box shrink="0" marginLeft="xs">
              <Text 
                variant="caption"
                color="default"
              >
                {formatFriendlyDistance(new Date(thread.lastMessage.created_at), { 
                  addSuffix: true, 
                  locale: dateFnsLocale 
                })}
              </Text>
            </Box>
          </Box>
          <Text 
            variant="subheading"
            color="default"
            lineClamp="1"
            className="mt-0.5"
          >
            {thread.lastMessage.sender_id === currentUserId ? `${youPrefix} ` : ""}{thread.lastMessage.body}
          </Text>
        </Box>
      </Box>
    </ListRow>
  );
}
