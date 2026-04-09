"use client";

import React from "react";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { Box } from "@/components/ui/Box";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { ThreadSidebar } from "@/components/features/messaging/ThreadSidebar";
import { ComposeView } from "@/components/features/messaging/ComposeView";
import { ChatView } from "@/components/features/messaging/ChatView";
import { AnimatePresence } from "framer-motion";
import { useMessagingData } from "@/hooks/useMessagingData";
import { MessagingModals } from "./_components/MessagingModals";

export default function InternalMessagingPage() {
  const {
    user, loading, activeTab, setActiveTab, selectedThread, setSelectedThread,
    inboxSearchQuery, setInboxSearchQuery, showInboxSearch, setShowInboxSearch,
    selectedBroadcast, setSelectedBroadcast, sendingReply, dateFnsLocale,
    conversationThreads, messages, activeThreadMessages, partnerStatus, t, handleSendReply, confirmDeleteMessage,
    confirmClearAllMessages, deleteConfirmOpen, setDeleteConfirmOpen,
    clearConfirmOpen, setClearConfirmOpen, refreshNotifications, toast, fetchMessages
  } = useMessagingData();

  return (
    <DashboardPage hideScroll={true} hideHeader={true}>
      <Box height="full" display="flex" direction="row" spacing="md" background="surface-soft">
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
                messages={activeThreadMessages}
                currentUserId={user?.id || 0} onSend={handleSendReply}
                onClearChat={() => {
                  console.log("Clear chat triggered from UI");
                  setTimeout(() => setClearConfirmOpen(true), 100);
                }}
                loading={loading}
                sending={sendingReply} translations={t} dateFnsLocale={dateFnsLocale}
                onBack={() => setSelectedThread(null)}
                subtitle={partnerStatus?.text}
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
