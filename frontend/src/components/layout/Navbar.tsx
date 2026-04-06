"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getNavigationGroups } from "@/lib/navigation-config";
import { useNotifications } from "@/contexts/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { IconWrapper } from "@/components/ui/IconWrapper";

/** 
 * LEVEL 3: ESTETIKA LOKAL (Navbar Specific)
 * Standardized wrappers to ensure "Zero ClassName" in the main return block.
 */

// 1. Root Header Wrapper
const NavHeader = ({ children, ...props }: any) => (
  <Box
    as="header"
    height="20"
    background="surface"
    display="flex"
    align="center"
    justify="between"
    paddingX="lg"
    position="sticky"
    className="top-0 z-[101] border-b border-border shadow-sm shrink-0"
    {...props}
  >
    {children}
  </Box>
);

// 2. Local Typography for Dashboard Context
const TitleText = ({ children }: { children: React.ReactNode }) => (
  <Text
    variant="heading"
    weight="black"
    color="default"
    className="truncate text-[24px] leading-none"
  >
    {children}
  </Text>
);

const SubtitleText = ({ children }: { children: React.ReactNode }) => (
  <Text
    variant="caption"
    weight="medium"
    color="muted"
    opacity="80"
    className="truncate text-[13px] mt-[-10px]"
  >
    {children}
  </Text>
);

// 3. Impersonation Action Wrapper
const ImpersonateBtn = ({ onClick, title }: { onClick: () => void; title: string }) => (
  <Box
    as="button"
    onClick={onClick}
    width="10"
    height="10"
    rounded="xl"
    background="danger"
    display="flex"
    align="center"
    justify="center"
    title={title}
    className="text-white hover:brightness-110 transition-all shadow-md active:scale-95"
  >
    <LogOut size={20} strokeWidth={2.5} />
  </Box>
);

// 4. User Profile Interaction Wrapper
const ProfileChip = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <Box
    as="button"
    onClick={onClick}
    display="flex"
    align="center"
    gap="md"
    padding="xs"
    rounded="lg"
    className="hover:bg-[--color-muted] transition-colors pr-4"
  >
    {children}
  </Box>
);


const Navbar = () => {
  const t = useTranslations("Navbar");
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const navT = useTranslations("Navigation");
  const { unreadCount, systemUnreadCount, messagesUnreadCount } = useNotifications();

  const role = user?.role?.name || "member";
  const isImpersonating = !!user?.impersonating;

  // Find active nav item for title display
  const counts = { unreadCount, systemUnreadCount, messagesUnreadCount };
  const menuGroups = getNavigationGroups(navT, role, counts);

  const activeItem = menuGroups.flatMap(g => g.items).find(item => {
    const fullHref = `/${locale}${item.href}`;
    return pathname === fullHref || (item.subItems && (pathname === fullHref || pathname.startsWith(`${fullHref}/`)));
  });

  const activeSubItem = activeItem?.subItems?.find(sub => pathname === `/${locale}${sub.href}`);

  const displayTitle = activeSubItem?.name || activeItem?.name || t("home");
  const displaySubtitle = activeItem?.description || "Clever Archives Platform";

  const handleExitImpersonation = () => {
    const host = window.location.host;
    const parts = host.split('.');
    let rootUrl = parts.length > 2
      ? `${window.location.protocol}//${parts.slice(-2).join('.')}/${locale}/dashboard`
      : `/${locale}/dashboard`;

    window.location.href = rootUrl;
  };

  const getInitials = () => user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";
  const getAvatarUrl = () => {
    const avatar = user?.avatar_url || (user as any)?.member?.avatar_url;
    if (!avatar) return null;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://localhost:3001";
    return avatar.startsWith('http') ? avatar : `${apiBaseUrl}${avatar}`;
  };

  return (
    <NavHeader>
      {/* Left Area: Dynamic Title & Subtitle with Motion */}
      <Box display="flex" direction="col" minWidth="0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Stack gap="none">
              <TitleText>{displayTitle}</TitleText>
              <SubtitleText>{displaySubtitle}</SubtitleText>
            </Stack>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Right Area: Action Buttons & User Profile */}
      <Box display="flex" align="center" gap="md">
        <Box
          display="flex"
          align="center"
          gap="xs"
          background="muted-soft"
          padding="xs"
          rounded="xl"
          border="subtle"
        >
          <LanguageToggle />
          <ThemeToggle />
          <NotificationDropdown />

          {isImpersonating && (
            <Box marginLeft="xs">
              <ImpersonateBtn onClick={handleExitImpersonation} title={t("exit_impersonation")} />
            </Box>
          )}
        </Box>

        {/* Separator */}
        <Box width="px" height="6" background="muted-soft" marginLeft="xs" marginRight="xs" />

        {/* User Profile Chip */}
        <ProfileChip onClick={() => router.push(`/${locale}/profil`)}>
          <Box
            width="10"
            height="10"
            rounded="lg"
            background="muted-soft"
            display="flex"
            align="center"
            justify="center"
            overflow="hidden"
            shrink="0"
          >
            {getAvatarUrl() ? (
              <Box as="img" src={getAvatarUrl()!} alt="" width="full" height="full" className="object-cover" />
            ) : (
              <Text variant="caption" weight="black" color="primary" className="text-[12px]">
                {getInitials()}
              </Text>
            )}
          </Box>
          <Box minWidth="0">
            <Text variant="subheading" weight="medium" className="truncate text-[15px]">
              {user?.name || t("guest")}
            </Text>
          </Box>
        </ProfileChip>
      </Box>
    </NavHeader>
  );
};

export default Navbar;
