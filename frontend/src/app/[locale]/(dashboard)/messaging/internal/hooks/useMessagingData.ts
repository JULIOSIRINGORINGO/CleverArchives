"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { apiService } from "@/services/api";
import useSWR from "swr";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { id as idLocale, enUS } from "date-fns/locale";

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
  recipient_type?: string;
  recipient_name?: string | null;
  recipient_id?: number | string | null;
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
  const [lastSync, setLastSync] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const { mutate } = useSWR(
    !isPollingPaused ? ['/internal_messages', lastSync] : null,
    () => apiService.messages.list(lastSync ? { updated_after: lastSync } : {}),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      onSuccess: (newData) => {
        if (newData?.messages) {
          setMessages(prev => {
            const newMsgs = newData.messages;
            if (newMsgs.length === 0) return prev;
            const merged = [...prev];
            newMsgs.forEach((msg: Message) => {
              const idx = merged.findIndex(m => m.id === msg.id);
              if (idx > -1) merged[idx] = msg; 
              else merged.unshift(msg); 
            });
            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          setLastSync(new Date().toISOString());
        }
        if (loading) setLoading(false);
      }
    }
  );

  const fetchMessages = useCallback(async () => mutate(), [mutate]);

  useEffect(() => { 
    if (activeTab === 'inbox') markMessagesAsRead();
  }, [activeTab, markMessagesAsRead]);

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
    messages.forEach(msg => {
      if (msg.recipient_type !== 'specific') return;
      const partnerId = Number(msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id);
      const possibleName = msg.sender_id === user?.id ? msg.recipient_name : msg.sender_name;
      if (!partnerId) return;

      if (!threads[partnerId]) {
        threads[partnerId] = { 
          partnerId, 
          partnerName: possibleName || "User", 
          lastMessage: msg, 
          messages: [],
          lastSeen: (msg.sender_id === user?.id ? msg.recipient_last_seen : msg.sender_last_seen) || undefined
        };
      } else if (possibleName && possibleName !== "User" && threads[partnerId].partnerName === "User") {
        threads[partnerId].partnerName = possibleName;
      }
      threads[partnerId].messages.push(msg);
      
      if (new Date(msg.created_at) > new Date(threads[partnerId].lastMessage.created_at)) {
        threads[partnerId].lastMessage = msg;
        if (possibleName && possibleName !== "User") threads[partnerId].partnerName = possibleName;
        const newLastSeen = msg.sender_id === user?.id ? msg.recipient_last_seen : msg.sender_last_seen;
        if (newLastSeen) threads[partnerId].lastSeen = newLastSeen;
      }
    });

    Object.values(threads).forEach(thread => {
      thread.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    return Object.values(threads).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages, user]);

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
    try {
      await apiService.messages.clearAll();
      fetchMessages();
      setSelectedThread(null);
    } catch (err) { console.error(err); }
    setClearConfirmOpen(false);
  };

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
