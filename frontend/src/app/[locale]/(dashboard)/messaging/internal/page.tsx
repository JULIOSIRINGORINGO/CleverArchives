"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apiService } from "@/services/api";
import useSWR from "swr";
// Lucide icons replaced by IconWrapper registry usages where applicable
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSearchParams } from "next/navigation";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { id as idLocale, enUS } from "date-fns/locale";
import { formatFriendlyDistance } from "@/lib/date-utils";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { ThreadSidebar } from "@/components/features/messaging/ThreadSidebar";
import { ComposeView } from "@/components/features/messaging/ComposeView";
import { ChatView } from "@/components/features/messaging/ChatView";

interface Attachment {
  url: string;
  filename: string;
  content_type: string;
}

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
  attachments?: Attachment[];
  isOptimistic?: boolean;
}

interface ConversationThread {
  partnerId: number;
  partnerName: string;
  partnerStatus?: 'online' | 'offline';
  lastSeen?: string | null;
  lastMessage: Message;
  messages: Message[];
}

export default function InternalMessagingPage() {
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

  // useSWR for incremental fetching
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
              if (idx > -1) {
                merged[idx] = msg; 
              } else {
                merged.unshift(msg); 
              }
            });

            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          setLastSync(new Date().toISOString());
        }
        if (loading) setLoading(false);
      }
    }
  );

  const fetchMessages = useCallback(async () => {
    mutate();
  }, [mutate]);

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
        console.error("Delayed send error:", err); 
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        toast(t("send_error"), "error");
        setIsPollingPaused(false);
      });
  };
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

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
      } else {
        // Preserve a valid name if the current message has a null name (common in sending status)
        if (possibleName && possibleName !== "User" && threads[partnerId].partnerName === "User") {
          threads[partnerId].partnerName = possibleName;
        }
      }
      
      threads[partnerId].messages.push(msg);
      
      const isNewer = new Date(msg.created_at) > new Date(threads[partnerId].lastMessage.created_at);
      if (isNewer) {
        threads[partnerId].lastMessage = msg;
        // Only update partnerName if the new message provides a non-null name
        if (possibleName && possibleName !== "User") {
          threads[partnerId].partnerName = possibleName;
        }
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
      const partnerIdParam = searchParams.get('partnerId');
      if (partnerIdParam) {
        const thread = conversationThreads.find(t => t.partnerId === Number(partnerIdParam));
        if (thread) {
           setSelectedThread(thread);
           setActiveTab('inbox');
        }
      }
    }
  }, [conversationThreads, searchParams]);

  useEffect(() => {
    if (selectedThread) {
      const updatedThread = conversationThreads.find(t => t.partnerId === selectedThread.partnerId);
      if (updatedThread && (
        updatedThread.messages.length !== selectedThread.messages.length || 
        updatedThread.partnerName !== selectedThread.partnerName
      )) {
        setSelectedThread(updatedThread);
      }
    }
  }, [conversationThreads, selectedThread]);

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      try {
        await apiService.messages.delete(messageToDelete);
        fetchMessages();
        setDeleteConfirmOpen(false);
        setMessageToDelete(null);
      } catch (err) { 
        console.error(err); 
        setDeleteConfirmOpen(false);
      }
    }
  };

  const confirmClearAllMessages = async () => {
    try {
      await apiService.messages.clearAll();
      fetchMessages();
      setSelectedThread(null);
      setClearConfirmOpen(false);
    } catch (err) { 
      console.error(err); 
      setClearConfirmOpen(false);
    }
  };

  return (
    <DashboardPage 
      noPadding
      hideScroll={true}
      hideHeader={true}
      title={t("page_title")}
      icon={<IconWrapper icon="mail" size="sm" isGhost color="primary" />}
    >
      <Box 
        variant="workspace"
        height="full" 
        padding="none"
        background="surface-soft"
      >

          <ThreadSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            threads={conversationThreads}
            selectedThreadId={selectedThread?.partnerId}
            onThreadSelect={(thread) => {
              setSelectedThread(thread);
              setActiveTab('inbox');
            }}
            inboxSearchQuery={inboxSearchQuery}
            setInboxSearchQuery={setInboxSearchQuery}
            showInboxSearch={showInboxSearch}
            setShowInboxSearch={setShowInboxSearch}
            loading={loading}
            currentUser={user}
            dateFnsLocale={dateFnsLocale}
            translations={t}
          />



          <AnimatePresence mode="wait">
            {activeTab === 'inbox' ? (
              <ChatView 
                key="inbox-view"
                selectedThread={selectedThread}
                messages={messages
                  .filter(m => selectedThread && (
                    (m.sender_id === user?.id && m.recipient_id === selectedThread.partnerId) ||
                    (m.sender_id === selectedThread.partnerId && m.recipient_id === user?.id)
                  ))
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                }
                currentUserId={user?.id || 0}
                onSend={handleSendReply}
                onClearChat={() => setClearConfirmOpen(true)}
                loading={loading}
                sending={sendingReply}
                translations={t}
                subtitle={selectedThread ? (() => {
                  const lastSeenAt = (selectedThread.lastSeen ? new Date(selectedThread.lastSeen) : null) || new Date(selectedThread.lastMessage.created_at);
                  const isOnline = (new Date().getTime() - lastSeenAt.getTime()) < 5 * 60 * 1000;
                  if (isOnline) return t("online");
                  return `${t("last_seen")} ${formatFriendlyDistance(lastSeenAt, { addSuffix: true, locale: dateFnsLocale })}`;
                })() : undefined}
                onBack={() => setSelectedThread(null)}
                dateFnsLocale={dateFnsLocale}
              />
            ) : (
              <ComposeView 
                key="compose-view"
                currentUser={user}
                translations={t}
                onSuccess={() => {
                  setActiveTab('inbox');
                  fetchMessages();
                  refreshNotifications();
                }}
                toast={toast}
              />
            )}
          </AnimatePresence>

      </Box>

      <AnimatePresence>
        <Modal 
          isOpen={!!selectedBroadcast} 
          onClose={() => setSelectedBroadcast(null)} 
          padding="none"
          overflow="hidden"
          maxWidth="2xl"
        >
          {selectedBroadcast && (
            <Box display="flex" direction="col" background="surface">
              <Box padding="xl" border="subtle" background="surface-soft" position="relative" overflow="hidden">
                <Box position="absolute" top="none" right="none" padding="md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    rounded="xl" 
                    onClick={() => setSelectedBroadcast(null)}
                  >
                    <IconWrapper icon="close" size="sm" isGhost />
                  </Button>
                </Box>
                <Box display="inline-flex" align="center" paddingX="md" paddingY="xs" rounded="full" background="primary-soft" border="primary" marginBottom="md">
                  <Text variant="label-strong" color="primary">
                    {t("broadcast_alert")}
                  </Text>
                </Box>
                <Box marginBottom="md">
                  <Text variant="heading" weight="bold" color="black">
                    {selectedBroadcast.title}
                  </Text>
                </Box>
                <Inline spacing="lg" align="center">
                  <Inline spacing="md" align="center">
                    <Box variant="avatar-icon" width="10" height="10" display="flex" align="center" justify="center">
                      <Text variant="label-strong">{selectedBroadcast.sender_name?.[0]}</Text>
                    </Box>
                    <Text variant="label-strong" color="muted">{selectedBroadcast.sender_name}</Text>
                  </Inline>
                  <Text variant="caption-muted" opacity="40">•</Text>
                  <Inline spacing="xs" align="center">
                    <IconWrapper icon="calendar" size="xs" color="primary" isGhost />
                    <Text variant="caption-muted">{new Date(selectedBroadcast.created_at).toLocaleDateString()}</Text>
                  </Inline>
                </Inline>
              </Box>
              
              <Box padding="xl" overflow="auto" maxHeight="160px" scrollbar="custom">
                <Text variant="body" color="black" whiteSpace="pre-wrap">
                  {selectedBroadcast.body}
                </Text>
                
                {selectedBroadcast.attachments && selectedBroadcast.attachments.length > 0 && (
                  <Box marginTop="xl" paddingTop="xl" border="top" spacing="lg" display="flex" direction="col">
                    <Text variant="label-strong" color="muted">{t("attachment")}</Text>
                    <Stack spacing="md">
                      {selectedBroadcast.attachments.map((att: any, i: number) => (
                        <Box 
                          key={i} 
                          variant="list-row"
                          padding="md"
                          rounded="2xl"
                          cursor="pointer"
                          as="a"
                          href={`${process.env.NEXT_PUBLIC_API_URL}${att.url}`} 
                          target="_blank" 
                          rel="noreferrer" 
                        >
                          <Inline justify="between" align="center" width="full">
                            <Inline spacing="lg" align="center">
                              <Box variant="avatar-icon" width="10" height="10" display="flex" align="center" justify="center">
                                <IconWrapper icon="file-text" size="sm" isGhost />
                              </Box>
                              <Text variant="label-strong" color="black" lineClamp="1">
                                <Box maxWidth="64">{att.filename}</Box>
                              </Text>
                            </Inline>
                            <IconWrapper icon="download" size="sm" isGhost />
                          </Inline>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
              
              <Box padding="md" background="surface-soft" border="top" display="flex" justify="end">
                <Button onClick={() => setSelectedBroadcast(null)} variant="outline" rounded="xl">
                   {t("done")}
                </Button>
              </Box>
            </Box>
          )}
        </Modal>
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setMessageToDelete(null); }}
        onConfirm={confirmDeleteMessage}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={confirmClearAllMessages}
        title={t("clear_confirm_title")}
        description={t("clear_confirm_desc")}
        confirmLabel={t("clear_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />
    </DashboardPage>
  );
}
