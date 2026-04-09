"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext';

interface Notification {
  id: number;
  title: string;
  body: string;
  read_at: string | null;
  sender_role: string;
  created_at: string;
  metadata?: any;
  nav_url?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  systemUnreadCount: number;
  messagesUnreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markMessagesAsRead: () => void;
  deleteNotification: (id: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [lastClearedAt, setLastClearedAt] = useState<string | null>(null);
  const userRef = useRef(user);

  // 1. Unified Fetching with SWR
  const { data: notificationsData, mutate: mutateNotifications, isLoading: notifLoading } = useSWR(
    user ? '/notifications' : null,
    () => apiService.notifications.list(),
    { refreshInterval: 60000, dedupingInterval: 30000 }
  );

  const { data: messagesData, mutate: mutateMessages, isLoading: msgLoading } = useSWR(
    user ? '/internal_messages' : null,
    () => apiService.messages.list(),
    { refreshInterval: 60000, dedupingInterval: 30000 }
  );

  const loading = notifLoading || msgLoading;

  // Initialize lastClearedAt from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications_cleared_at');
    if (saved) setLastClearedAt(saved);
  }, []);

  // 2. Pure Orchestration Tier (Memoized calculation based on SWR data)
  const { 
    notifications, 
    unreadCount, 
    systemUnreadCount, 
    messagesUnreadCount 
  } = useMemo(() => {
    if (!user || !notificationsData || !messagesData) {
      return { notifications: [], unreadCount: 0, systemUnreadCount: 0, messagesUnreadCount: 0 };
    }

    const fetchedNotifs: Notification[] = notificationsData.notifications || [];
    const lastCheckTime = user.last_message_read_at ? new Date(user.last_message_read_at).getTime() : 0;
    const clearTimeBaseline = lastClearedAt ? new Date(lastClearedAt).getTime() : 0;
    
    const allMessages = messagesData.messages || [];
    const unreadMsgCount = allMessages.filter((m: any) => 
      m.recipient_id === user.id && 
      new Date(m.created_at).getTime() > lastCheckTime &&
      new Date(m.created_at).getTime() > clearTimeBaseline
    ).length;

    // Filter and Map message notifications
    const messageNotifs: Notification[] = allMessages
      .filter((m: any) => {
        if (String(m.sender_id) === String(user.id)) return false;
        if (lastClearedAt) {
          const clearTime = new Date(lastClearedAt).getTime();
          if (new Date(m.created_at).getTime() <= clearTime) return false;
        }
        return true;
      })
      .slice(0, 20)
      .map((m: any) => ({
        id: -(m.id),
        title: m.sender_name || 'Pengguna',
        body: m.body || m.title || '',
        read_at: new Date(m.created_at).getTime() <= lastCheckTime ? m.created_at : null,
        sender_role: 'message',
        created_at: m.created_at,
        metadata: { partnerId: m.sender_id },
        nav_url: `/messaging/internal?partnerId=${m.sender_id}`
      }));

    const filteredSystemNotifs = fetchedNotifs.filter(n => {
      if (n.metadata && (n.metadata as any).sender_id === user.id) return false;
      const lowTitle = n.title.toLowerCase();
      if (lowTitle.includes('terkirim') || lowTitle.includes('sent')) return false;
      if (lastClearedAt && new Date(n.created_at).getTime() <= new Date(lastClearedAt).getTime()) return false;
      return true; 
    }).map(n => {
      let title = n.title;
      if (n.title.toLowerCase().includes('pesan baru') || n.title.toLowerCase().includes('new message')) {
        title = (n.metadata as any)?.sender_name || n.title.replace(/Pesan Baru:?\s*/i, '');
      }
      return { ...n, title, nav_url: n.metadata?.partnerId ? `/messaging/internal?partnerId=${n.metadata.partnerId}` : n.metadata?.url || `/dashboard` };
    });

    const finalNotifs = [...filteredSystemNotifs, ...messageNotifs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const refinedSystemUnreadCount = fetchedNotifs.filter(n => {
      if (n.read_at || (lastClearedAt && new Date(n.created_at).getTime() <= new Date(lastClearedAt).getTime())) return false;
      return n.sender_role === 'system_owner' && !n.title.toLowerCase().includes('terkirim') && !n.title.toLowerCase().includes('pesan baru');
    }).length;

    return {
      notifications: finalNotifs,
      unreadCount: refinedSystemUnreadCount + unreadMsgCount,
      systemUnreadCount: refinedSystemUnreadCount,
      messagesUnreadCount: unreadMsgCount
    };
  }, [user, notificationsData, messagesData, lastClearedAt]);

  const refreshNotifications = useCallback(async () => {
    mutateNotifications();
    mutateMessages();
  }, [mutateNotifications, mutateMessages]); // CRITICAL: Refresh when lastClearedAt changes

  const markAsRead = async (id: number) => {
    try {
      if (id > 0) {
        await apiService.notifications.read(id);
      }
      mutateNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Keep userRef in sync
  useEffect(() => { userRef.current = user; }, [user]);

  const markMessagesAsRead = useCallback(async () => {
    if (!userRef.current) return;
    try {
      const res = await apiService.messages.readAll();
      if (res.success && res.last_message_read_at) {
        updateUser({ last_message_read_at: res.last_message_read_at });
      } else {
        updateUser({ last_message_read_at: new Date().toISOString() });
      }
      // Don't call refreshNotifications here — SWR intervals handle it
    } catch (e) {
      console.error(e);
      updateUser({ last_message_read_at: new Date().toISOString() });
    }
  }, [updateUser]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await Promise.all([
        apiService.notifications.readAll().catch(() => null),
        apiService.messages.readAll().catch(() => null)
      ]);
      
      updateUser({ last_message_read_at: new Date().toISOString() });
      mutateNotifications();
      mutateMessages();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      if (id > 0) {
        await apiService.notifications.delete(id);
      }
      mutateNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiService.notifications.clearAll();
      
      // PERSISTENT CLEAR: Record the current timestamp as the baseline for messaging
      const now = new Date().toISOString();
      setLastClearedAt(now);
      localStorage.setItem('notifications_cleared_at', now);
      
      // The useMemo will automatically filter out everything before 'now'
      mutateNotifications();
      mutateMessages();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // Auto-refresh managed by SWR intervals (removed manual refresh on user change to prevent cycles)

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      systemUnreadCount,
      messagesUnreadCount,
      loading,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      markMessagesAsRead,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
