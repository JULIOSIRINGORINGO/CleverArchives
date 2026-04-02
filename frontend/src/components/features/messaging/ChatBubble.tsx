"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";

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

/**
 * ChatBubble - Standardized message bubble with modern aesthetics.
 * Uses rounded corners (20px/4px) for distinct identity.
 */
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
    <div 
      id={`msg-${message.id}`}
      className={cn(
        "flex w-full mb-1 scroll-mt-20",
        isMe ? "justify-end" : "justify-start"
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
        className={cn(
          "group relative px-5 py-3.5 max-w-[85%] sm:max-w-[75%] transition-all shadow-sm text-[14px] font-medium leading-relaxed",
          isMe 
            ? "bg-primary text-white rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] ml-12 shadow-primary/10" 
            : "bg-white text-black border border-border/50 rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] mr-12",
          isOptimistic && "opacity-70 grayscale",
          isActiveMatch && "ring-4 ring-primary/10 z-10"
        )}
      >
        <div className="flex items-end gap-3 min-w-0">
          <p className="whitespace-pre-wrap leading-relaxed font-medium text-[13px] flex-1 min-w-0">
            {message.body}
          </p>
          <div className={cn(
            "flex items-center gap-1 text-[9px] font-bold opacity-40 shrink-0 select-none pb-0.5",
            "text-black/60"
          )}>
            {format(new Date(message.created_at), "HH:mm", { locale: dateFnsLocale })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
