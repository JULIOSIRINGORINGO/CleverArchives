"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { ChatBubble } from "./ChatBubble";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface Message {
  id: number | string;
  body: string;
  created_at: string;
  sender_id: number | string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: number | string;
  loading?: boolean;
  activeMatchId?: number | string | null;
  className?: string;
}

/**
 * MessageList - Handles the rendering and scrolling logic for chat histories.
 * Includes day dividers and automated scrolling to ensure viewport stability.
 */
export function MessageList({ 
  messages, 
  currentUserId,
  loading = false,
  activeMatchId = null,
  className 
}: MessageListProps) {
  const t = useTranslations("Messaging");
  const locale = useLocale();
  const dateFnsLocale = locale.startsWith('id') ? id : enUS;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  // CRITICAL: useLayoutEffect runs BEFORE the browser paints.
  // This forces the scroll position to bottom instantly, so the user
  // never sees the top of the chat.
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || loading) return;

    if (messages.length > 0 && prevCount.current === 0) {
      // INITIAL LOAD or CONVERSATION SWITCH: Jump to bottom instantly
      el.scrollTop = el.scrollHeight;
    } else if (messages.length > prevCount.current) {
      // NEW MESSAGE ADDED: Smooth scroll only if near bottom
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom) {
        // Use requestAnimationFrame to let the DOM settle first
        requestAnimationFrame(() => {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        });
      }
    }

    prevCount.current = messages.length;
  }, [messages.length, loading]);

  // Reset counter when conversation changes (messages go to 0)
  useEffect(() => {
    if (messages.length === 0) {
      prevCount.current = 0;
    }
  }, [messages.length]);

  if (loading) {
    return (
      <div className={cn("flex-1 p-6 flex flex-col gap-6 animate-pulse overflow-hidden justify-end min-h-0", className)}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={cn("w-1/2 h-14 bg-muted/10 rounded-2xl shrink-0", i % 2 === 0 ? "ml-auto" : "mr-auto")} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4", className)}>
        <div className="w-20 h-20 rounded-[2.5rem] bg-muted/20 flex items-center justify-center shadow-inner">
          <MessageSquare size={40} strokeWidth={1} className="text-muted-foreground/30" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground/80">{t("no_messages") || "Belum ada pesan"}</h3>
          <p className="text-xs font-medium text-muted-foreground/40 italic">{t("start_conversation") || "Kirim pesan untuk memulai obrolan."}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className={cn("flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 p-6 pb-4 bg-white min-h-0", className)}
    >
      {messages.map((msg, idx) => {
        const prevMsg = messages[idx - 1];
        const showDivider = !prevMsg || !isSameDay(new Date(msg.created_at), new Date(prevMsg.created_at));

        return (
          <React.Fragment key={msg.id}>
            {showDivider && (
              <div className="flex justify-center items-center my-8 select-none">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                <span className="px-6 py-2 bg-muted/5 backdrop-blur-sm text-[10px] font-bold text-muted-foreground/60 rounded-full border border-border/40 shadow-sm whitespace-nowrap mx-4">
                  {format(new Date(msg.created_at), "d MMMM yyyy", { locale: dateFnsLocale })}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent rotate-180" />
              </div>
            )}
            <ChatBubble 
              message={msg} 
              currentUserId={currentUserId}
              isActiveMatch={activeMatchId === msg.id}
            />
          </React.Fragment>
        );
      })}
      <div className="h-2 shrink-0" />
    </div>
  );
}
