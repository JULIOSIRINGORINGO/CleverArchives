"use client";

import { useState, useEffect, useRef } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { apiService } from "@/services/api";
import { 
  Shield, Bell, CheckCircle2, CheckCheck, Mail, Megaphone,
  Send, MessageSquare, Calendar, ChevronRight, X, Clock, AlertTriangle,
  Trash2, MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { formatFriendlyDistance } from "@/lib/date-utils";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";


interface NotificationModalContent {
  id: number;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
  sender_role: string;
  metadata?: {
    recipient_type?: string;
    sender_name?: string;
    full_body?: string;
    title?: string;
  };
}

export default function SystemCommunicationPage() {
  const { user } = useAuth();
  const role = user?.role?.name || "member";

  const t = useTranslations("SystemHub");
  const locale = useLocale();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const { toast } = useToast();
  const [selectedNotif, setSelectedNotif] = useState<NotificationModalContent | null>(null);

  const dateFnsLocale = locale === 'id' ? idLocale : enUS;

  // Split notifications - Only show messages from System Owner in System Alerts
  // Filter out any "Message Sent" notifications that might be incorrectly categorized as system notifications
  const systemNotifs = notifications.filter(n => 
    n.id > 0 && 
    n.sender_role === 'system_owner' && 
    !n.title.toLowerCase().includes('terkirim') && 
    !n.title.toLowerCase().includes('sent')
  );
  
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [sentLoading, setSentLoading] = useState(false);

  // Compose State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [alertMenuOpen, setAlertMenuOpen] = useState(false);
  const [sentMenuOpen, setSentMenuOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  
  // Confirmation Dialog States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notifToDelete, setNotifToDelete] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const alertMenuRef = useRef<HTMLDivElement>(null);

  const sentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertMenuRef.current && !alertMenuRef.current.contains(e.target as Node)) setAlertMenuOpen(false);
      if (sentMenuRef.current && !sentMenuRef.current.contains(e.target as Node)) setSentMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSentMessages = async () => {
    setSentLoading(true);
    try {
      // Switched to supportTickets which is what System Owner sees in their Support Inbox
      const res = await apiService.supportTickets.list();
      setSentMessages(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSentLoading(false);
    }
  };

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setSubmitting(true);
    try {
      // Switched to supportTickets API
      await apiService.supportTickets.create({ title, body });
      setTitle("");
      setBody("");
      setSentSuccess(true);
      fetchSentMessages();
      setTimeout(() => setSentSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert(t("send_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenNotif = (notif: any) => {
    setSelectedNotif(notif);
    if (!notif.read_at) {
      markAsRead(notif.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (notifToDelete) {
      deleteNotification(notifToDelete);
      setDeleteConfirmOpen(false);
      setNotifToDelete(null);
      toast(t("delete_success"), "success");
    }
  };

  const handleClearAll = () => {
    setClearConfirmOpen(true);
  };

  const confirmClearAll = () => {
    clearAllNotifications();
    setClearConfirmOpen(false);
    toast(t("clear_success"), "success");
  };


  const handleOpenTicket = async (msg: any) => {
    setSelectedTicket(msg);
    setTicketLoading(true);
    try {
      const res = await apiService.supportTickets.get(msg.id);
      setTicketReplies(res.replies || []);
    } catch (err) {
      console.error(err);
      setTicketReplies([]);
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-6 pb-8">
      <PageHeader
        title={t("title")}
        badge={t("system_alerts")}
        icon={<Megaphone size={24} strokeWidth={2.5} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        
        {/* Left Column: System Alerts (3/5) */}
        <div className="lg:col-span-3 flex flex-col min-h-0 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl shadow-sm overflow-hidden group/col">
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
            <h3 className="font-bold text-[11px] flex items-center gap-2 text-muted-foreground">
              <Shield size={16} className="text-indigo-500" /> System Alerts
            </h3>
            <div className="flex items-center gap-1" ref={alertMenuRef}>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-bold">
                {systemNotifs.length}
              </span>
              <div className="relative">
                <button 
                  onClick={() => setAlertMenuOpen(!alertMenuOpen)}
                  className="p-1.5 hover:bg-muted text-muted-foreground rounded-full transition-colors flex items-center justify-center"
                >
                  <MoreVertical size={16} />
                </button>
                {alertMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-[9999] py-1 overflow-hidden">
                    <button 
                      onClick={() => { markAllAsRead(); setAlertMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <CheckCheck size={16} className="text-blue-500" /> Tandai telah dibaca
                    </button>
                    <button 
                      onClick={() => { clearAllNotifications(); setAlertMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors text-left"
                    >
                      <Trash2 size={16} /> Hapus semua
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : systemNotifs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-20 opacity-50">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Bell size={24} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-muted-foreground text-xs">{t("no_messages")}</p>
                </div>
              </div>
            ) : (
              systemNotifs.map((notif) => (
                <div 
                  key={notif.id}
                  className={cn(
                    "group relative border rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5",
                    !notif.read_at ? "bg-indigo-50/40 border-indigo-200 hover:border-indigo-300" : "bg-card border-border/50 hover:border-primary/40"
                  )}
                  onClick={() => handleOpenNotif(notif)}
                >
                  {!notif.read_at && (
                    <div className="absolute top-4 left-0 w-1.5 h-8 bg-indigo-500 rounded-r-full" />
                  )}
                  <div className="p-4 flex gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm border",
                      !notif.read_at ? "bg-indigo-100 border-indigo-200 text-indigo-600" : "bg-muted border-border/50 text-muted-foreground"
                    )}>
                      <AlertTriangle size={18} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                      <div className="flex justify-between items-start pt-0.5">
                        <h4 className={cn(
                          "truncate text-sm pr-6",
                          !notif.read_at ? "font-bold text-indigo-950" : "font-medium text-foreground"
                        )}>
                          {notif.title}
                        </h4>
                        <span className="shrink-0 text-xs font-bold text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded-lg border border-border/50 backdrop-blur-sm">
                          {formatFriendlyDistance(new Date(notif.created_at), { addSuffix: true, locale: dateFnsLocale })}
                        </span>
                      </div>
                      <p className="text-xs line-clamp-2 font-normal text-muted-foreground leading-relaxed">
                        {notif.body}
                      </p>
                    </div>
                  </div>
                  {/* Delete Button - clean inline */}
                  <button 
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title={t("delete_confirm") || "Hapus"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Send Message & History (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Send Message Card */}
          <div className="bg-card border border-border/50 rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-xs flex items-center gap-2 text-muted-foreground mb-4">
              <MessageSquare size={16} className="text-primary" /> {t("compose_title")}
            </h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground ml-1">{t("compose_subject")}</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("subject_placeholder")}
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-normal"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground ml-1">{t("compose_body")}</label>
                <textarea 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t("body_placeholder")}
                  rows={4}
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-normal resize-none"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="w-full h-11 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
              >
                {submitting ? t("sending") : <><Send size={16} /> {t("send_button")}</>}
              </Button>

              {sentSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 size={16} />
                  {t("success_msg")}
                </div>
              )}
            </form>
          </div>

          {/* Sent History Card */}
          <div className="flex-1 bg-card/50 border border-border/50 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-5 border-b border-border/50 bg-muted/10 flex items-center justify-between">
              <h3 className="font-bold text-xs flex items-center gap-2 text-muted-foreground">
                <Clock size={16} className="text-amber-500" /> {t("sent_messages")}
              </h3>
              <div className="flex items-center gap-1">
                {sentMessages.length > 0 && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] font-bold">
                    {sentMessages.length}
                  </span>
                )}
                <div className="relative" ref={sentMenuRef}>
                  <button 
                    onClick={() => setSentMenuOpen(!sentMenuOpen)}
                    className="p-1.5 hover:bg-muted text-muted-foreground rounded-full transition-colors flex items-center justify-center"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {sentMenuOpen && (
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-[9999] py-1 overflow-hidden">
                      <button 
                        onClick={() => { setSentMessages([]); setSentMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors text-left"
                      >
                        <Trash2 size={16} /> Hapus semua
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {sentLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />)}
                </div>
              ) : sentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 opacity-30">
                  <Mail size={32} className="text-muted-foreground mb-2" />
                  <p className="text-[10px] font-bold text-muted-foreground">{t("no_sent_history")}</p>
                </div>
              ) : (
                sentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className="p-3.5 bg-card border border-border/40 rounded-2xl shadow-sm group hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => handleOpenTicket(msg)}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-bold text-xs truncate pr-4 text-foreground">{msg.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className={cn(
                            "text-[8px] font-bold tracking-tighter px-1 rounded",
                            msg.status === 'new' ? "bg-amber-100 text-amber-600" :
                            msg.status === 'in_progress' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                           )}>
                            {msg.status?.replace('_', ' ')}
                           </span>
                           <span className="text-[10px] font-bold text-muted-foreground opacity-40">
                            {msg.replies_count > 0 && `• ${msg.replies_count} Balasan`}
                           </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-muted-foreground opacity-60">
                        {formatFriendlyDistance(new Date(msg.created_at), { addSuffix: true, locale: dateFnsLocale })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedNotif} 
        onClose={() => setSelectedNotif(null)}
        className="max-w-xl w-full p-0 overflow-hidden"
      >
        {selectedNotif && (
          <div className="flex flex-col bg-card">
            <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                  <Megaphone size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{t("detail_announcement")}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5">Informasi Sistem</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotif(null)}
                className="p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
                  {selectedNotif.metadata?.title || selectedNotif.title}
                </h2>
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg border border-border/50 shadow-sm">
                    <Calendar size={12} className="text-indigo-500" />
                    <span>{new Date(selectedNotif.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}</span>
                  </div>
                  <span className="opacity-30">•</span>
                  <div className="flex items-center gap-1 bg-primary/5 text-primary px-2 py-1 rounded-lg border border-primary/10 shadow-sm">
                    <Shield size={12} />
                    <span>{selectedNotif.metadata?.sender_name || "System Owner"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/40 text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap shadow-inner">
                {selectedNotif.metadata?.full_body || selectedNotif.body}
              </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
              <Button onClick={() => setSelectedNotif(null)} variant="outline" className="px-6 h-10 rounded-2xl font-bold shadow-sm">
                Tutup Notifikasi
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* Ticket Detail Modal */}
      <Modal 
        isOpen={!!selectedTicket} 
        onClose={() => { setSelectedTicket(null); setTicketReplies([]); }}
        className="max-w-xl w-full p-0 overflow-hidden"
      >
        {selectedTicket && (
          <div className="flex flex-col bg-card">
            <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Detail Feedback</h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5">Support Ticket</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedTicket(null); setTicketReplies([]); }}
                className="p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
              {/* Ticket info */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2 leading-tight">{selectedTicket.title}</h2>
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg border border-border/50 shadow-sm">
                    <Calendar size={12} className="text-gray-500" />
                    <span>{new Date(selectedTicket.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}</span>
                  </div>
                  <span className="opacity-30">•</span>
                  <div className={cn(
                    "font-bold px-2 py-1 rounded-lg text-[10px] border shadow-sm",
                    selectedTicket.status === 'new' ? "bg-amber-100 border-amber-200 text-amber-600" :
                    selectedTicket.status === 'in_progress' ? "bg-blue-100 border-blue-200 text-blue-600" : "bg-emerald-100 border-emerald-200 text-emerald-600"
                  )}>
                    {selectedTicket.status?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Original message */}
              <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/40 text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap shadow-inner">
                {selectedTicket.body}
              </div>

              {/* Replies section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground flex items-center gap-2 ml-1">
                  <MessageSquare size={14} className="text-primary" /> Balasan ({ticketReplies.length})
                </h4>
                {ticketLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />)}
                  </div>
                ) : ticketReplies.length === 0 ? (
                  <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-2xl opacity-50">
                    <p className="text-[10px] font-bold text-muted-foreground">Belum ada balasan dari sistem</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ticketReplies.map((reply) => (
                      <div key={reply.id} className="p-5 bg-primary/5 border border-primary/10 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <span className="text-xs font-bold text-primary flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                             {reply.user_name || "System"}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full border border-border/50 shadow-sm">
                            {new Date(reply.created_at).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                          </span>
                        </div>
                        <p className="text-xs font-normal text-muted-foreground leading-relaxed whitespace-pre-wrap relative z-10">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
              <Button onClick={() => { setSelectedTicket(null); setTicketReplies([]); }} variant="outline" className="px-6 h-10 rounded-2xl font-bold shadow-sm">
                Selesai
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setNotifToDelete(null); }}
        onConfirm={confirmDelete}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete_confirm_btn")}
        cancelLabel={t("cancel") || "Batal"}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={confirmClearAll}
        title={t("clear_confirm_title")}
        description={t("clear_confirm_desc")}
        confirmLabel={t("clear_confirm_btn")}
        cancelLabel={t("cancel") || "Batal"}
        variant="danger"
      />

      <style jsx global>{`

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--border), 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--border), 1);
        }
      `}</style>
    </div>
  );
}
