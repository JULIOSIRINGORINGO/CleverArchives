"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { apiService } from "@/services/api";
import useSWR from "swr";
import { 
  Megaphone, Inbox, Send, MessageSquare, 
  Clock, CheckCircle, AlertCircle, Building2,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Paperclip, Users, UserCheck, X } from "lucide-react";

interface Broadcast {
  id: number;
  title: string;
  body: string;
  sender_name: string;
  recipient_type: string;
  created_at: string;
  attachments?: Array<{ url: string; filename: string; content_type: string }>;
}

interface Ticket {
  id: number;
  title: string;
  body: string;
  status: string;
  sender_name: string;
  tenant_name: string;
  tenant_id: number;
  replies_count: number;
  created_at: string;
}

export default function CommunicationCenterPage() {
  const t = useTranslations("Communications");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'broadcast' | 'support'>('broadcast');
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Broadcast form
  const [bcTitle, setBcTitle] = useState("");
  const [bcBody, setBcBody] = useState("");
  const [recipientType, setRecipientType] = useState<string>("all");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [bcLoading, setBcLoading] = useState(false);

  // Ticket detail
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<any>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  
  // Selected BC for detail popup
  const [selectedBC, setSelectedBC] = useState<Broadcast | null>(null);

  const [lastSyncBC, setLastSyncBC] = useState<string | null>(null);

  // useSWR for incremental broadcasts
  const { data: bcData, mutate: mutateBC } = useSWR(
    activeTab === 'broadcast' ? ['/system/broadcasts', lastSyncBC] : null,
    () => apiService.messages.list(lastSyncBC ? { updated_after: lastSyncBC } : {}),
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      onSuccess: (newData) => {
        if (newData?.messages) {
          setBroadcasts(prev => {
            const newItems = newData.messages;
            if (newItems.length === 0) return prev;

            const merged = [...prev];
            newItems.forEach((item: Broadcast) => {
              const idx = merged.findIndex(m => m.id === item.id);
              if (idx > -1) merged[idx] = item;
              else merged.unshift(item);
            });
            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          setLastSyncBC(new Date().toISOString());
        }
        setLoading(false);
      }
    }
  );

  const fetchData = async () => {
    if (activeTab === 'broadcast') {
      mutateBC();
    } else {
      setLoading(true);
      try {
        const res = await apiService.supportTickets.list();
        setTickets(res.tickets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle || !bcBody) return;
    setBcLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", bcTitle);
      formData.append("body", bcBody);
      formData.append("recipient_type", recipientType);
      
      attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });

      await apiService.messages.create(formData);
      setBcTitle("");
      setBcBody("");
      setRecipientType("all");
      setAttachments([]);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setBcLoading(false);
    }
  };

  const handleViewTicket = async (id: number) => {
    setSelectedTicket(id);
    try {
      const res = await apiService.supportTickets.get(id);
      setTicketDetail(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody || !selectedTicket) return;
    setReplyLoading(true);
    try {
      await apiService.supportTickets.reply(selectedTicket, replyBody);
      setReplyBody("");
      handleViewTicket(selectedTicket);
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await apiService.supportTickets.update(selectedTicket, { status });
      handleViewTicket(selectedTicket);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[--color-muted] rounded-lg w-fit border border-[--color-border]">
        <button 
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-all text-sm ${
            activeTab === 'broadcast' ? 'bg-white text-[--color-text] shadow-sm' : 'text-[--color-muted-foreground] hover:text-[--color-text]'
          }`}
        >
          <Megaphone size={16} />
          {t("broadcast_tab")}
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-all text-sm ${
            activeTab === 'support' ? 'bg-white text-[--color-text] shadow-sm' : 'text-[--color-muted-foreground] hover:text-[--color-text]'
          }`}
        >
          <Inbox size={16} />
          {t("support_tab")}
        </button>
      </div>

      {activeTab === 'broadcast' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[--color-border] rounded-xl overflow-hidden shadow-sm sticky top-8">
              <div className="p-5 border-b border-[--color-border] bg-white">
                <h3 className="font-medium text-sm text-[--color-text] flex items-center gap-2">
                  <Send size={16} className="text-[--color-muted-foreground]" /> {t("send_broadcast")}
                </h3>
              </div>
              <form onSubmit={handleSendBroadcast} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium tracking-tight text-[--color-muted-foreground]">{t("recipient_label")}</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setRecipientType('all')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        recipientType === 'all' 
                          ? 'border-[--color-primary] bg-[--color-primary]/5 text-[--color-primary]' 
                          : 'border-[--color-border] bg-white text-[--color-muted-foreground] hover:border-[--color-primary]/30'
                      }`}
                    >
                      <Users size={14} /> {t("recipient_all")}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRecipientType('tenant_owner')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        recipientType === 'tenant_owner' 
                          ? 'border-[--color-primary] bg-[--color-primary]/5 text-[--color-primary]' 
                          : 'border-[--color-border] bg-white text-[--color-muted-foreground] hover:border-[--color-primary]/30'
                      }`}
                    >
                      <UserCheck size={14} /> {t("recipient_tenant_owner")}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium tracking-tight text-[--color-muted-foreground]">{t("bc_title_label")}</label>
                  <input 
                    type="text" 
                    value={bcTitle}
                    onChange={(e) => setBcTitle(e.target.value)}
                    placeholder={t("bc_title_placeholder")}
                    className="w-full px-3 py-2 bg-white border border-[--color-border] rounded-lg outline-none focus:ring-1 focus:ring-[--color-primary] text-sm transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium tracking-tight text-[--color-muted-foreground]">{t("bc_body_label")}</label>
                  <textarea 
                    value={bcBody}
                    onChange={(e) => setBcBody(e.target.value)}
                    placeholder={t("bc_body_placeholder")}
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-[--color-border] rounded-lg outline-none focus:ring-1 focus:ring-[--color-primary] resize-none text-sm transition-all"
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-tight text-[--color-muted-foreground] flex items-center gap-1.5">
                    <Paperclip size={14} /> {t("upload_file")}
                  </label>
                  <input 
                    type="file" 
                    id="bc-files"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setAttachments(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                  />
                  <label 
                    htmlFor="bc-files"
                    className="flex items-center justify-center border border-dashed border-[--color-border] p-4 rounded-lg cursor-pointer hover:bg-[--color-muted]/30 transition-all text-xs text-[--color-muted-foreground]"
                  >
                    {attachments.length > 0 ? `${attachments.length} file dipilih` : "Klik untuk memilih file..."}
                  </label>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-[--color-muted] rounded-md text-[10px] text-[--color-muted-foreground] border border-[--color-border]">
                          <span className="truncate max-w-[100px]">{file.name}</span>
                          <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}>
                            <X size={10} className="hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={bcLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {bcLoading ? t("sending") : <><Send size={16} /> {t("send_button")}</>}
                </Button>
              </form>
            </div>
          </div>
 
          {/* History */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-medium text-xs tracking-tight text-[--color-muted-foreground] flex items-center gap-1.5 mt-2">
              <Clock size={14} /> {t("bc_history")}
            </h3>
            {loading ? (
              <div className="bg-[--color-muted] animate-pulse h-64 rounded-xl" />
            ) : broadcasts.length === 0 ? (
              <div className="bg-[--color-muted]/30 border border-dashed border-[--color-border] p-12 rounded-xl text-center text-[--color-muted-foreground] text-sm">
                {t("no_bc")}
              </div>
            ) : (
              <div className="space-y-3">
                {broadcasts.map((bc, i) => (
                  <motion.div 
                    key={bc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedBC(bc)}
                    className="bg-white border border-[--color-border] p-3 rounded-xl shadow-sm hover:border-[--color-primary] transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-semibold text-sm text-[--color-text] group-hover:text-[--color-primary] transition-colors line-clamp-1">{bc.title}</h4>
                      <div className="text-[10px] font-medium text-[--color-muted-foreground] whitespace-nowrap ml-2">
                        {formatDate(bc.created_at)}
                      </div>
                    </div>
                    <p className="text-xs text-[--color-muted-foreground] line-clamp-2 mb-2 leading-relaxed">{bc.body}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className={`px-1.5 py-0.5 rounded text-[9px] font-medium tracking-tight ${
                        bc.recipient_type === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {bc.recipient_type === 'all' ? t("recipient_all") : t("recipient_tenant_owner")}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[--color-muted-foreground]">
                        <Paperclip size={10} /> {bc.attachments?.length || 0}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-medium text-xs tracking-tight text-[--color-muted-foreground] flex items-center gap-1.5 mt-2">
              <Inbox size={14} /> {t("ticket_queue")}
            </h3>
            <div className="space-y-2">
              {loading ? (
                <div className="bg-[--color-muted] animate-pulse h-64 rounded-xl" />
              ) : tickets.length === 0 ? (
                <div className="bg-[--color-muted]/30 border border-dashed border-[--color-border] p-12 rounded-xl text-center text-[--color-muted-foreground] text-sm">
                  {t("no_tickets")}
                </div>
              ) : tickets.map((tItem) => (
                <button 
                  key={tItem.id}
                  onClick={() => handleViewTicket(tItem.id)}
                  className={`w-full text-left bg-white border transition-all p-4 rounded-xl flex items-center gap-3 ${
                    selectedTicket === tItem.id ? 'border-[--color-primary] ring-1 ring-[--color-primary]/20 bg-[--color-primary]/[0.02]' : 'border-[--color-border] hover:border-[--color-text]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    tItem.status === 'new' ? 'bg-amber-50 text-amber-600' : 
                    tItem.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {tItem.status === 'new' ? <AlertCircle size={20} /> : 
                     tItem.status === 'in_progress' ? <Clock size={20} /> : <CheckCircle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-[--color-text]">{tItem.title}</div>
                    <div className="text-xs text-[--color-muted-foreground] flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="font-medium text-[--color-primary]">{tItem.tenant_name}</span>
                      <span>•</span>
                      <span className="truncate">{tItem.sender_name}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[--color-muted-foreground] flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-3 min-h-[400px]">
            <AnimatePresence mode="wait">
              {selectedTicket && ticketDetail ? (
                <motion.div 
                  key={selectedTicket}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white border border-[--color-border] rounded-xl h-full flex flex-col shadow-sm overflow-hidden"
                >
                  {/* Detail Header */}
                  <div className="p-5 border-b border-[--color-border] bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xs font-medium text-[--color-muted-foreground] tracking-tight mb-1">{t("ticket_id")} #{ticketDetail.ticket.id}</div>
                        <h3 className="text-lg font-semibold text-[--color-text]">{ticketDetail.ticket.title}</h3>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {['new', 'in_progress', 'resolved'].map(s => (
                          <button 
                            key={s}
                            onClick={() => handleUpdateStatus(s)}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-all border ${
                              ticketDetail.ticket.status === s 
                                ? 'bg-[--color-primary] text-white border-[--color-primary]' 
                                : 'bg-transparent text-[--color-muted-foreground] border-[--color-border] hover:bg-[--color-muted]'
                            }`}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[--color-muted]/30 p-4 rounded-lg border border-[--color-border] mb-4 text-sm text-[--color-text] leading-relaxed">
                      &quot;{ticketDetail.ticket.body}&quot;
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-[--color-muted-foreground]"><Building2 size={14} /> {ticketDetail.ticket.tenant_name}</div>
                      <div className="text-[--color-muted-foreground] font-medium">{formatDate(ticketDetail.ticket.created_at)}</div>
                    </div>
                  </div>

                  {/* Replies List */}
                  <div className="flex-1 p-5 space-y-5 overflow-y-auto min-h-[250px] max-h-[500px]">
                    {ticketDetail.replies.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-[--color-muted-foreground] text-sm">{t("no_replies")}</div>
                      </div>
                    ) : (
                      ticketDetail.replies.map((r: any) => (
                        <div key={r.id} className={`flex flex-col ${r.user_role === 'system_owner' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${
                            r.user_role === 'system_owner' 
                              ? 'bg-[--color-primary] text-white rounded-tr-sm' 
                              : 'bg-white border border-[--color-border] text-[--color-text] rounded-tl-sm'
                          }`}>
                            {r.body}
                          </div>
                          <div className="mt-1 text-xs font-medium text-[--color-muted-foreground] flex items-center gap-1.5">
                            {r.user_name} <span className="text-xs opacity-70">•</span> {formatDate(r.created_at)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Form */}
                  <div className="p-4 border-t border-[--color-border] bg-white">
                    <form onSubmit={handleSendReply} className="flex gap-2">
                      <input 
                        type="text"
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder={t("reply_placeholder")}
                        className="flex-1 px-3 py-2 bg-white border border-[--color-border] rounded-lg outline-none focus:ring-1 focus:ring-[--color-primary] text-sm transition-all"
                        required
                      />
                      <Button 
                        type="submit"
                        disabled={replyLoading}
                        className="flex-shrink-0"
                      >
                        <Send size={16} />
                      </Button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full border border-dashed border-[--color-border] rounded-xl flex flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="w-12 h-12 rounded-lg bg-[--color-muted] flex items-center justify-center mb-3">
                    <MessageSquare size={20} className="text-[--color-muted-foreground]" />
                  </div>
                  <p className="font-medium text-[--color-text] text-sm">{t("select_ticket")}</p>
                  <p className="text-xs text-[--color-muted-foreground] max-w-[200px] mt-1">{t("select_ticket_desc")}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      {/* Broadcast Detail Modal */}
      <AnimatePresence>
        {selectedBC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[--color-border] flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Megaphone size={18} className="text-[--color-primary]" />
                  <h3 className="font-semibold text-[--color-text]">Detail Pengumuman</h3>
                </div>
                <button 
                  onClick={() => setSelectedBC(null)}
                  className="p-1.5 rounded-full hover:bg-[--color-muted] transition-all"
                >
                  <X size={20} className="text-[--color-muted-foreground]" />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <h2 className="text-xl font-bold text-[--color-text] mb-1">{selectedBC.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-[--color-muted-foreground]">
                    <span>{formatDate(selectedBC.created_at)}</span>
                    <span>•</span>
                    <span className="font-semibold text-[--color-primary]">{selectedBC.sender_name}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-[--color-border] text-sm text-[--color-text] leading-relaxed whitespace-pre-wrap">
                  {selectedBC.body}
                </div>

                {selectedBC.attachments && selectedBC.attachments.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium tracking-tight text-[--color-muted-foreground]">Lampiran</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedBC.attachments.map((att, idx) => (
                        <a 
                          key={idx} 
                          href={att.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-white border border-[--color-border] rounded-xl text-xs hover:border-[--color-primary] hover:shadow-md transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-[--color-primary] group-hover:text-white transition-all">
                            <Paperclip size={14} />
                          </div>
                          <span className="truncate font-medium flex-1">{att.filename}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
