"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { apiService } from "@/services/api";
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
import { PageHeader } from "@/components/layout/PageHeader";
import { formatFriendlyDistance } from "@/lib/date-utils";
import { id as idLocale, enUS } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSearchParams } from "next/navigation";

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
  created_at: string;
  attachments?: Attachment[];
}

interface ConversationThread {
  partnerId: number;
  partnerName: string;
  partnerStatus?: 'online' | 'offline';
  lastSeen?: string;
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
  const dateFnsLocale = locale === 'id' ? idLocale : enUS;
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [inboxSearchQuery, setInboxSearchQuery] = useState("");
  const [showInboxSearch, setShowInboxSearch] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const hasInitialLoaded = useRef(false);
  const lastMessageId = useRef<number | null>(null);

  useEffect(() => {
    if (selectedThread) {
      const currentLastMsg = selectedThread.messages[selectedThread.messages.length - 1];
      if (currentLastMsg && currentLastMsg.id !== lastMessageId.current) {
        lastMessageId.current = currentLastMsg.id;
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
      }
    } else {
      lastMessageId.current = null;
    }
  }, [selectedThread, messages]);

  const handleSendReply = async () => {
    if (!replyBody.trim() || !selectedThread) return;
    
    const bodyText = replyBody;
    const optimisticMsg = {
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
    setReplyBody("");
    setSendingReply(true);
    
    const formData = new FormData();
    formData.append("title", optimisticMsg.title);
    formData.append("body", bodyText);
    formData.append("recipient_type", "specific");
    formData.append("recipient_id", selectedThread.partnerId.toString());

    try {
      await apiService.messages.create(formData);
      await Promise.all([
        fetchMessages(true),
        refreshNotifications()
      ]);
    } catch (err) { 
      console.error(err); 
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally { 
      setSendingReply(false); 
    }
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

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiService.messages.list();
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { 
    const isFirstTime = !hasInitialLoaded.current;
    fetchMessages(!isFirstTime); 
    if (isFirstTime) hasInitialLoaded.current = true;
    
    if (activeTab === 'inbox') markMessagesAsRead();
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, [activeTab, fetchMessages, markMessagesAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body) return;
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", "Messaging Update"); // Internal auto-title now that subject is removed
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
        threads[partnerId] = { partnerId, partnerName, lastMessage: msg, messages: [] };
      }
      threads[partnerId].messages.push(msg);
      
      if (new Date(msg.created_at) > new Date(threads[partnerId].lastMessage.created_at)) {
        threads[partnerId].lastMessage = msg;
        threads[partnerId].partnerName = partnerName;
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
    <>
    <div className="flex flex-col h-full bg-[--color-background] overflow-hidden pt-2">


      <div className="flex-1 flex gap-2 px-1.5 pb-2 overflow-hidden min-h-0">
        {/* Left Column: Navigation & List */}
        <div className={cn(
          "flex-[0.3] min-w-[300px] h-full flex flex-col gap-4 transition-all duration-500",
          selectedThread && activeTab === 'inbox' ? "hidden md:flex" : "flex",
          activeTab === 'compose' ? "opacity-90 scale-[0.99] transition-all" : "opacity-100"
        )}>
          {/* Toggle Switch inside Left Column */}
          <div className="inline-flex p-1 bg-[--color-surface] rounded-xl border border-[--color-border]/50 shadow-none shrink-0 w-full mb-2">
            <button 
              onClick={() => setActiveTab('inbox')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px]",
                activeTab === 'inbox' 
                  ? "bg-[--color-primary] text-white" 
                  : "text-[--color-muted-foreground] hover:text-[--color-text] hover:bg-[--color-muted]"
              )}
            >
              <Mail size={16} strokeWidth={2.5} />
              {t("tab_inbox")}
            </button>
            <button 
              onClick={() => setActiveTab('compose')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px]",
                activeTab === 'compose' 
                  ? "bg-[--color-primary] text-white" 
                  : "text-[--color-muted-foreground] hover:text-[--color-text] hover:bg-[--color-muted]"
              )}
            >
              <Send size={16} strokeWidth={2.5} />
              {t("tab_compose")}
            </button>
          </div>

