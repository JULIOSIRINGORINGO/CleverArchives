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

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [notifRes, msgRes] = await Promise.all([
        apiService.notifications.list().catch(() => ({ notifications: [], unread_count: 0 })),
        apiService.messages.list().catch(() => ({ messages: [] }))
      ]);

      const fetchedNotifs: Notification[] = notifRes.notifications || [];
      const notifUnread = notifRes.unread_count || 0;
      
      // Calculate message unread count using server persistence
      const lastCheckTime = user.last_message_read_at ? new Date(user.last_message_read_at).getTime() : 0;
      
      const allMessages = msgRes.messages || [];
      // Only count messages directed at this user as unread
      const unreadMsgCount = allMessages.filter((m: any) => 
        m.recipient_id === user.id && 
        new Date(m.created_at).getTime() > lastCheckTime
      ).length;

      // Convert received messages to notification-like items for display in dropdown
      const messageNotifs: Notification[] = allMessages
        .filter((m: any) => String(m.sender_id) !== String(user.id)) // Filter out own messages strictly
        .slice(0, 20)
        .map((m: any) => {
          const isSender = m.sender_id === user.id;
          const partnerId = isSender ? m.recipient_id : m.sender_id;
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

      // Refine system notifications titles to be more professional and FILTER SELF
      const filteredSystemNotifs = fetchedNotifs.filter(n => {
        // Filter out if sender_id in metadata matches current user
        if (n.metadata && (n.metadata as any).sender_id === user.id) return false;
        
        // Hide technical "sent" confirmations
        const lowTitle = n.title.toLowerCase();
        if (lowTitle.includes('terkirim') || lowTitle.includes('sent')) return false;
        if (n.body.toLowerCase().includes('pesan untuk semua')) return false;
        
      }).map(n => {
        // Fix Title: Show sender name if it's a message
        let title = n.title;
        if (n.title.toLowerCase().includes('pesan baru') || n.title.toLowerCase().includes('new message')) {
          const senderName = (n.metadata as any)?.sender_name;
          title = senderName || n.title.replace(/Pesan Baru:?\s*/i, '');
        }

        // Fix Navigation: Determine the correct local URL
        const nav_url = n.metadata?.partnerId 
          ? `/messaging/internal?partnerId=${n.metadata.partnerId}`
          : n.metadata?.url || `/dashboard`;

        return { ...n, title, nav_url };
      });

      setNotifications([...filteredSystemNotifs, ...messageNotifs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      
      const refinedSystemUnreadCount = fetchedNotifs.filter(n => 
        !n.read_at && 
        n.sender_role === 'system_owner' && 
        !n.title.toLowerCase().includes('terkirim') && 
        !n.title.toLowerCase().includes('sent') &&
        !n.title.toLowerCase().includes('pesan baru') &&
        !n.title.toLowerCase().includes('new message') &&
        !n.body.toLowerCase().includes('pesan untuk semua') // Hide broadcast sent confirmation
      ).length;

      setSystemUnreadCount(refinedSystemUnreadCount);
      setMessagesUnreadCount(unreadMsgCount);
      setUnreadCount(refinedSystemUnreadCount + unreadMsgCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      // Message-type items have negative IDs — mark locally only, don't call notification API
      if (id > 0) {
        await apiService.notifications.read(id);
      }
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
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
      // Fallback
      updateUser({ last_message_read_at: new Date().toISOString() });
      refreshNotifications();
    }
  }, [user, updateUser, refreshNotifications]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const [notifRes, msgRes] = await Promise.all([
        apiService.notifications.readAll().catch(() => null),
        apiService.messages.readAll().catch(() => null)
      ]);
      
      const newReadTime = msgRes?.last_message_read_at || new Date().toISOString();
      updateUser({ last_message_read_at: newReadTime });
      
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
      // For message-type items (negative IDs), we only delete locally from state
      // NEVER call apiService.messages.delete() here as it deletes the actual data
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Local check if it was unread
      const removed = notifications.find(n => n.id === id);
      if (removed && !removed.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiService.notifications.clearAll();
      // REMOVED: apiService.messages.clearAll() as it incorrectly hides message history
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
