"use client";

import React from "react";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { Box } from "@/components/ui/Box";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { ThreadSidebar } from "@/components/features/messaging/ThreadSidebar";
import { ComposeView } from "@/components/features/messaging/ComposeView";
import { ChatView } from "@/components/features/messaging/ChatView";
import { AnimatePresence } from "framer-motion";
import { useMessagingData } from "./hooks/useMessagingData";
import { MessagingModals } from "./_components/MessagingModals";
import { formatFriendlyDistance } from "@/lib/date-utils";

export default function InternalMessagingPage() {
  const {
    user, loading, activeTab, setActiveTab, selectedThread, setSelectedThread,
    inboxSearchQuery, setInboxSearchQuery, showInboxSearch, setShowInboxSearch,
    selectedBroadcast, setSelectedBroadcast, sendingReply, dateFnsLocale,
    conversationThreads, messages, t, handleSendReply, confirmDeleteMessage,
    confirmClearAllMessages, deleteConfirmOpen, setDeleteConfirmOpen,
    clearConfirmOpen, setClearConfirmOpen, refreshNotifications, toast, fetchMessages
  } = useMessagingData();

  return (
    <DashboardPage 
      noPadding 
      hideScroll 
      hideHeader 
      title={t("page_title")} 
      icon={<IconWrapper icon="mail" size="sm" isGhost color="primary" />}
    >
      <Box height="full" display="flex" direction="row" spacing="md" background="surface-soft" padding="sm">
        {/* Sidebar Section */}
        <Box height="full" display="flex" direction="col" width="full" mdWidth="80" flexShrink="0">
          <ThreadSidebar 
            activeTab={activeTab} setActiveTab={setActiveTab}
            threads={conversationThreads} selectedThreadId={selectedThread?.partnerId}
            onThreadSelect={(thread) => { setSelectedThread(thread); setActiveTab('inbox'); }}
            inboxSearchQuery={inboxSearchQuery} setInboxSearchQuery={setInboxSearchQuery}
            showInboxSearch={showInboxSearch} setShowInboxSearch={setShowInboxSearch}
            loading={loading} currentUser={user} dateFnsLocale={dateFnsLocale} translations={t}
          />
        </Box>

        {/* Content Section */}
        <Box height="full" flex="1" minWidth="0" display="flex" direction="col">
          <AnimatePresence mode="wait">
            {activeTab === 'inbox' ? (
              <ChatView 
                key="inbox-view" selectedThread={selectedThread}
                messages={messages.filter(m => selectedThread && (
                  (m.sender_id === user?.id && m.recipient_id === selectedThread.partnerId) ||
                  (m.sender_id === selectedThread.partnerId && m.recipient_id === user?.id)
                )).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())}
                currentUserId={user?.id || 0} onSend={handleSendReply}
                onClearChat={() => setClearConfirmOpen(true)} loading={loading}
                sending={sendingReply} translations={t} dateFnsLocale={dateFnsLocale}
                onBack={() => setSelectedThread(null)}
                subtitle={selectedThread ? (() => {
                  const lastSeenAt = (selectedThread.lastSeen ? new Date(selectedThread.lastSeen) : null) || new Date(selectedThread.lastMessage.created_at);
                  const isOnline = (new Date().getTime() - lastSeenAt.getTime()) < 5 * 60 * 1000;
                  return isOnline ? t("online") : `${t("last_seen")} ${formatFriendlyDistance(lastSeenAt, { addSuffix: true, locale: dateFnsLocale })}`;
                })() : undefined}
              />
            ) : (
              <ComposeView 
                key="compose-view" currentUser={user} translations={t} toast={toast}
                onSuccess={() => { setActiveTab('inbox'); fetchMessages(); refreshNotifications(); }}
              />
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Modals & Dialogs Delegation */}
      <MessagingModals 
        selectedBroadcast={selectedBroadcast} setSelectedBroadcast={setSelectedBroadcast}
        deleteConfirmOpen={deleteConfirmOpen} setDeleteConfirmOpen={setDeleteConfirmOpen}
        confirmDeleteMessage={confirmDeleteMessage} clearConfirmOpen={clearConfirmOpen}
        setClearConfirmOpen={setClearConfirmOpen} confirmClearAllMessages={confirmClearAllMessages}
        translations={t}
      />
    </DashboardPage>
  );
}
