"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import useSWR from "swr";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";

export interface Attachment {
  url: string;
  filename: string;
  content_type: string;
}

export interface Message {
  id: number;
  title: string;
  body: string;
  sender_name: string;
  sender_id: number;
  recipient_type: string;
  recipient_name?: string | null;
  recipient_id?: number | null;
  sender_last_seen?: string | null;
  recipient_last_seen?: string | null;
  created_at: string;
  attachments?: Attachment[];
  isOptimistic?: boolean;
}

export interface ConversationThread {
  partnerId: number;
  partnerName: string;
  partnerStatus?: 'online' | 'offline';
  lastSeen?: string | null;
  lastMessage: Message;
  messages: Message[];
}

export function useMessaging() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations("Messaging");
  const { markMessagesAsRead, refreshNotifications } = useNotifications();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSyncRef = useRef<string | null>(null);
  const [isPollingPaused, setIsPollingPaused] = useState(false);

  // useSWR for real-time polling — STABLE KEY to prevent infinite loops
  const { mutate } = useSWR(
    !isPollingPaused ? '/messaging/sync' : null,
    () => {
      const currentSync = lastSyncRef.current;
      return apiService.messages.list(currentSync ? { updated_after: currentSync } : {});
    },
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onSuccess: (data) => {
        if (data?.messages?.length > 0) {
          setMessages(prev => {
            const merged = [...prev];
            data.messages.forEach((msg: Message) => {
              const idx = merged.findIndex(m => m.id === msg.id);
              if (idx > -1) merged[idx] = msg;
              else merged.unshift(msg);
            });
            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          lastSyncRef.current = new Date().toISOString();
        }
        setLoading(false);
      }
    }
  );

  // Logic to group messages into threads
  const threads = useMemo(() => {
    if (!user) return [];
    const threadMap: Record<number, ConversationThread> = {};
    
    messages.forEach(msg => {
      if (msg.recipient_type !== 'specific') return;
      
      const partnerId = msg.sender_id === user.id ? Number(msg.recipient_id) : msg.sender_id;
      const partnerName = msg.sender_id === user.id ? (msg.recipient_name || "User") : msg.sender_name;
      
      if (!partnerId) return;

      if (!threadMap[partnerId]) {
        threadMap[partnerId] = {
          partnerId,
          partnerName,
          lastMessage: msg,
          messages: [],
          lastSeen: (msg.sender_id === user.id ? msg.recipient_last_seen : msg.sender_last_seen) || undefined
        };
      }
      threadMap[partnerId].messages.push(msg);
      
      if (new Date(msg.created_at) > new Date(threadMap[partnerId].lastMessage.created_at)) {
        threadMap[partnerId].lastMessage = msg;
        threadMap[partnerId].partnerName = partnerName;
        const lastSeen = msg.sender_id === user.id ? msg.recipient_last_seen : msg.sender_last_seen;
        if (lastSeen) threadMap[partnerId].lastSeen = lastSeen;
      }
    });

    Object.values(threadMap).forEach(t => {
      t.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    return Object.values(threadMap).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages, user]);

  const sendMessage = useCallback(async (data: FormData) => {
    try {
      setIsPollingPaused(true);
      await apiService.messages.create(data);
      mutate();
      refreshNotifications();
      return true;
    } catch (err) {
      toast(t("send_error"), "error");
      return false;
    } finally {
      setIsPollingPaused(false);
    }
  }, [mutate, refreshNotifications, toast, t]);

  const deleteMessage = useCallback(async (id: number) => {
    try {
      await apiService.messages.delete(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      toast(t("delete_error"), "error");
      return false;
    }
  }, [toast, t]);

  const clearThread = useCallback(async () => {
     try {
       await apiService.messages.clearAll();
       setMessages([]);
       return true;
     } catch (err) {
       toast(t("clear_error"), "error");
       return false;
     }
  }, [toast, t]);

  return {
    messages,
    threads,
    loading,
    sendMessage,
    deleteMessage,
    clearThread,
    markAsRead: markMessagesAsRead,
    refresh: mutate
  };
}
