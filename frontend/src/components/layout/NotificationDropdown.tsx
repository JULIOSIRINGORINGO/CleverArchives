"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Mail, Shield, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

// UI Primitives
import { Box } from '@/components/ui/Box';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';
import { IconWrapper } from '@/components/ui/IconWrapper';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

/** 
 * LEVEL 3: ESTETIKA LOKAL (One-Off ONLY)
 * Isolated wrappers as per SOP v5.6.0 to keep Logic & Return clean.
 */

// 1. Notification Badge Wrapper
const BadgeContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    position="absolute"
    width="10"
    height="10"
    background="danger"
    rounded="full"
    display="flex"
    align="center"
    justify="center"
    border="subtle"
    className="top-[-2px] right-[-2px] text-white text-[9px] font-bold shadow-lg shadow-[--color-danger]/20 animate-in zoom-in duration-300"
  >
    {children}
  </Box>
);

// 2. Main Dropdown Panel Wrapper
const DropdownContainer = motion(React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
  <Box
    ref={ref}
    position="fixed"
    display="flex"
    direction="col"
    overflow="auto"
    background="surface"
    border="subtle"
    shadow="xl"
    className="top-[80px] right-0 sm:right-4 w-96 h-[calc(100vh-100px)] max-w-[100vw] z-[110] sm:rounded-bl-[2rem] sm:rounded-[2rem] scrollbar-none"
    {...props}
  >
    {children}
  </Box>
)));
DropdownContainer.displayName = "DropdownContainer";


import { SegmentButton } from '@/components/ui/_components/SegmentedControlAesthetics';

const NotificationDropdown = ({ isSegmented }: { isSegmented?: boolean }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Notifications');
  const { toast } = useToast();

  const handleNotificationClick = (notif: any) => {
    if (!notif.read_at) markAsRead(notif.id);
    
    if (notif.nav_url) {
      router.push(notif.nav_url);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && (dropdownRef.current as any).contains && !(dropdownRef.current as any).contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (role: string) => {
    switch (role) {
      case 'system_owner': return <Shield size={14} strokeWidth={2.5} className="text-[--color-danger]" />;
      case 'tenant_owner': return <Shield size={14} strokeWidth={2.5} className="text-[--color-primary]" />;
      case 'message': return <Mail size={14} strokeWidth={2.5} className="text-blue-500" />;
      default: return <Bell size={14} strokeWidth={2.5} className="text-[--color-muted-foreground]" />;
    }
  };

  const getLocaleObj = () => (locale === 'id' ? id : enUS);

  return (
    <Box position="relative" ref={dropdownRef}>
      {/* Navbar Trigger Button: Polymorphic based on isSegmented */}
      {isSegmented ? (
        <SegmentButton 
          isActive={isOpen} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <Box position="relative">
            <Bell size={15} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <Box 
                position="absolute" 
                className="top-[-8px] right-[-8px] bg-red-500 text-white text-[8px] px-1 rounded-full border border-white min-w-[14px] h-[14px] flex items-center justify-center font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Box>
            )}
          </Box>
        </SegmentButton>
      ) : (
        <Box
          as="button"
          onClick={() => setIsOpen(!isOpen)}
          display="flex"
          align="center"
          justify="center"
          padding="xs"
          variant="interactive"
          title={t('title')}
        >
          <motion.div animate={{ scale: isOpen ? 1.1 : 1 }}>
            <Box color={isOpen ? "primary" : "muted"}>
              <Bell size={20} strokeWidth={2} />
            </Box>
          </motion.div>

          {unreadCount > 0 && <BadgeContainer>{unreadCount > 9 ? '9+' : unreadCount}</BadgeContainer>}
        </Box>
      )}

      <AnimatePresence>
        {isOpen && (
          <DropdownContainer
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            {/* Header Area */}
            <Box
              padding="md"
              border="subtle"
              display="flex"
              align="center"
              justify="between"
              background="muted-soft"
            >
              <Text variant="subheading" weight="black" tracking="tight">
                {t('title')}
              </Text>

              <Box display="flex" align="center" gap="sm">
                <Box as="button" onClick={markAllAsRead} title={t('mark_all_read')}>
                  <IconWrapper 
                    isGhost 
                    size="xs" 
                    icon="check-all" 
                    color="primary"
                    className="hover:scale-110 active:scale-95 transition-all"
                  />
                </Box>

                <Box as="button" onClick={() => setShowConfirmClear(true)} title={t('clear_all')}>
                  <IconWrapper 
                    isGhost 
                    size="xs" 
                    icon="trash" 
                    color="destructive"
                    className="hover:scale-110 active:scale-95 transition-all"
                  />
                </Box>
              </Box>
            </Box>

            {/* List Area */}
            <Box flex="1" overflow="auto" scrollbar="none">
              {notifications.length > 0 ? (
                <Stack spacing="none">
                  {notifications.map((notif) => (
                    <Box
                      key={notif.id}
                      as="button"
                      onClick={() => handleNotificationClick(notif)}
                      display="flex"
                      align="start"
                      gap="md"
                      padding="md"
                      border="subtle"
                      background={!notif.read_at ? "primary-soft" : "transparent"}
                      variant="interactive"
                      width="full"
                      textAlign="left"
                    >
                      <Box
                        width="10"
                        height="10"
                        rounded="lg"
                        display="flex"
                        align="center"
                        justify="center"
                        shrink="0"
                        border="subtle"
                        background={!notif.read_at ? "surface" : "muted-soft"}
                      >
                        {getIcon(notif.sender_role)}
                      </Box>

                      <Stack spacing="xs" flex="1" minWidth="0">
                        <Box display="flex" align="center" justify="between" gap="sm">
                          <Text
                            variant="caption"
                            weight="black"
                            tracking="tighter"
                            color={!notif.read_at ? "default" : "muted"}
                          >
                            {notif.title}
                          </Text>
                          <Text variant="list-metadata">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: getLocaleObj() })}
                          </Text>
                        </Box>
                        <Text
                          variant="caption"
                          weight="medium"
                          opacity="80"
                          italic
                          className="truncate leading-tight"
                        >
                          {notif.body}
                        </Text>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box
                  paddingY="xl"
                  display="flex"
                  direction="col"
                  align="center"
                  justify="center"
                  gap="md"
                  opacity="40"
                >
                  <IconWrapper size="lg" isGhost color="primary" icon="notification" />
                  <Text variant="caption" weight="black" tracking="widest" uppercase>
                    {t('empty')}
                  </Text>
                </Box>
              )}
            </Box>
          </DropdownContainer>
        )}
      </AnimatePresence>

      {/* MODAL VALIDATION: Clear All Notifications Confirmation */}
      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={() => {
          clearAllNotifications();
          setShowConfirmClear(false);
          setIsOpen(false);
          toast(t('success_clear_msg'), 'success');
        }}
        variant="danger"
        title={t('confirm_clear_title')}
        description={t('confirm_clear_desc')}
        confirmLabel={t('confirm_clear_btn')}
        cancelLabel={t('cancel')}
      />
    </Box>
  );
};

export default NotificationDropdown;
