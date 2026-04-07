"use client";

import React, { useState } from "react";
import { Box } from "@/components/ui/Box";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { WorkspacePanelHeader, WorkspacePanelContent } from "@/components/ui/WorkspacePanel";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { UnifiedSearch } from "@/components/ui/UnifiedSearch";
import { motion, AnimatePresence } from "framer-motion";
import { ThreadItem } from "./ThreadItem";
import { Locale } from "date-fns";
import { PillGroup, PillItem, AvatarIcon } from "./_components/MessagingAesthetics";

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

interface ThreadSidebarProps {
  activeTab: 'inbox' | 'compose';
  setActiveTab: (tab: 'inbox' | 'compose') => void;
  threads: Thread[];
  selectedThreadId?: number | null;
  onThreadSelect: (thread: Thread) => void;
  inboxSearchQuery: string;
  setInboxSearchQuery: (query: string) => void;
  showInboxSearch: boolean;
  setShowInboxSearch: (show: boolean) => void;
  loading: boolean;
  currentUser: any;
  dateFnsLocale: Locale;
  translations: any;
}

/**
 * Local Header Component for better composition
 */
const Header = ({ children }: { children: React.ReactNode }) => (
  <WorkspacePanelHeader 
    paddingX="lg" 
    paddingY="md" 
    background="white" 
    display="flex" 
    align="center" 
    shrink="0"
    showDivider={true}
    border="bottom"
  >
    {children}
  </WorkspacePanelHeader>
);

export function ThreadSidebar({
  activeTab,
  setActiveTab,
  threads,
  selectedThreadId,
  onThreadSelect,
  inboxSearchQuery,
  setInboxSearchQuery,
  showInboxSearch,
  setShowInboxSearch,
  loading,
  currentUser,
  dateFnsLocale,
  translations: t
}: ThreadSidebarProps) {
  const filteredThreads = threads.filter(thread => 
    thread.partnerName.toLowerCase().includes(inboxSearchQuery.toLowerCase())
  );

  return (
    <Stack 
      spacing="md" 
      width="full" 
      height="full" 
      shrink="0"
      display={selectedThreadId && activeTab === 'inbox' ? "none" : "flex"}
      mdDisplay="flex"
    >
      <Box width="full" padding="none">
        <PillGroup width="full">
          <PillItem 
            active={activeTab === 'inbox'}
            onClick={() => setActiveTab('inbox')}
          >
            <IconWrapper 
              icon="message" 
              size="sm" 
              isGhost 
              color={activeTab === 'inbox' ? "white" : undefined} 
            />
            <Text 
              variant="subheading" 
              weight="bold" 
              color={activeTab === 'inbox' ? "white" : "black"}
            >
              {t("tab_inbox")}
            </Text>
          </PillItem>
          <PillItem 
            active={activeTab === 'compose'}
            onClick={() => setActiveTab('compose')}
          >
            <IconWrapper 
              icon="plus" 
              size="sm" 
              isGhost 
              color={activeTab === 'compose' ? "white" : undefined} 
            />
            <Text 
              variant="subheading" 
              weight="bold" 
              color={activeTab === 'compose' ? "white" : "black"}
            >
              {t("tab_compose")}
            </Text>
          </PillItem>
        </PillGroup>
      </Box>

      <Box width="full" flex="1" display="flex" direction="col" minHeight="0" background="white" rounded="3xl" border="subtle" shadow="sm" overflow="hidden">
        <Header>
          <AnimatePresence mode="wait">
            {!showInboxSearch ? (
              <Inline key="title" justify="between" align="center" width="full">
                <Box flex="1">
                  <Inline spacing="md" align="center">
                    <AvatarIcon background="primary" color="white">
                      <IconWrapper icon="message" size="sm" isGhost color="white" />
                    </AvatarIcon>
                    <Text variant="heading" weight="bold">
                      {t("inbox_title")}
                    </Text>
                  </Inline>
                </Box>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" rounded="xl">
                      <IconWrapper icon="more" size="sm" isGhost />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" width="48">
                    <DropdownMenuItem onClick={() => setShowInboxSearch(true)}>
                      <IconWrapper icon="search" size="xs" isGhost />
                      {t("search")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Inline>
            ) : (
              <Inline key="search" spacing="sm" width="full" align="center">
                <UnifiedSearch 
                  autoFocus
                  value={inboxSearchQuery}
                  onChange={setInboxSearchQuery}
                  placeholder={t("type_message_placeholder")}
                  onClear={() => { setShowInboxSearch(false); setInboxSearchQuery(""); }}
                />
              </Inline>
            )}
          </AnimatePresence>
        </Header>

        <WorkspacePanelContent padding="xs" flex="1" overflow="hidden">
          <Stack spacing="xs">
            {loading && threads.length === 0 ? (
              <Stack spacing="sm" padding="xs">
                {[1, 2, 3].map(i => (
                  <Box key={i} background="muted-soft" height="16" rounded="xl" animation="pulse" />
                ))}
              </Stack>
            ) : filteredThreads.length === 0 ? (
              <Stack 
                spacing="md" 
                align="center" 
                justify="center" 
                padding="xl" 
                opacity="50"
              >
                <IconWrapper icon="message" size="lg" isGhost opacity="40" />
                <Text weight="bold" variant="label-strong">
                  {t("no_messages")}
                </Text>
              </Stack>
            ) : (
              filteredThreads.map((thread) => (
                <ThreadItem
                  key={thread.partnerId}
                  thread={thread}
                  isSelected={selectedThreadId === thread.partnerId}
                  onClick={() => onThreadSelect(thread)}
                  currentUserId={currentUser?.id || 0}
                  dateFnsLocale={dateFnsLocale}
                  youPrefix={t("you_prefix")}
                />
              ))
            )}
          </Stack>
        </WorkspacePanelContent>
      </Box>
    </Stack>
  );
}
