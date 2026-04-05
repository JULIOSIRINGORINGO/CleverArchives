"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/DropdownMenu";
import { useTranslations } from "next-intl";
import { WorkspacePanelHeader, WorkspacePanelContent } from "@/components/ui/WorkspacePanel";
import { Input } from "@/components/ui/Input";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

import { Locale } from "date-fns";

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

interface ChatPanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  messages: Message[];
  currentUserId: number | string;
  onSend: (text: string) => void;
  onBack?: () => void;
  onClearChat?: () => void;
  loading?: boolean;
  sending?: boolean;
  placeholder?: string;
  className?: string;
  dateFnsLocale: Locale;
}

/**
 * Local UI Components for Chat Panel
 * Encapsulating feature-specific styles to keep Box.tsx clean and maintainable.
 */
const PanelContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <Box 
    variant="fill-remaining"
    border="subtle"
    rounded="3xl"
    shadow="sm"
    position="relative"
    className={cn("bg-gradient-to-b from-white to-slate-50/30", className)}
  >
    {children}
  </Box>
);

const Header = ({ children }: { children: React.ReactNode }) => (
  <WorkspacePanelHeader 
    paddingX="lg" 
    paddingY="md" 
    height="20" 
    background="white" 
    display="flex" 
    align="center" 
    shrink="0"
    showDivider={true}
    className="border-b border-border/50 px-6 py-4"
  >
    {children}
  </WorkspacePanelHeader>
);

const Footer = ({ children }: { children: React.ReactNode }) => (
  <Box 
    padding="md" 
    background="white" 
    border="top" 
    shrink="0"
    className="border-t border-border/50"
  >
    {children}
  </Box>
);

const EmptyStateContainer = ({ children }: { children: React.ReactNode }) => (
  <Box 
    flex="1" 
    display="flex" 
    direction="col" 
    align="center" 
    justify="center" 
    padding="xl" 
    background="white" 
    border="subtle" 
    rounded="3xl" 
    shadow="sm"
  >
    {children}
  </Box>
);

export function ChatPanel({
  title,
  subtitle,
  messages,
  currentUserId,
  onSend,
  onBack,
  onClearChat,
  loading = false,
  sending = false,
  placeholder,
  className,
  dateFnsLocale
}: ChatPanelProps) {
  const t = useTranslations("Messaging");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);

  const filteredMessages = messages.filter(m => 
    !searchQuery || m.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matches = messages.filter(m => 
    searchQuery && m.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateMatch = (dir: "up" | "down") => {
    if (matches.length === 0) return;
    const newIdx = dir === "up" 
      ? (matchIndex > 0 ? matchIndex - 1 : matches.length - 1)
      : (matchIndex < matches.length - 1 ? matchIndex + 1 : 0);
    setMatchIndex(newIdx);
    document.getElementById(`msg-${matches[newIdx].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const activeMatchId = matches[matchIndex]?.id || null;

  return (
    <PanelContainer className={className}>
      {/* Header */}
      <Header>
        <AnimatePresence mode="wait">
          {!showSearch ? (
            <Inline key="header" spacing="md" align="center" justify="between" width="full">
              <Inline spacing="sm" align="center" flex="1">
                {onBack && (
                  <Box shrink="0" marginRight="xs">
                    <Button variant="ghost" size="icon" rounded="xl" onClick={onBack}>
                      <IconWrapper icon="chevron-left" isGhost />
                    </Button>
                  </Box>
                )}
                
                <Box variant="avatar-icon">
                  <Text weight="bold" color="primary">{title[0]}</Text>
                </Box>

                <Stack spacing="none" flex="1">
                  <Text weight="bold" color="black" variant="subheading">{title}</Text>
                  {subtitle && <Text variant="caption-muted">{subtitle}</Text>}
                </Stack>
              </Inline>

              <Box shrink="0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" rounded="xl">
                      <IconWrapper icon="more" isGhost />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" width="48">
                    <DropdownMenuItem onClick={() => setShowSearch(true)}>
                      <IconWrapper icon="search" size="xs" isGhost />
                      {t("search")}
                    </DropdownMenuItem>
                    {onClearChat && (
                      <DropdownMenuItem onClick={onClearChat} color="danger">
                        <IconWrapper icon="trash" size="xs" isGhost color="destructive" />
                        {t("clear_chat")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Box>
            </Inline>
          ) : (
            <Inline key="search" spacing="sm" width="full" align="center">
              <Box shrink="0" marginRight="xs">
                <Button variant="ghost" size="icon" rounded="xl" onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                  <IconWrapper icon="chevron-left" isGhost />
                </Button>
              </Box>
              <Box flex="1">
                <Input 
                  autoFocus
                  placeholder={t("type_message_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="chat-recipient-search"
                  rounded="xl"
                />
              </Box>
              {matches.length > 0 && (
                <Inline spacing="xs" align="center" shrink="0">
                  <Text variant="caption-muted" color="black" className="mx-1">
                    {matchIndex + 1} / {matches.length}
                  </Text>
                  <Button variant="ghost" size="icon" rounded="xl" onClick={() => navigateMatch("up")}>
                    <IconWrapper icon="chevron-left" size="xs" isGhost />
                  </Button>
                  <Button variant="ghost" size="icon" rounded="xl" onClick={() => navigateMatch("down")}>
                    <IconWrapper icon="chevron-right" size="xs" isGhost />
                  </Button>
                </Inline>
              )}
            </Inline>
          )}
        </AnimatePresence>
      </Header>

      {/* Message List */}
      <WorkspacePanelContent padding="none" flex="1" overflow="hidden" className="min-h-0">
        <MessageList 
          messages={filteredMessages} 
          currentUserId={currentUserId}
          loading={loading}
          activeMatchId={activeMatchId}
          dateFnsLocale={dateFnsLocale}
        />
      </WorkspacePanelContent>

      {/* Message Input */}
      {!loading && (
        <Footer>
          <MessageInput 
            onSend={onSend}
            loading={sending}
            placeholder={placeholder}
          />
        </Footer>
      )}
    </PanelContainer>
  );
}
