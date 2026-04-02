"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { apiService } from "@/services/api";
import useSWR from "swr";
import { 
  Mail, Megaphone, Send, MessageSquare, Clock, 
  User, Users, ChevronRight, Search, Shield,
  Paperclip, FileText, Download, X, Calendar, ArrowLeft,
  MoreVertical, CheckCheck, Trash2, Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/DropdownMenu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSearchParams } from "next/navigation";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { ChatPanel } from "@/components/features/messaging/ChatPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { id as idLocale, enUS } from "date-fns/locale";
import { formatFriendlyDistance } from "@/lib/date-utils";
import { WorkspacePanel, WorkspacePanelHeader, WorkspacePanelContent } from "@/components/ui/WorkspacePanel";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface Attachment {
  url: string;
  filename: string;
  content_type: string;
}

interface Message {
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
  const role = user?.role?.name || "member";

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
  
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // useSWR for incremental fetching
  const { data: incrementalData, mutate } = useSWR(
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

            // Merge new messages into existing list
            const merged = [...prev];
            newMsgs.forEach((msg: Message) => {
              const idx = merged.findIndex(m => m.id === msg.id);
              if (idx > -1) {
                merged[idx] = msg; // Update existing
              } else {
                merged.unshift(msg); // Add new
              }
            });

            // Sort by creation date descending (newest first)
            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          // Update lastSync to the most recent message's updated_at or current time
          setLastSync(new Date().toISOString());
        }
        if (loading) setLoading(false);
      }
    }
  );

  const fetchMessages = useCallback(async (silent = false) => {
    // This is now handled by SWR mutate for manual refreshes
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
      title: `Re: ${selectedThread.lastMessage.title.replace(/^Re:\s*/, '')}`,
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setSendingReply(true);
    
    const formData = new FormData();
    formData.append("title", optimisticMsg.title);
    formData.append("body", bodyText);
    formData.append("recipient_type", "specific");
    formData.append("recipient_id", selectedThread.partnerId.toString());

    setIsPollingPaused(true);
    
    // 1. INSTANT UI RESET: Stop loading and clear input immediately
    setSendingReply(false);
    setReplyBody("");
    
    // 2. BACKGROUND SEND: Don't await the API call for the UI state
    apiService.messages.create(formData)
      .then(() => {
        // Quietly refresh in the background after a short delay
        setTimeout(() => {
          setIsPollingPaused(false);
          fetchMessages(true);
          refreshNotifications();
        }, 1000);
      })
      .catch((err) => { 
        console.error("Delayed send error:", err); 
        // Only if it fails, we notify and remove the optimistic message
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        toast(t("send_error"), "error");
        setIsPollingPaused(false);
      });

    // We don't use 'finally' here because we want the UI to be free immediately
  };
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const isMember = user?.role?.name === 'member';
  const [recipientType, setRecipientType] = useState(isMember ? "specific" : "all");
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (userSearchQuery.length < 2) {
        setUserSearchResults([]);
        return;
      }
      try {
        const res = await apiService.users.search(userSearchQuery);
        setUserSearchResults(res.users || []);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body) return;
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", "Messaging Update"); 
    formData.append("body", body);
    formData.append("recipient_type", recipientType);
    if (recipientType === 'specific' && recipientId) {
      formData.append("recipient_id", recipientId.toString());
    }
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    try {
      await apiService.messages.create(formData);
      setTitle("");
      setBody("");
      setRecipientType(isMember ? "specific" : "all");
      setRecipientId(null);
      setUserSearchQuery("");
      setAttachments([]);
      setActiveTab('inbox');
      await Promise.all([
        fetchMessages(true),
        refreshNotifications()
      ]);
    } catch (err: any) {
      console.error(err);
      toast(t("send_error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const conversationThreads = useMemo(() => {
    const threads: Record<number, ConversationThread> = {};
    messages.forEach(msg => {
      if (msg.recipient_type !== 'specific') return;
      
      const partnerId = Number(msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id);
      const partnerName = msg.sender_id === user?.id ? (msg.recipient_name || "User") : msg.sender_name;
      
      if (!partnerId) return;

      if (!threads[partnerId]) {
        threads[partnerId] = { 
          partnerId, 
          partnerName, 
          lastMessage: msg, 
          messages: [],
          lastSeen: (msg.sender_id === user?.id ? msg.recipient_last_seen : msg.sender_last_seen) || undefined
        };
      }
      threads[partnerId].messages.push(msg);
      
      const isNewer = new Date(msg.created_at) > new Date(threads[partnerId].lastMessage.created_at);
      if (isNewer) {
        threads[partnerId].lastMessage = msg;
        threads[partnerId].partnerName = partnerName;
        // Update lastSeen to the most recent data from any message in this thread
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
        fetchMessages(true);
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
      fetchMessages(true);
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
      icon={<Mail size={24} className="text-primary" />}
    >
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden p-6 md:p-8 bg-slate-50/50 gap-6">
        {/* Left Column: Navigation & List */}
        <div className={cn(
          "w-full md:w-96 flex flex-col transition-all duration-300 shrink-0 gap-4",
          selectedThread && activeTab === 'inbox' ? "hidden md:flex" : "flex"
        )}>
          {/* Tabs - Separated from Card */}
          <div className="inline-flex w-full p-1 bg-white border border-border/50 rounded-2xl shadow-sm shadow-black/[0.02]">
            <button 
              onClick={() => setActiveTab('inbox')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs",
                activeTab === 'inbox' 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mail size={16} /> {t("tab_inbox")}
            </button>
            <button 
              onClick={() => setActiveTab('compose')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs",
                activeTab === 'compose' 
                  ? "bg-primary text-white shadow-sm shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Send size={16} /> {t("tab_compose")}
            </button>
          </div>

          {/* List Card */}
          <WorkspacePanel isStatic={true} className="flex-1 flex flex-col border-border/50 shadow-black/[0.03]">
            <WorkspacePanelHeader showDivider={true} className="px-4 py-3 bg-white shrink-0 h-16">
            <AnimatePresence mode="wait">
              {!showInboxSearch ? (
                <motion.div 
                  key="title"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between w-full"
                >
                  <h3 className="text-xs font-bold text-foreground px-1">{t("tab_inbox")}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors outline-none cursor-pointer shrink-0">
                      <MoreVertical size={18} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-1.5 bg-white border border-border shadow-2xl rounded-2xl z-[100] opacity-100">
                      <DropdownMenuItem onClick={() => setShowInboxSearch(true)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 text-xs font-bold text-foreground cursor-pointer transition-colors">
                        <Search size={16} className="text-muted-foreground" /> {t("search")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ) : (
                <motion.div 
                  key="search"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex-1 flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Input 
                      autoFocus
                      value={inboxSearchQuery}
                      onChange={(e) => setInboxSearchQuery(e.target.value)}
                      placeholder={t("type_message_placeholder")} 
                      className="h-10 text-xs" 
                    />
                  </div>
                  <button 
                    onClick={() => { setShowInboxSearch(false); setInboxSearchQuery(""); }}
                    className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors shrink-0"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </WorkspacePanelHeader>

          {/* Contact List */}
          <WorkspacePanelContent className="p-2 space-y-1">
            {loading && messages.length === 0 ? (
              <div className="flex flex-col gap-2 p-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/20 animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted/30" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-muted/30 rounded" />
                      <div className="h-2 w-full bg-muted/20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversationThreads.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground opacity-50 flex flex-col items-center">
                <Mail size={32} strokeWidth={1} className="mb-4 opacity-10" />
                <p className="text-[12px] font-bold">{t("no_messages")}</p>
              </div>
            ) : (
              conversationThreads
                .filter(t => t.partnerName.toLowerCase().includes(inboxSearchQuery.toLowerCase()))
                .map((thread) => (
                <button
                  key={thread.partnerId}
                  onClick={() => { setSelectedThread(thread); setActiveTab('inbox'); }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-4 group",
                    selectedThread?.partnerId === thread.partnerId && activeTab === 'inbox' 
                      ? "bg-primary/5 ring-1 ring-primary/20 shadow-sm" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm">
                      {thread.partnerName[0]}
                    </div>
                    {/* Simplified online status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-[13px] text-foreground truncate group-hover:text-primary transition-colors">{thread.partnerName}</span>
                      <span className="text-[9px] font-medium text-muted-foreground opacity-60">
                        {formatFriendlyDistance(new Date(thread.lastMessage.created_at), { addSuffix: true, locale: dateFnsLocale })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium truncate opacity-70">
                      {thread.lastMessage.sender_id === user?.id ? t("you_prefix") : ""}{thread.lastMessage.body}
                    </p>
                  </div>
                </button>
              ))
            )}
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>

      {/* Right Column: Chat Panel or Compose */}
        <div className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'inbox' ? (
              selectedThread ? (
                <motion.div 
                  key={`chat-${selectedThread.partnerId}`}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <ChatPanel 
                    title={selectedThread.partnerName}
                    subtitle={(() => {
                      // Fallback to last message date if lastSeen account data is missing
                      const lastSeenAt = (selectedThread.lastSeen ? new Date(selectedThread.lastSeen) : null) || new Date(selectedThread.lastMessage.created_at);
                      
                      const isOnline = (new Date().getTime() - lastSeenAt.getTime()) < 5 * 60 * 1000;
                      if (isOnline) return t("online");
                      
                      return `${t("last_seen")} ${formatFriendlyDistance(lastSeenAt, { addSuffix: true, locale: dateFnsLocale })}`;
                    })()}
                    messages={messages
                      .filter(m => 
                        (m.sender_id === user?.id && m.recipient_id === selectedThread.partnerId) ||
                        (m.sender_id === selectedThread.partnerId && m.recipient_id === user?.id)
                      )
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    }
                    currentUserId={user?.id || 0}
                    onSend={handleSendReply}
                    onBack={() => setSelectedThread(null)}
                    onClearChat={() => setClearConfirmOpen(true)}
                    sending={sendingReply}
                  />
                </motion.div>
              ) : (
                <WorkspacePanel 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 border-border/50 shadow-black/[0.03]"
                >
                  <WorkspacePanelContent className="flex flex-col items-center justify-center p-12 text-center overflow-hidden">
                    <div className="w-24 h-24 rounded-[2rem] bg-muted/10 border border-border/50 flex items-center justify-center mb-6 shadow-all-sm">
                      <MessageSquare size={40} strokeWidth={1.5} className="text-primary/40" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{t("choose_conversation")}</h3>
                    <p className="text-sm text-muted-foreground font-medium max-w-[320px] leading-relaxed">
                      Pilih salah satu kontak di sebelah kiri untuk mulai membaca pesan atau kirim pesan baru.
                    </p>
                  </WorkspacePanelContent>
                </WorkspacePanel>
              )
            ) : (
              <WorkspacePanel 
                key="compose"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 border-border/50 shadow-black/[0.03]"
              >
                <WorkspacePanelHeader showDivider={true} className="px-6 py-4 bg-muted/10 h-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                      <Send size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{t("compose_title")}</h3>
                    </div>
                  </div>
                </WorkspacePanelHeader>

                <form onSubmit={handleSendMessage} className="flex-1 flex flex-col p-6 min-h-0">
                  <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1 min-h-0">
                      {/* Form Fields */}
                      <div className="space-y-4 flex flex-col">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground px-1 tracking-tight">{t("recipient_type")}</label>
                          <div className={cn(
                            "grid p-1 bg-muted rounded-xl border border-border/50",
                            isMember ? "grid-cols-1" : "grid-cols-2"
                          )}>
                            {!isMember && (
                              <button 
                                type="button" 
                                onClick={() => { setRecipientType('all'); setRecipientId(null); }} 
                                className={cn(
                                  "py-2 px-4 rounded-lg text-xs font-bold transition-all",
                                  recipientType === 'all' 
                                    ? "bg-card text-primary shadow-sm" 
                                    : "text-muted-foreground hover:bg-card/50"
                                )}
                              >
                                {t("recipient_member")}
                              </button>
                            )}
                            <button 
                              type="button" 
                              onClick={() => setRecipientType('specific')} 
                              className={cn(
                                "py-2 px-4 rounded-lg text-xs font-bold transition-all",
                                recipientType === 'specific' 
                                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                  : "text-muted-foreground hover:bg-card/50 shadow-sm"
                              )}
                            >
                              {t("recipient_individual")}
                            </button>
                          </div>
                        </div>

                        {recipientType === 'specific' && (
                          <div className="space-y-2 relative">
                            <label className="text-xs font-bold text-muted-foreground px-1 tracking-tight">{t("search_contacts")}</label>
                            <div className="relative group">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-colors z-10" size={16} />
                              <Input 
                                type="text" 
                                value={userSearchQuery} 
                                onChange={(e) => setUserSearchQuery(e.target.value)} 
                                placeholder={t("search_contacts")} 
                                className="pl-10 h-12" 
                              />
                            </div>
                            <AnimatePresence>
                              {userSearchResults.length > 0 && userSearchQuery.length >= 2 && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-50 w-full mt-2 bg-card border border-border shadow-xl rounded-2xl overflow-hidden max-h-52 overflow-y-auto"
                                >
                                  {userSearchResults.map(u => (
                                      <button 
                                        key={u.id} 
                                        type="button" 
                                        onClick={() => { setRecipientId(u.id); setUserSearchQuery(u.name); setUserSearchResults([]); }} 
                                        className="w-full text-left px-5 py-4 hover:bg-muted/50 text-xs font-bold border-b last:border-0 border-border/30 transition-colors flex items-center gap-4"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                          {u.name[0]}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-foreground">{u.name}</span>
                                          <span className="text-[10px] text-muted-foreground font-medium">{u.role?.name || "Member"}</span>
                                        </div>
                                      </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        <div className="space-y-2">
                           <label className="text-xs font-bold text-muted-foreground px-1 tracking-tight">{t("attachment")}</label>
                           <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border/50 rounded-2xl cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all group">
                              <Paperclip size={20} className="text-muted-foreground opacity-30 group-hover:text-primary group-hover:scale-110 transition-all mb-1" />
                              <span className="text-[11px] font-bold text-muted-foreground">{attachments.length > 0 ? t("files_selected", { count: attachments.length }) : t("click_to_upload")}</span>
                              <input type="file" multiple className="hidden" onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files || [])])} />
                           </label>
                           {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {attachments.map((file, idx) => (
                                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl text-[10px] font-bold border border-border/50 shadow-sm">
                                        <FileText size={12} className="text-primary" />
                                        <span className="truncate max-w-[100px]">{file.name}</span>
                                        <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="text-rose-500 hover:scale-125 transition-transform">
                                            <X size={14} />
                                        </button>
                                      </div>
                                  ))}
                                </div>
                            )}
                        </div>
                          <div className="flex-1" />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0 gap-4">
                          <div className="flex-1 flex flex-col min-h-0">
                            <label className="text-xs font-bold text-muted-foreground px-1 tracking-tight mb-2">{t("body")}</label>
                            <Textarea 
                              value={body} 
                              onChange={(e) => setBody(e.target.value)} 
                              placeholder={t("body_placeholder")} 
                              className="flex-1"
                              required 
                            />
                          </div>
                          
                          <div className="shrink-0 space-y-4">
                            <Button 
                              type="submit" 
                              disabled={submitting} 
                              className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
                            >
                              {submitting ? t("sending") : <><Send size={16} className="mr-2" /> {t("send_button")}</>}
                            </Button>

                            <div className="flex items-center justify-center gap-2 opacity-40">
                               <Shield size={14} className="text-emerald-600" />
                               <p className="text-[10px] italic font-medium">{t("security_note")}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </WorkspacePanel>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Modals/Dialogs */}
      <AnimatePresence>
        <Modal 
          isOpen={!!selectedBroadcast} 
          onClose={() => setSelectedBroadcast(null)} 
          className="max-w-2xl w-full p-0 overflow-hidden"
        >
          {selectedBroadcast && (
            <div className="flex flex-col bg-card">
              <div className="p-8 border-b border-border/50 bg-muted/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setSelectedBroadcast(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="inline-flex items-center px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold mb-4">
                  Broadcast Alert
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight">{selectedBroadcast.title}</h3>
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {selectedBroadcast.sender_name?.[0]}
                    </div>
                    <span>{selectedBroadcast.sender_name}</span>
                  </div>
                  <span className="opacity-30">•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" />
                    <span>{new Date(selectedBroadcast.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 overflow-y-auto max-h-[50vh] custom-scrollbar">
                <p className="text-sm font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {selectedBroadcast.body}
                </p>
                
                {selectedBroadcast.attachments && selectedBroadcast.attachments.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
                    <h4 className="text-[10px] font-bold text-muted-foreground">Lampiran</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedBroadcast.attachments.map((att: any, i: number) => (
                        <a 
                          key={i} 
                          href={`${process.env.NEXT_PUBLIC_API_URL}${att.url}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center justify-between p-4 bg-muted/50 border border-border/50 rounded-2xl hover:bg-primary/5 transition-all group"
                        >
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center group-hover:text-primary transition-colors">
                                <FileText size={18} />
                             </div>
                             <span className="text-xs font-bold text-foreground truncate max-w-[240px]">{att.filename}</span>
                           </div>
                           <Download size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-y-0.5 transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-muted/10 border-t border-border/50 flex justify-end">
                <Button onClick={() => setSelectedBroadcast(null)} variant="outline" className="px-6 h-10 rounded-xl font-bold">
                   Tutup
                </Button>
              </div>
            </div>
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--border), 0.5); border-radius: 4px; }
      `}</style>
    </DashboardPage>
  );
}
