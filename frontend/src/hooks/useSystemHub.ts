"use client";

import { useState, useEffect, useMemo } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { useTranslations, useLocale } from "next-intl";
import { id as idLocale, enUS } from "date-fns/locale";

export interface SystemHubState {
  notifications: any[];
  sentMessages: any[];
  loading: boolean;
  sentLoading: boolean;
  submitting: boolean;
  sentSuccess: boolean;
  selectedNotif: any | null;
  selectedTicket: any | null;
  ticketReplies: any[];
  ticketLoading: boolean;
  deleteConfirmOpen: boolean;
  notifToDelete: number | null;
  clearConfirmOpen: boolean;
  sentMenuOpen: boolean;
  alertMenuOpen: boolean;
}

export function useSystemHub() {
  const { user } = useAuth();
  const t = useTranslations("SystemHub");
  const locale = useLocale();
  const { toast } = useToast();
  const { 
    notifications: allNotifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();

  // State
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notifToDelete, setNotifToDelete] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [alertMenuOpen, setAlertMenuOpen] = useState(false);
  const [sentMenuOpen, setSentMenuOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'list' | 'compose'>('list');

  // Constants
  const dateFnsLocale = locale === 'id' ? idLocale : enUS;

  // Derived Logic
  const systemNotifs = allNotifications.filter(n => 
    n.id > 0 && 
    n.sender_role === 'system_owner' && 
    !n.title.toLowerCase().includes('terkirim') && 
    !n.title.toLowerCase().includes('sent')
  );

  const unifiedList = useMemo(() => {
    return [
      ...systemNotifs.map(n => ({ ...n, itemType: 'notification' })),
      ...sentMessages.map(t => ({ ...t, itemType: 'ticket' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [systemNotifs, sentMessages]);

  const unreadCount = useMemo(() => 
    systemNotifs.filter(n => !n.read_at).length, 
  [systemNotifs]);

  // Actions
  const fetchSentMessages = async () => {
    setSentLoading(true);
    try {
      const res = await apiService.supportTickets.list();
      setSentMessages(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSentLoading(false);
    }
  };

  const handleSendMessage = async (data: FormData | any): Promise<boolean> => {
    setSubmitting(true);
    try {
      await apiService.supportTickets.create(data);
      setSentSuccess(true);
      fetchSentMessages();
      return true;
    } catch (err) {
      console.error(err);
      toast(t("send_error"), "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const clearSentMessages = () => setSentMessages([]);

  const handleOpenNotif = (notif: any) => {
    setSelectedNotif(notif);
    if (!notif.read_at) {
      markAsRead(notif.id);
    }
  };

  const handleDeleteNotif = (id: number) => {
    setNotifToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteNotif = () => {
    if (notifToDelete) {
      deleteNotification(notifToDelete);
      setDeleteConfirmOpen(false);
      setNotifToDelete(null);
      toast(t("delete_success"), "success");
    }
  };

  const handleClearAll = () => setClearConfirmOpen(true);
  
  const confirmClearAll = () => {
    clearAllNotifications();
    setClearConfirmOpen(false);
    toast(t("clear_success"), "success");
  };

  const handleOpenTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    setTicketLoading(true);
    try {
      const res = await apiService.supportTickets.get(ticket.id);
      setTicketReplies(res.replies || []);
    } catch (err) {
      console.error(err);
      setTicketReplies([]);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSelectItem = (item: any) => {
    if (item.itemType === 'notification') {
      setSelectedTicket(null);
      handleOpenNotif(item);
    } else {
      setSelectedNotif(null);
      handleOpenTicket(item);
    }
    setLayoutMode('list');
  };

  // Lifecycle
  useEffect(() => {
    fetchSentMessages();
  }, []);

  return {
    // Data
    systemNotifs,
    sentMessages,
    unifiedList,
    unreadCount,
    loading,
    sentLoading,
    submitting,
    sentSuccess,
    dateFnsLocale,
    locale,
    
    // UI State
    selectedNotif,
    setSelectedNotif,
    selectedTicket,
    setSelectedTicket,
    layoutMode,
    setLayoutMode,
    ticketReplies,
    ticketLoading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    clearConfirmOpen,
    setClearConfirmOpen,
    alertMenuOpen,
    setAlertMenuOpen,
    sentMenuOpen,
    setSentMenuOpen,

    // Handlers
    handleSendMessage,
    handleOpenNotif,
    handleDeleteNotif,
    confirmDeleteNotif,
    handleClearAll,
    confirmClearAll,
    handleOpenTicket,
    handleSelectItem,
    markAllAsRead,
    clearAllNotifications,
    fetchSentMessages,
    clearSentMessages
  };
}
