"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, MoreVertical, ExternalLink, Mail, Shield, Megaphone } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleNotificationClick = (notif: any) => {
    if (!notif.read_at) markAsRead(notif.id);
    
    // Logic for direct navigation
    const partnerId = (notif.metadata as any)?.partnerId;
    if (partnerId) {
       router.push(`/messaging/internal?partnerId=${partnerId}`);
    } else {
       // Generic fallback if needed
       router.push('/messaging/internal');
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (role: string) => {
    switch (role) {
      case 'system_owner': return <Shield size={14} strokeWidth={2.5} className="text-rose-500" />;
      case 'tenant_owner': return <Shield size={14} strokeWidth={2.5} className="text-[--color-primary]" />;
      case 'member': return <Mail size={14} strokeWidth={2.5} className="text-emerald-500" />;
      case 'message': return <Mail size={14} strokeWidth={2.5} className="text-blue-500" />;
      default: return <Bell size={14} strokeWidth={2.5} className="text-[--color-muted-foreground]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 text-muted-foreground hover:bg-muted rounded-full transition-all relative group",
          isOpen && "bg-muted text-primary"
        )}
      >
        <Bell size={20} strokeWidth={2} className={cn("transition-transform", isOpen && "scale-110")} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[--color-danger] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[--color-surface] shadow-lg shadow-[--color-danger]/20 animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed right-0 top-14 w-96 h-[calc(100vh-100px)] max-w-[100vw] bg-[--color-surface] border-l border-b border-[--color-border] shadow-2xl overflow-hidden z-[100] flex flex-col sm:rounded-bl-[2rem] sm:right-4 sm:top-[60px] sm:border sm:rounded-[2rem]"
          >
            <div className="p-4 border-b border-[--color-border]/50 flex items-center justify-between bg-[--color-muted]/20">
              <h3 className="font-black text-sm tracking-tight text-[--color-text]">Notifikasi</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  title="Tandai semua dibaca"
                  className="w-7 h-7 flex items-center justify-center text-[--color-primary] hover:bg-[--color-primary]/10 rounded-full transition-all border border-[--color-primary]/20 bg-white shadow-sm"
                >
                  <CheckCheck size={14} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto scrollbar-none">
              {notifications.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "p-4 hover:bg-[--color-muted]/50 transition-colors cursor-pointer group flex gap-3.5 items-center",
                          !notif.read_at && "bg-[--color-primary]/5 border-l-4 border-l-[--color-primary]"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-[--color-border]/50",
                          !notif.read_at ? "bg-[--color-surface] shadow-sm" : "bg-[--color-muted]/30"
                        )}>
                          {getIcon(notif.sender_role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={cn(
                              "text-[10px] tracking-tight truncate font-black",
                              !notif.read_at ? "text-[--color-text]" : "text-[--color-muted-foreground]"
                            )}>
                              {notif.title}
                            </p>
                            <span className="text-[8px] text-[--color-muted-foreground] shrink-0 font-bold uppercase tracking-tighter ml-2">
                              {new Date(notif.created_at).toLocaleTimeString(id.code === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                          <p className="text-[10px] text-[--color-muted-foreground] truncate italic leading-tight font-medium opacity-80">
                            {notif.body}
                          </p>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                  <Bell size={48} strokeWidth={1} className="text-[--color-muted-foreground]" />
                  <p className="text-sm font-bold tracking-widest text-[--color-muted-foreground]">Tidak ada notifikasi</p>
                </div>
              )}
            </div>

            {/* Footer removed per user request */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
