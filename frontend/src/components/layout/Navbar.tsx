"use client";

import { User, ShoppingBag, LogOut } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useUIStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import { getNavigationGroups } from "@/lib/navigation-config";
import { useNotifications } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const t = useTranslations("Navbar");
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { setIsCartOpen } = useUIStore();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const navT = useTranslations("Navigation");
  const { unreadCount, systemUnreadCount, messagesUnreadCount } = useNotifications();

  const role = user?.role?.name || "member";
  const isImpersonating = !!user?.impersonating;

  // Find active nav item
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
    // Determine root domain
    const host = window.location.host;
    const parts = host.split('.');
    let rootUrl = "";

    // If we have more than 2 parts (sub.domain.com) or it's a known multi-part dev domain like lvh.me
    if (parts.length > 2) {
      // Pick the last 2 parts (e.g. lvh.me:3000 or cleverarchives.com)
      const rootDomain = parts.slice(-2).join('.');
      const protocol = window.location.protocol;
      rootUrl = `${protocol}//${rootDomain}/${locale}/dashboard`;
    } else {
      // Fallback for localhost or if already on root
      rootUrl = `/${locale}/dashboard`;
    }
    
    window.location.href = rootUrl;
  };

  return (
    <header className="h-16 border-b border-[--color-border] bg-[--color-surface] px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left: Dynamic Title & Subtitle */}
      <div className="flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            <h1 className="font-bold text-[18px] text-[--color-text] leading-tight truncate">
              {displayTitle}
            </h1>
            <p className="text-[11px] font-medium text-[--color-muted-foreground] truncate opacity-70">
              {displaySubtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />

        {/* Notifications */}
        <NotificationDropdown />

        {isImpersonating && (
          <button
            onClick={handleExitImpersonation}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-md active:scale-95 ml-1"
            title={t("exit_impersonation")}
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        )}

        <div className="h-6 w-px bg-[--color-border] mx-1" />

        {/* User chip */}
        <button 
          className="flex items-center gap-2 p-1.5 hover:bg-[--color-muted] rounded-lg transition-colors pr-3"
          onClick={() => router.push(`/${locale}/profil`)}
        >
          <div className="w-7 h-7 rounded-lg bg-[--color-muted] flex items-center justify-center text-[--color-primary] overflow-hidden">
            {(() => {
              const avatarUrl = user?.avatar_url || (user as any)?.member?.avatar_url;
              if (avatarUrl) {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://localhost:3001";
                const fullUrl = avatarUrl.startsWith('http') ? avatarUrl : `${apiBaseUrl}${avatarUrl}`;
                return <img src={fullUrl} alt="" className="w-full h-full object-cover" />;
              }
              const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";
              return <span className="text-[12px] font-medium">{initials}</span>;
            })()}
          </div>
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="text-[14px] font-medium text-[--color-text]">{user?.name || t("guest")}</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
