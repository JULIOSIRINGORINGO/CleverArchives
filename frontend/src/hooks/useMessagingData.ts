"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import useSWR from "swr";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { id as idLocale, enUS } from "date-fns/locale";
import { formatFriendlyDistance } from "@/lib/date-utils";

export interface Attachment {
  url: string;
  filename: string;
  content_type: string;
}

export interface Message {
  id: number | string;
  title?: string;
  body: string;
  sender_name?: string;
  sender_id: number | string;
  sender_avatar_url?: string;
  recipient_type?: string;
  recipient_name?: string | null;
  recipient_id?: number | string | null;
  recipient_avatar_url?: string | null;
  sender_last_seen?: string | null;
  recipient_last_seen?: string | null;
  created_at: string;
  attachments?: Attachment[];
  isOptimistic?: boolean;
}

export interface ConversationThread {
  partnerId: number;
  partnerName: string;
  partnerAvatar?: string;
  partnerStatus?: 'online' | 'offline';
  lastSeen?: string | null;
  lastMessage: Message;
  messages: Message[];
}

export function useMessagingData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { markMessagesAsRead, refreshNotifications } = useNotifications();

  const t = useTranslations("Messaging");
  const locale = useLocale();
  const dateFnsLocale = locale.startsWith('id') ? idLocale : enUS;
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [inboxSearchQuery, setInboxSearchQuery] = useState("");
  const [showInboxSearch, setShowInboxSearch] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Message | null>(null);
  
  const [sendingReply, setSendingReply] = useState(false);
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const lastSyncRef = useRef<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const { mutate } = useSWR(
    !isPollingPaused ? '/internal_messages' : null,
    async () => {
      const currentLastSync = lastSyncRef.current;
      return apiService.messages.list(currentLastSync ? { updated_after: currentLastSync } : {});
    },
    {
      refreshInterval: 10000, 
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onSuccess: (newData) => {
        if (newData?.messages) {
          const newMsgs = newData.messages;
          if (newMsgs.length > 0) {
            setMessages(prev => {
              const merged = [...prev];
              newMsgs.forEach((msg: Message) => {
                const idx = merged.findIndex(m => m.id === msg.id);
                if (idx > -1) merged[idx] = msg; 
                else merged.unshift(msg); 
              });
              return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            });
            const latestTimestamp = new Date().toISOString();
            lastSyncRef.current = latestTimestamp;
            setLastSync(latestTimestamp);
          }
        }
        if (loading) setLoading(false);
      }
    }
  );

  const fetchMessages = useCallback(async () => mutate(), [mutate]);

  // Mark messages as read ONCE when entering inbox — not on every re-render
  const hasMarkedReadRef = useRef(false);
  useEffect(() => { 
    if (activeTab === 'inbox' && !hasMarkedReadRef.current) {
      hasMarkedReadRef.current = true;
      markMessagesAsRead();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendReply = async (bodyText: string) => {
    if (!bodyText.trim() || !selectedThread) return;
    
    const optimisticMsg: Message = {
      id: -(Date.now()),
      sender_id: user?.id || 0,
      sender_name: user?.name || "Me",
      body: bodyText,
      created_at: new Date().toISOString(),
      recipient_type: "specific",
      recipient_id: selectedThread.partnerId,
      title: `Re: ${selectedThread.lastMessage.title?.replace(/^Re:\s*/, '') || ''}`,
      isOptimistic: true
    };

    setMessages(prev => [...prev.filter(m => m.id !== optimisticMsg.id), optimisticMsg]);
    setSendingReply(true);
    
    const formData = new FormData();
    formData.append("title", optimisticMsg.title || "");
    formData.append("body", bodyText);
    formData.append("recipient_type", "specific");
    formData.append("recipient_id", selectedThread.partnerId.toString());

    setIsPollingPaused(true);
    setSendingReply(false);
    
    apiService.messages.create(formData)
      .then(() => {
        setTimeout(() => {
          fetchMessages();
          refreshNotifications();
        }, 1000);
      })
      .catch((err) => { 
        console.error("Send error:", err); 
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        toast(t("send_error"), "error");
        setIsPollingPaused(false);
      });
  };

  const conversationThreads = useMemo(() => {
    const threads: Record<number, ConversationThread> = {};
    
    // Only process private/specific messages for this view
    const privateMessages = messages.filter(m => m.recipient_type === 'specific' || !m.recipient_type);

    privateMessages.forEach(msg => {
      const partnerId = Number(msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id);
      const possibleName = msg.sender_id === user?.id ? msg.recipient_name : msg.sender_name;
      const possibleAvatar = (msg.sender_id === user?.id ? msg.recipient_avatar_url : msg.sender_avatar_url) || undefined;
      
      if (!partnerId) return; 

      const threadKey = partnerId;
      const threadName = possibleName || t("user");

      if (!threads[threadKey]) {
        threads[threadKey] = { 
          partnerId: threadKey, 
          partnerName: threadName, 
          partnerAvatar: possibleAvatar,
          lastMessage: msg, 
          messages: [],
          lastSeen: (msg.sender_id === user?.id ? msg.recipient_last_seen : msg.sender_last_seen) || undefined
        };
      } else {
        if (possibleName && possibleName !== "User" && threads[threadKey].partnerName === "User") {
          threads[threadKey].partnerName = possibleName;
        }
        if (possibleAvatar && !threads[threadKey].partnerAvatar) {
          threads[threadKey].partnerAvatar = possibleAvatar;
        }
      }
      threads[threadKey].messages.push(msg);
      
      if (new Date(msg.created_at) > new Date(threads[threadKey].lastMessage.created_at)) {
        threads[threadKey].lastMessage = msg;
        if (possibleName && possibleName !== "User") threads[threadKey].partnerName = possibleName;
        const newLastSeen = msg.sender_id === user?.id ? msg.recipient_last_seen : msg.sender_last_seen;
        if (newLastSeen) threads[threadKey].lastSeen = newLastSeen;
      }
    });

    Object.values(threads).forEach(thread => {
      thread.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    return Object.values(threads).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages, user, t]);

  useEffect(() => {
    if (conversationThreads.length > 0) {
      const pId = searchParams.get('partnerId');
      if (pId) {
        const thread = conversationThreads.find(t => t.partnerId === Number(pId));
        if (thread) { setSelectedThread(thread); setActiveTab('inbox'); }
      }
    }
  }, [conversationThreads, searchParams]);

  useEffect(() => {
    if (selectedThread) {
      const updated = conversationThreads.find(t => t.partnerId === selectedThread.partnerId);
      if (updated && (updated.messages.length !== selectedThread.messages.length || updated.partnerName !== selectedThread.partnerName)) {
        setSelectedThread(updated);
      }
    }
  }, [conversationThreads, selectedThread]);

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      try {
        await apiService.messages.delete(messageToDelete);
        fetchMessages();
      } catch (err) { console.error(err); }
      setDeleteConfirmOpen(false);
      setMessageToDelete(null);
    }
  };

  const confirmClearAllMessages = async () => {
    console.log("Starting clear all messages...");
    try {
      await apiService.messages.clearAll();
      console.log("Clear all messages success");
      fetchMessages();
      setSelectedThread(null);
    } catch (err) { 
      console.error("Clear all error:", err); 
      toast(t("clear_error"), "error");
    }
    setClearConfirmOpen(false);
  };

  const activeThreadMessages = useMemo(() => {
    if (!selectedThread) return [];
    
    // Use the messages already grouped in the thread for performance
    const thread = conversationThreads.find(t => t.partnerId === selectedThread.partnerId);
    return thread ? thread.messages : [];
  }, [conversationThreads, selectedThread]);

  const partnerStatus = useMemo(() => {
    if (!selectedThread) return { isOnline: false, text: "" };
    
    const lastSeenAt = (selectedThread.lastSeen ? new Date(selectedThread.lastSeen) : null) || 
                       new Date(selectedThread.lastMessage.created_at);
    
    const isOnline = (new Date().getTime() - lastSeenAt.getTime()) < 5 * 60 * 1000;
    const text = isOnline ? t("online") : `${t("last_seen")} ${formatFriendlyDistance(lastSeenAt, { addSuffix: true, locale: dateFnsLocale })}`;
    
    return { isOnline, text };
  }, [selectedThread, t, dateFnsLocale]);

  return {
    user,
    loading,
    activeTab,
    setActiveTab,
    selectedThread,
    setSelectedThread,
    inboxSearchQuery,
    setInboxSearchQuery,
    showInboxSearch,
    setShowInboxSearch,
    selectedBroadcast,
    setSelectedBroadcast,
    sendingReply,
    dateFnsLocale,
    conversationThreads,
    activeThreadMessages,
    partnerStatus,
    messages,
    t,
    fetchMessages,
    handleSendReply,
    confirmDeleteMessage,
    confirmClearAllMessages,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    clearConfirmOpen,
    setClearConfirmOpen,
    refreshNotifications,
    toast
  };
}
