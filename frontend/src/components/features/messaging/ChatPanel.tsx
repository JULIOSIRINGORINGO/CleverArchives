"use client";

import React, { useState } from "react";
import { ArrowLeft, MoreVertical, Search, Trash2, X, ChevronRight } from "lucide-react";
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
import { WorkspacePanel, WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";
import { Input } from "@/components/ui/Input";

interface Message {
  id: number | string;
  body: string;
  created_at: string;
  sender_id: number | string;
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
}

/**
 * ChatPanel - Specialized container for chat conversations.
 * Includes integrated header, message history, and input field.
 * Supports searching within the active conversation.
 */
export function ChatPanel({
  title,
  subtitle,
  icon,
  messages,
  currentUserId,
  onSend,
  onBack,
  onClearChat,
  loading = false,
  sending = false,
  placeholder,
  className
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

  const activeMatchId = matches[matchIndex]?.id || null;

  const navigateMatch = (dir: "up" | "down") => {
    if (matches.length === 0) return;
    const newIdx = dir === "up" 
      ? (matchIndex > 0 ? matchIndex - 1 : matches.length - 1)
      : (matchIndex < matches.length - 1 ? matchIndex + 1 : 0);
    setMatchIndex(newIdx);
    document.getElementById(`msg-${matches[newIdx].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <WorkspacePanel 
      className={cn("flex flex-col h-full border-border/50", className)}
      isStatic={true}
    >
      {/* Header */}
      <WorkspacePanelHeader showDivider={true} className="px-4 py-3 flex items-center justify-between shrink-0 h-16 bg-white">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {onBack && (
            <button 
              onClick={showSearch ? () => { setShowSearch(false); setSearchQuery(""); } : onBack} 
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <AnimatePresence mode="wait">
            {!showSearch ? (
              <motion.div 
                key="chat-info"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="flex items-center gap-3 min-w-0"
              >
                {icon ? (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-none shrink-0">
                    {icon}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {title[0]}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">{title}</h3>
                  {subtitle && <p className="text-[10px] font-bold text-muted-foreground/40 leading-none mt-0.5">{subtitle}</p>}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="chat-search"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="flex-1 px-1"
              >
                <div className="relative">
                  <Input 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setMatchIndex(0);
                    }}
                    placeholder={t("type_message_placeholder")} 
                    className="h-10 text-xs pr-20" 
                  />
                  {searchQuery && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-muted/10 rounded-md">
                      <span className="text-[9px] font-bold text-muted-foreground px-2">{matchIndex + 1}/{matches.length}</span>
                      <button onClick={() => navigateMatch("up")} className="p-1 hover:text-primary"><ChevronRight size={14} className="-rotate-90" /></button>
                      <button onClick={() => navigateMatch("down")} className="p-1 hover:text-primary"><ChevronRight size={14} className="rotate-90" /></button>
                      <button onClick={() => setSearchQuery("")} className="p-1 hover:text-primary"><X size={12} /></button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-colors outline-none cursor-pointer">
              <MoreVertical size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1.5 bg-white border border-border shadow-2xl rounded-2xl z-[100] opacity-100">
              <DropdownMenuItem onClick={() => setShowSearch(!showSearch)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 text-xs font-bold text-foreground cursor-pointer transition-colors">
                <Search size={16} className="text-muted-foreground" /> {t("search")}
              </DropdownMenuItem>
              {onClearChat && (
                <DropdownMenuItem onClick={onClearChat} className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-600 cursor-pointer transition-colors">
                  <Trash2 size={16} /> {t("clear_chat")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </WorkspacePanelHeader>

        {/* Message List */}
        <WorkspacePanelContent className="px-0 py-0 !overflow-hidden flex flex-col min-h-0">
          <MessageList 
            messages={filteredMessages} 
            currentUserId={currentUserId}
            loading={loading}
            activeMatchId={activeMatchId}
          />
        </WorkspacePanelContent>

        {/* Message Input */}
        {!loading && (
          <WorkspacePanelFooter showDivider={true} className="p-0">
            <MessageInput 
              onSend={onSend}
              loading={sending}
              placeholder={placeholder}
            />
          </WorkspacePanelFooter>
        )}
      </WorkspacePanel>
  );
}
