"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Box } from "@/components/ui/Box";
import { Inline } from "@/components/ui/Inline";
import { Text as UIText } from "@/components/ui/Text";

interface ChatBubbleProps {
  message: {
    id: number | string;
    body: string;
    created_at: string;
    sender_id: number | string;
  };
  currentUserId: number | string;
  isOptimistic?: boolean;
  isActiveMatch?: boolean;
}

export function ChatBubble({
  message,
  currentUserId,
  isOptimistic = false,
  isActiveMatch = false
}: ChatBubbleProps) {
  const locale = useLocale();
  const dateFnsLocale = locale === "id" ? id : enUS;
  const isMe = String(message.sender_id) === String(currentUserId);

  return (
    <Box
      id={`msg-${message.id}`}
      display="flex"
      width="full"
      justify={isMe ? "end" : "start"}
      marginBottom="xs"
      scrollMarginTop="20"
    >
      <Box
        maxWidth="bubble-md"
        background={isMe ? "primary" : "white"}
        color={isMe ? "white" : "black"}
        border={isMe ? "none" : "subtle"}
        shadow="sm"
        opacity={isOptimistic ? "60" : "100"}
        marginLeft={isMe ? "xl" : "none"}
        marginRight={isMe ? "none" : "xl"}
        paddingTop="xs"
        paddingBottom="xs"
        paddingX="md"
        className={cn(
          isMe 
            ? "rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] shadow-primary/10" 
            : "rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] border-border/50"
        )}
      >
        <motion.div
          initial={isOptimistic || !isMe ? { opacity: 0, scale: 0.95, y: 5 } : false}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            outline: isActiveMatch ? '2px solid var(--primary)' : 'none',
            outlineOffset: '2px'
          }}
        >
          <Inline spacing="sm" align="baseline" justify="between" width="full">
            <UIText
              as="span"
              variant="body-compact"
              weight="medium"
              color={isMe ? "white" : "black"}
            >
              {message.body}
            </UIText>
            <Box shrink="0" className="translate-y-[1px]">
              <UIText
                variant="micro-strong"
                color={isMe ? "white" : "muted"}
                opacity={isMe ? "60" : "40"}
              >
                {format(new Date(message.created_at), "HH:mm", { locale: dateFnsLocale })}
              </UIText>
            </Box>
          </Inline>
        </motion.div>
      </Box>
    </Box>
  );
}
