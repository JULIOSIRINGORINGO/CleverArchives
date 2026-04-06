"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [systemUnreadCount, setSystemUnreadCount] = useState(0);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastClearedAt, setLastClearedAt] = useState<string | null>(null);

  // Initialize lastClearedAt from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications_cleared_at');
    if (saved) setLastClearedAt(saved);
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [notifRes, msgRes] = await Promise.all([
        apiService.notifications.list().catch(() => ({ notifications: [], unread_count: 0 })),
        apiService.messages.list().catch(() => ({ messages: [] }))
      ]);

      const fetchedNotifs: Notification[] = notifRes.notifications || [];
      const notifUnread = notifRes.unread_count || 0;
      
      // Calculate message unread count using server persistence AND lastClearedAt
      const lastCheckTime = user.last_message_read_at ? new Date(user.last_message_read_at).getTime() : 0;
      const clearTimeBaseline = lastClearedAt ? new Date(lastClearedAt).getTime() : 0;
      
      const allMessages = msgRes.messages || [];
      // Only count messages directed at this user as unread AND created after clearTimeBaseline
      const unreadMsgCount = allMessages.filter((m: any) => 
        m.recipient_id === user.id && 
        new Date(m.created_at).getTime() > lastCheckTime &&
        new Date(m.created_at).getTime() > clearTimeBaseline
      ).length;

      // ... (messageNotifs and filteredSystemNotifs logic ...)

      // Filter and Map message notifications
      const messageNotifs: Notification[] = allMessages
        .filter((m: any) => {
          // Rule 1: Not own message
          const isOwn = String(m.sender_id) === String(user.id);
          if (isOwn) return false;
          
          // Rule 2: Created AFTER last cleared timestamp (if exists)
          if (lastClearedAt) {
            const clearTime = new Date(lastClearedAt).getTime();
            const messageTime = new Date(m.created_at).getTime();
            if (messageTime <= clearTime) return false;
          }
          return true;
        })
        .slice(0, 20)
        .map((m: any) => {
          const partnerId = m.sender_id;
          return {
            id: -(m.id),
            title: m.sender_name || 'Pengguna',
            body: m.body || m.title || '',
            read_at: new Date(m.created_at).getTime() <= lastCheckTime ? m.created_at : null,
            sender_role: 'message',
            created_at: m.created_at,
            metadata: { partnerId },
            nav_url: `/messaging/internal?partnerId=${partnerId}`
          };
        });

      // Refine system notifications titles AND filter by lastClearedAt
      const filteredSystemNotifs = fetchedNotifs.filter(n => {
        // Rule 1: Exclude self-trigger and technical confirmations
        if (n.metadata && (n.metadata as any).sender_id === user.id) return false;
        const lowTitle = n.title.toLowerCase();
        if (lowTitle.includes('terkirim') || lowTitle.includes('sent')) return false;
        if (n.body.toLowerCase().includes('pesan untuk semua')) return false;
        
        // Rule 2: Created AFTER last cleared timestamp (if exists)
        if (lastClearedAt) {
          const clearTime = new Date(lastClearedAt).getTime();
          const notifTime = new Date(n.created_at).getTime();
          if (notifTime <= clearTime) return false;
        }

        return true; 
      }).map(n => {
        let title = n.title;
        if (n.title.toLowerCase().includes('pesan baru') || n.title.toLowerCase().includes('new message')) {
          const senderName = (n.metadata as any)?.sender_name;
          title = senderName || n.title.replace(/Pesan Baru:?\s*/i, '');
        }

        const nav_url = n.metadata?.partnerId 
          ? `/messaging/internal?partnerId=${n.metadata.partnerId}`
          : n.metadata?.url || `/dashboard`;

        return { ...n, title, nav_url };
      });

      setNotifications([...filteredSystemNotifs, ...messageNotifs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      
      const refinedSystemUnreadCount = fetchedNotifs.filter(n => {
        // If it was already read on server, don't count
        if (n.read_at) return false;
        
        // If it was cleared locally, don't count
        if (lastClearedAt) {
          const clearTime = new Date(lastClearedAt).getTime();
          const notifTime = new Date(n.created_at).getTime();
          if (notifTime <= clearTime) return false;
        }

        // Functional filters for system notifications
        return n.sender_role === 'system_owner' && 
               !n.title.toLowerCase().includes('terkirim') && 
               !n.title.toLowerCase().includes('sent') &&
               !n.title.toLowerCase().includes('pesan baru') &&
               !n.title.toLowerCase().includes('new message') &&
               !n.body.toLowerCase().includes('pesan untuk semua');
      }).length;

      setSystemUnreadCount(refinedSystemUnreadCount);
      setMessagesUnreadCount(unreadMsgCount);
      setUnreadCount(refinedSystemUnreadCount + unreadMsgCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user, lastClearedAt]); // CRITICAL: Refresh when lastClearedAt changes

  const markAsRead = async (id: number) => {
    try {
      if (id > 0) {
        await apiService.notifications.read(id);
      }
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      // Recalculate total unread purely from new state
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markMessagesAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiService.messages.readAll();
      if (res.success && res.last_message_read_at) {
        updateUser({ last_message_read_at: res.last_message_read_at });
      } else {
        updateUser({ last_message_read_at: new Date().toISOString() });
      }
      refreshNotifications();
    } catch (e) {
      console.error(e);
      updateUser({ last_message_read_at: new Date().toISOString() });
      refreshNotifications();
    }
  }, [user, updateUser, refreshNotifications]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await Promise.all([
        apiService.notifications.readAll().catch(() => null),
        apiService.messages.readAll().catch(() => null)
      ]);
      
      updateUser({ last_message_read_at: new Date().toISOString() });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      if (id > 0) {
        await apiService.notifications.delete(id);
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
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
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

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