          {/* List Card */}
          <div className="flex-1 flex flex-col bg-[--color-surface] rounded-[2rem] border border-[--color-border]/50 shadow-none overflow-hidden">
            <div className="px-4 py-3 border-b border-[--color-border]/50 flex items-center justify-between shrink-0 h-16 bg-[--color-surface]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {!showInboxSearch ? (
                    <motion.h2 
                      key="title"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[16px] font-bold text-[--color-text] truncate"
                    >
                      {t("tab_inbox")}
                    </motion.h2>
                  ) : (
                    <motion.div 
                      key="search"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-2 flex-1"
                    >
                      <button 
                        onClick={() => { setShowInboxSearch(false); setInboxSearchQuery(""); }} 
                        className="p-1.5 hover:bg-[--color-muted] rounded-lg text-[--color-muted-foreground] transition-colors shrink-0"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted-foreground]/40" size={14} />
                        <input 
                          autoFocus
                          type="text" 
                          value={inboxSearchQuery}
                          onChange={(e) => setInboxSearchQuery(e.target.value)}
                          placeholder={t("search_contacts")} 
                          className="w-full pl-9 pr-8 py-2 bg-[--color-muted]/5 border border-[--color-border]/30 rounded-lg text-xs outline-none focus:bg-[--color-surface] transition-all font-medium" 
                        />
                        {inboxSearchQuery && (
                          <button 
                            onClick={() => setInboxSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[--color-muted] rounded-md transition-colors"
                          >
                            <X size={12} className="text-[--color-muted-foreground]/60" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-[--color-muted] text-[--color-muted-foreground] transition-all cursor-pointer outline-none">
                      <MoreVertical size={18} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-1.5 bg-[--color-surface] border border-[--color-border] shadow-2xl rounded-2xl">
                    <DropdownMenuItem 
                      onClick={() => setShowInboxSearch(!showInboxSearch)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[--color-muted]/50 text-xs font-bold text-[--color-text] cursor-pointer transition-colors"
                    >
                      <Search size={16} className="text-[--color-muted-foreground]" />
                      {t("search_contacts")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { fetchMessages(true); markMessagesAsRead(); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[--color-muted]/50 text-xs font-bold text-[--color-text] cursor-pointer transition-colors">
                      <CheckCheck size={16} className="text-[--color-primary]" />
                      <span>{t("mark_all_read")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setClearConfirmOpen(true)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-600 cursor-pointer transition-colors">
                      <Trash2 size={16} />
                      <span>{t("delete_all")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1 py-2">
              {loading ? (
                <div className="p-12 text-center animate-pulse space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[--color-muted] mx-auto" />
                  <div className="h-3 w-32 bg-[--color-muted] mx-auto rounded-full" />
                </div>
              ) : conversationThreads.length === 0 ? (
                <div className="p-20 text-center text-[--color-muted-foreground]/20 flex flex-col items-center">
                  <Mail size={48} strokeWidth={1} className="mb-4 opacity-10" />
                  <p className="text-[12px] font-bold">{t("no_messages")}</p>
                </div>
              ) : (
                <AnimatePresence>
                  {conversationThreads
                    .filter(t => t.partnerName.toLowerCase().includes(inboxSearchQuery.toLowerCase()))
                    .map((thread) => (
                    <motion.button
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      key={thread.partnerId}
                      onClick={() => setSelectedThread(thread)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-4 relative group hover:bg-[--color-muted]/20",
                        selectedThread?.partnerId === thread.partnerId && activeTab === 'inbox' 
                          ? "bg-[--color-muted]/50 border-l-[3px] border-[--color-primary] rounded-l-none pl-3" 
                          : "border-l-[3px] border-transparent"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[--color-primary]/10 text-[--color-primary] flex items-center justify-center font-bold text-base shrink-0 transition-transform duration-300">
                        {thread.partnerName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-[14px] text-[--color-text] truncate tracking-tight">{thread.partnerName}</span>
                          <span className="text-[9px] font-bold text-[--color-muted-foreground] opacity-60">
                            {formatFriendlyDistance(new Date(thread.lastMessage.created_at), { addSuffix: true, locale: dateFnsLocale })}
                          </span>
                        </div>
                        <p className="text-[12px] text-[--color-muted-foreground] font-medium truncate opacity-70 leading-tight">
                          {thread.lastMessage.sender_id === user?.id ? t("you_prefix") : ""}{thread.lastMessage.body}
                        </p>
                      </div>

                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Main Content Area */}
        <div className={cn(
          "flex-1 h-full flex flex-col bg-[--color-surface] rounded-[2rem] border border-[--color-border]/50 shadow-none overflow-hidden transition-all duration-500",
          !selectedThread && activeTab === 'inbox' ? "hidden md:flex" : "flex"
        )}>
        {activeTab === 'inbox' ? (
          selectedThread ? (
            <div className="flex-1 flex flex-col min-w-0 h-full scroll-smooth bg-[--color-surface]">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-[--color-border]/50 flex items-center justify-between shrink-0 z-10 bg-[--color-surface] transition-all h-16">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button 
                      onClick={() => { 
                        if (showChatSearch) {
                          setShowChatSearch(false);
                          setChatSearchQuery("");
                        } else {
                          setSelectedThread(null);
                        }
                      }} 
                      className="p-2 hover:bg-[--color-muted] rounded-xl text-[--color-muted-foreground] transition-colors shrink-0"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <AnimatePresence mode="wait">
                      {!showChatSearch ? (
                        <motion.div 
                          key="info"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[--color-primary]/10 text-[--color-primary] flex items-center justify-center font-bold text-lg shadow-none shrink-0">
                            {selectedThread.partnerName[0]}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="font-bold text-[--color-text] text-sm truncate">{selectedThread.partnerName}</h3>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const partnerMsgs = selectedThread.messages.filter(m => m.sender_id === selectedThread.partnerId);
                                const lastPartnerMsg = partnerMsgs[partnerMsgs.length - 1];
                                const lastSeenDate = lastPartnerMsg ? new Date(lastPartnerMsg.created_at) : null;
                                const isOnline = lastSeenDate && (new Date().getTime() - lastSeenDate.getTime()) < 5 * 60 * 1000;
                                
                                return (
                                  <>
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                      isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                    )} />
                                    <span className={cn(
                                      "text-[9px] font-bold tracking-tighter transition-colors capitalize",
                                      isOnline ? "text-emerald-600" : "text-slate-500"
                                    )}>
                                      {isOnline ? t("online") : (
                                        <>
                                          {t("offline")} {lastSeenDate && (
                                            <>
                                              <span className="opacity-40 ml-1 mr-1">•</span> {t("last_seen")} {(() => {
                                                const today = new Date();
                                                const isToday = lastSeenDate.toDateString() === today.toDateString();
                                                const yesterday = new Date(today);
                                                yesterday.setDate(today.getDate() - 1);
                                                const isYesterday = lastSeenDate.toDateString() === yesterday.toDateString();
                                                
                                                let dayStr = "";
                                                if (isToday) dayStr = locale === 'id' ? "Hari ini" : "Today";
                                                else if (isYesterday) dayStr = locale === 'id' ? "Kemarin" : "Yesterday";
                                                else dayStr = lastSeenDate.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });

                                                return `${dayStr}, ${lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                              })()}
                                            </>
                                          )}
                                        </>
                                      )}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="search"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex-1 px-1"
                        >
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted-foreground]/40" size={14} />
                            <input 
                              autoFocus
                              type="text" 
                              value={chatSearchQuery}
                              onChange={(e) => {
                                setChatSearchQuery(e.target.value);
                                setCurrentMatchIndex(0);
                              }}
                              placeholder={t("search")} 
                              className="w-full pl-9 pr-24 py-2 bg-[--color-muted]/5 border border-[--color-border]/30 rounded-lg text-xs outline-none focus:bg-[--color-surface] focus:border-[--color-primary]/20 transition-all font-medium" 
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                              {chatSearchQuery && (
                                <>
                                  <div className="flex items-center bg-[--color-muted]/10 rounded-md px-1 mr-1">
                                    <span className="text-[10px] font-bold text-[--color-muted-foreground] px-1 whitespace-nowrap">
                                      {(() => {
                                        const matches = selectedThread.messages.filter(m => m.body.toLowerCase().includes(chatSearchQuery.toLowerCase()));
                                        return matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : '0/0';
                                      })()}
                                    </span>
                                    <button 
                                      onClick={() => {
                                        const matches = selectedThread.messages.filter(m => m.body.toLowerCase().includes(chatSearchQuery.toLowerCase()));
                                        if (matches.length === 0) return;
                                        const newIndex = currentMatchIndex > 0 ? currentMatchIndex - 1 : matches.length - 1;
                                        setCurrentMatchIndex(newIndex);
                                        const targetId = `msg-${matches[newIndex].id}`;
                                        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }}
                                      className="p-1 hover:text-[--color-primary] transition-colors"
                                    >
                                      <ChevronRight size={14} className="-rotate-90" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const matches = selectedThread.messages.filter(m => m.body.toLowerCase().includes(chatSearchQuery.toLowerCase()));
                                        if (matches.length === 0) return;
                                        const newIndex = currentMatchIndex < matches.length - 1 ? currentMatchIndex + 1 : 0;
                                        setCurrentMatchIndex(newIndex);
                                        const targetId = `msg-${matches[newIndex].id}`;
                                        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }}
                                      className="p-1 hover:text-[--color-primary] transition-colors"
                                    >
                                      <ChevronRight size={14} className="rotate-90" />
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => { setChatSearchQuery(""); setCurrentMatchIndex(0); }}
                                    className="p-1 hover:bg-[--color-muted] rounded-md transition-colors"
                                  >
                                    <X size={12} className="text-[--color-muted-foreground]/60" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2.5 hover:bg-[--color-muted] rounded-xl text-[--color-muted-foreground] transition-colors outline-none">
                        <MoreVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-1.5 bg-[--color-surface] border border-[--color-border] shadow-2xl rounded-2xl">
                        <DropdownMenuItem 
                          onClick={() => setShowChatSearch(!showChatSearch)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[--color-muted]/50 text-xs font-bold text-[--color-text] cursor-pointer transition-colors"
                        >
                          <Search size={16} className="text-[--color-muted-foreground]" />
                          {t("search")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                           onClick={() => setClearConfirmOpen(true)}
                           className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-600 cursor-pointer transition-colors"
                        >
                          <Trash2 size={16} />
                          {t("clear_chat")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Chat Content */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 bg-[--color-muted]/5">
                  {selectedThread.messages
                    .filter(m => !chatSearchQuery || m.body.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                    .map((msg, idx, filtered) => {
                    const isMe = msg.sender_id === user?.id;
                    const isActiveMatch = chatSearchQuery && filtered[currentMatchIndex]?.id === msg.id;
                    const prevMsg = selectedThread.messages[idx - 1];
                    const showTime = !prevMsg || 
                      new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                    return (
                      <React.Fragment key={msg.id}>
                        {showTime && (
                          <div className="flex justify-center my-10 relative">
                             <div className="absolute inset-0 flex items-center px-20 opacity-10">
                               <div className="w-full h-px bg-[--color-text]" />
                             </div>
                            <span className="relative z-10 px-6 py-2 bg-[--color-surface] text-[10px] font-bold text-[--color-muted-foreground] rounded-full border border-[--color-border] shadow-sm uppercase tracking-widest">
                              {new Date(msg.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                        
                        <div 
                          id={`msg-${msg.id}`}
                          className={cn(
                          "flex w-full mb-1 scroll-mt-20",
                          isMe ? "justify-end" : "justify-start"
                        )}>
                          <motion.div 
                            initial={(msg.id < 0 || !isMe) ? { opacity: 0, scale: 0.9, y: 10 } : false}
                            animate={{ 
                              opacity: 1, 
                              scale: 1, 
                              y: 0,
                              outline: isActiveMatch ? '1.5px solid var(--color-primary)' : 'none',
                              outlineOffset: '1.5px'
                            }}
                            className={cn(
                              "group relative px-4 py-1.5 shadow-none max-w-[85%] sm:max-w-[75%] transition-all",
                              isMe 
                                ? "bg-[--color-primary] text-white rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] ml-12" 
                                : "bg-white text-[--color-text] border border-[--color-border]/60 rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] mr-12",
                              isActiveMatch && "ring-2 ring-[--color-primary]/15 ring-offset-1 z-10"
                            )}
                          >
                            <div className="flex items-end gap-3 min-w-0">
                                <p className="whitespace-pre-wrap leading-relaxed font-medium text-[13px] flex-1 min-w-0">{msg.body}</p>
                                <div className={cn(
                                "flex items-center gap-1.5 text-[9px] font-bold opacity-30 shrink-0 select-none pb-0.5",
                                isMe ? "text-white/80" : "text-[--color-muted-foreground]"
                                )}>
                                {new Date(msg.created_at).toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                            </div>
                          </motion.div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="px-6 py-4 bg-[--color-surface] border-t border-[--color-border]/30 flex items-center gap-4 shrink-0 transition-all duration-300">
                  <div className="flex-1 relative group">
                    <textarea 
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder={t("type_message_placeholder")}
                      className="w-full bg-[--color-muted]/20 border border-[--color-border] rounded-[2rem] px-6 py-4 outline-none transition-all resize-none custom-scrollbar text-[13px] leading-relaxed shadow-inner font-medium h-[64px]"
                      rows={1}
                      style={{ maxHeight: '160px' }}
                    />
                  </div>
                  <Button 
                    onClick={handleSendReply}
                    disabled={!replyBody.trim() || sendingReply}
                    className="h-16 w-16 rounded-[2rem] shrink-0 p-0 flex items-center justify-center shadow-xl shadow-[--color-primary]/20 text-white hover:scale-110 active:scale-95 transition-all bg-[--color-primary] border-none group"
                  >
                    {sendingReply ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} strokeWidth={2.5} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[--color-muted-foreground]/10 flex-col gap-8 p-20 bg-[--color-muted]/5">
                <div className="w-32 h-32 rounded-[3rem] bg-[--color-muted]/10 flex items-center justify-center animate-in zoom-in duration-700 shadow-inner">
                   <MessageSquare size={64} strokeWidth={1} className="opacity-20" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[14px] font-bold text-[--color-muted-foreground]/40 tracking-tight">{t("choose_conversation")}</p>
                  <p className="text-[11px] font-medium text-[--color-muted-foreground]/20">Pilih salah satu kontak di sebelah kiri untuk mulai mengobrol.</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col h-full bg-[--color-surface] overflow-hidden">
            <div className="px-4 py-3 border-b border-[--color-border]/40 bg-[--color-muted]/5 shrink-0 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-[--color-primary]/10 flex items-center justify-center text-[--color-primary] shadow-none">
                      <Send size={18} />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-[--color-text]">{t("compose_title")}</h3>
                     <p className="text-[10px] font-bold text-[--color-muted-foreground]/30 leading-none mt-0.5">Pesan Baru</p>
                   </div>
                 </div>
              </div>

              <form onSubmit={handleSendMessage} className="flex-1 flex flex-col overflow-hidden bg-[--color-muted]/5">
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                      {/* Left Side: Metadata */}
                      <div className="space-y-4 bg-[--color-surface] p-5 rounded-2xl border border-[--color-border]/50 shadow-none transition-all">
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-[--color-text] ml-1 flex items-center gap-2">
                             {t("recipient_type")}
                          </label>
                          <div className={cn(
                            "grid p-1 bg-[--color-muted]/20 rounded-xl border border-[--color-border]/20",
                            isMember ? "grid-cols-1" : "grid-cols-2"
                          )}>
                            {!isMember && (
                              <button 
                                type="button" 
                                onClick={() => { setRecipientType('all'); setRecipientId(null); }} 
                                className={cn(
                                  "py-2.5 px-4 rounded-lg text-[12px] font-bold transition-all",
                                  recipientType === 'all' 
                                    ? "bg-[--color-primary] text-white" 
                                    : "text-[--color-muted-foreground] hover:bg-[--color-muted]/50"
                                )}
                              >
                                {t("recipient_member")}
                              </button>
                            )}
                            <button 
                              type="button" 
                              onClick={() => setRecipientType('specific')} 
                              className={cn(
                                "py-2.5 px-4 rounded-lg text-[12px] font-bold transition-all",
                                recipientType === 'specific' 
                                  ? "bg-[--color-primary] text-white" 
                                  : "text-[--color-muted-foreground] hover:bg-[--color-muted]/50"
                              )}
                            >
                              {t("recipient_individual")}
                            </button>
                          </div>
                        </div>

                        {recipientType === 'specific' && (
                          <div className="space-y-2 relative">
                            <label className="text-[13px] font-bold text-[--color-text] ml-1 flex items-center gap-2">
                               {t("recipient_individual")}
                            </label>
                            <div className="relative group">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[--color-muted-foreground]/30 transition-colors" size={15} />
                              <input 
                                type="text" 
                                value={userSearchQuery} 
                                onChange={(e) => setUserSearchQuery(e.target.value)} 
                                placeholder={t("search_contacts")} 
                                className="w-full pl-10 pr-4 py-2.5 bg-[--color-muted]/20 border border-[--color-border]/30 rounded-xl text-xs focus:bg-[--color-surface] transition-all outline-none font-medium" 
                              />
                            </div>
                            <AnimatePresence>
                              {userSearchResults.length > 0 && userSearchQuery.length >= 2 && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  className="absolute z-50 w-full mt-2 bg-[--color-surface] border border-[--color-border] shadow-2xl rounded-xl overflow-hidden max-h-52 overflow-y-auto"
                                >
                                  {userSearchResults.map(u => (
                                      <button 
                                        key={u.id} 
                                        type="button" 
                                        onClick={() => { setRecipientId(u.id); setUserSearchQuery(u.name); setUserSearchResults([]); }} 
                                        className="w-full text-left px-6 py-5 hover:bg-[--color-primary]/5 text-[13px] font-semibold border-b last:border-0 border-[--color-border]/30 transition-colors flex items-center gap-5 group"
                                      >
                                        <div className="w-12 h-12 rounded-2xl bg-[--color-primary]/10 flex items-center justify-center text-[--color-primary] group-hover:bg-[--color-primary] group-hover:text-white transition-all text-lg font-bold shadow-inner">
                                          {u.name[0]}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[--color-text] group-hover:text-[--color-primary] transition-colors">{u.name}</span>
                                          <span className="text-[10px] text-[--color-muted-foreground] font-bold opacity-40 uppercase tracking-tighter">Pilih Kontak</span>
                                        </div>
                                      </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}



                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-[--color-text] ml-1 flex items-center gap-2">
                             {t("attachment")}
                          </label>
                          <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[--color-border] rounded-xl cursor-pointer hover:bg-[--color-primary]/5 hover:border-[--color-primary]/30 transition-all bg-[--color-muted]/5 group">
                              <div className="w-9 h-9 rounded-lg bg-[--color-primary]/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Paperclip size={16} className="text-[--color-primary] opacity-40 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                              </div>
                              <span className="text-[10px] font-bold text-[--color-text]">{attachments.length > 0 ? t("files_selected", { count: attachments.length }) : t("click_to_upload")}</span>
                              <input type="file" multiple className="hidden" onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files || [])])} />
                          </label>
                            <AnimatePresence>
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2.5 mt-6">
                                {attachments.map((file, idx) => (
                                    <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={idx} 
                                    className="flex items-center gap-3 px-4 py-2 bg-[--color-surface] border border-[--color-primary]/20 rounded-xl text-[10px] font-bold shadow-sm"
                                    >
                                    <FileText size={14} className="text-[--color-primary]" />
                                    <span className="truncate max-w-[120px] text-[--color-text]">{file.name}</span>
                                    <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="ml-1 text-rose-500 hover:scale-125 transition-transform">
                                        <X size={14} />
                                    </button>
                                    </motion.div>
                                ))}
                                </div>
                            )}
                            </AnimatePresence>
                        </div>
                      </div>

                      {/* Right Side: Message Body & Action */}
                      <div className="flex flex-col h-full bg-[--color-surface] p-5 rounded-2xl border border-[--color-border]/30 shadow-none gap-4 transition-all">
                        <div className="flex-1 flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-[--color-text] ml-1 flex items-center gap-2">
                             {t("body")}
                          </label>
                          <textarea 
                            value={body} 
                            onChange={(e) => setBody(e.target.value)} 
                            placeholder="Tulis pesan..." 
                            className="flex-1 min-h-[180px] w-full p-4 bg-[--color-muted]/5 border border-[--color-border]/30 rounded-xl text-[14px] font-medium leading-[1.6] resize-none focus:bg-[--color-surface] transition-all outline-none custom-scrollbar shadow-inner" 
                            required 
                          />
                        </div>
                        
                        <div className="flex flex-col items-center justify-center pt-3 border-t border-[--color-border]/20 gap-4 mt-auto">
                          <Button 
                            type="submit" 
                            disabled={submitting} 
                            className="w-full h-11 px-10 rounded-xl font-bold text-[14px] bg-[--color-primary] border-none text-white transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-[--color-primary]/10 flex items-center justify-center gap-3 whitespace-nowrap"
                          >
                            <span>{submitting ? t("sending") : t("send_button")}</span>
                            {!submitting && <Send size={18} strokeWidth={2.5} />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Full Width Compact Footer Note */}
                    <div className="mt-3 pt-2 border-t border-[--color-border]/20 flex items-center justify-center gap-3 transition-all">
                       <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
                          <Shield size={18} strokeWidth={2.5} />
                       </div>
                       <p className="text-[12px] italic font-medium text-[--color-muted-foreground]/70 leading-relaxed text-center">
                          {t("security_note")}
                       </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Modal and Dialogs should be as siblings within Fragment */}
      <AnimatePresence>
      <Modal isOpen={!!selectedBroadcast} onClose={() => setSelectedBroadcast(null)} className="max-w-2xl w-full p-0 overflow-hidden rounded-[3rem] bg-[--color-surface] border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
        {selectedBroadcast && (
          <div className="flex flex-col">
            <div className="p-10 border-b border-[--color-border]/40 bg-[--color-muted]/5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[--color-primary]/5 rounded-full blur-3xl" />
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[--color-primary]/10 border border-[--color-primary]/20 text-[--color-primary] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                Broadcast Information
              </div>
              <h3 className="text-3xl font-black text-[--color-text] mb-10 leading-[1.1] tracking-tight">{selectedBroadcast.title}</h3>
              <div className="flex flex-wrap items-center gap-10 text-[11px] font-bold text-[--color-muted-foreground]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-[--color-surface] shadow-xl border border-[--color-border] flex items-center justify-center text-[--color-primary] font-black text-xl">
                    {selectedBroadcast.sender_name?.[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[--color-text] text-sm">{selectedBroadcast.sender_name}</span>
                    <span className="opacity-40 uppercase text-[9px] tracking-[0.1em]">Verified Sender</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-[--color-surface] shadow-xl border border-[--color-border] flex items-center justify-center text-emerald-500">
                    <Calendar size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[--color-text] text-sm">
                      {new Date(selectedBroadcast.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="opacity-40 uppercase text-[9px] tracking-[0.1em]">Published Date</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-10 overflow-y-auto max-h-[50vh] custom-scrollbar bg-[--color-surface] relative">
              <div className="text-[16px] font-medium leading-[1.9] text-[--color-text] opacity-80 whitespace-pre-wrap">{selectedBroadcast.body}</div>
              
              {selectedBroadcast.attachments && selectedBroadcast.attachments.length > 0 && (
                <div className="mt-16 space-y-6">
                  <h4 className="text-[10px] font-black text-[--color-muted-foreground] uppercase tracking-[0.3em] ml-1 flex items-center gap-3">
                    <div className="w-px h-4 bg-[--color-primary]" />
                    LAMPIRAN DOKUMEN ({selectedBroadcast.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedBroadcast.attachments.map((att: any, i: number) => (
                      <a key={i} href={`${process.env.NEXT_PUBLIC_API_URL}${att.url}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-[--color-muted]/10 border border-[--color-border] rounded-[2rem] hover:bg-[--color-primary]/5 hover:border-[--color-primary]/30 transition-all group shadow-sm hover:shadow-md">
                         <div className="flex items-center gap-5">
                           <div className="w-14 h-14 rounded-2xl bg-[--color-surface] border border-[--color-border] flex items-center justify-center text-[--color-muted-foreground] group-hover:text-[--color-primary] group-hover:rotate-6 transition-all shadow-inner">
                              <FileText size={22} />
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[13px] font-black text-[--color-text] truncate max-w-[320px] tracking-tight">{att.filename}</span>
                             <span className="text-[10px] text-[--color-primary] opacity-70 uppercase font-black tracking-widest mt-0.5">Verified Safe Content</span>
                           </div>
                         </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[--color-primary]/10 transition-colors">
                           <Download size={22} className="text-[--color-muted-foreground] group-hover:text-[--color-primary] group-hover:translate-y-1 transition-all" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-10 bg-[--color-muted]/5 border-t border-[--color-border]/30 flex justify-end gap-4">
              <Button onClick={() => setSelectedBroadcast(null)} className="h-14 px-10 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-[--color-surface] border border-[--color-border] text-[--color-text] hover:bg-[--color-muted] hover:scale-105 active:scale-95 transition-all shadow-xl">
                 Sudah Mengerti
              </Button>
            </div>
          </div>
        )}
      </Modal>
      </AnimatePresence>

      {/* Confirmation Dialogs */}
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
      `}</style>
    </>
  );
}
