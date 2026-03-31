"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, ChevronLeft } from "lucide-react";
import { getNavigationGroups } from "@/lib/navigation-config";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations, useLocale } from "next-intl";

import { useNotifications } from "@/contexts/NotificationContext";

const Sidebar = () => {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const { unreadCount, systemUnreadCount, messagesUnreadCount } = useNotifications();

  const role = user?.role?.name || "member";

  // ── System Owner menus ─────────────────────────────────────────────────────
  const counts = { unreadCount, systemUnreadCount, messagesUnreadCount };
  const menuGroups = getNavigationGroups(t, role, counts);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://localhost:3001";
  const logoUrl = user?.tenant?.logo_url ? (user.tenant.logo_url.startsWith('http') ? user.tenant.logo_url : `${apiBaseUrl}${user.tenant.logo_url}`) : null;
  const libraryName = user?.tenant?.name || (role === "system_owner" ? t("logo_main") : t("logo_main"));
  const librarySub = role === "system_owner" ? t("system_owner") : (user?.tenant?.name || t("logo_sub"));

  return (
    <aside className={cn(
      "fixed top-0 left-0 z-30 h-screen border-r border-[--color-border] bg-[--color-surface] transition-all duration-300 flex flex-col overflow-hidden",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo / Brand */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-[--color-primary] rounded-lg flex items-center justify-center text-white font-semibold text-[14px] shrink-0 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            libraryName.charAt(0).toUpperCase()
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col leading-none min-w-0">
            <span className="font-bold text-[18px] text-[--color-text] truncate">{libraryName}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6 mt-2 overflow-y-auto pb-4">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!sidebarCollapsed && (
              <h4 className="text-[12px] font-semibold text-[--color-muted-foreground] tracking-widest px-3 mb-2">
                {group.title}
              </h4>
            )}
            {group.items.map((item: any) => {
              const fullHref = `/${locale}${item.href}`;
              const isActive = pathname === fullHref || (item.subItems && (pathname === fullHref || pathname.startsWith(`${fullHref}/`)));
              return (
                <div key={item.href} className="space-y-0.5">
                  <Link
                    href={`/${locale}${item.href}`}
                    onClick={() => {
                      if (window.innerWidth < 1024 && !sidebarCollapsed) {
                        toggleSidebar();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[16px] transition-colors",
                      isActive
                        ? "bg-[--color-primary]/10 text-[--color-primary] font-semibold"
                        : "text-[--color-text-secondary] hover:bg-[--color-muted] hover:text-[--color-text]"
                    )}
                  >
                    <item.icon size={20} strokeWidth={2} className="shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-[--color-danger]" />
                        )}
                      </>
                    )}
                  </Link>
                  
                  {/* Sub Items */}
                  {item.subItems && isActive && !sidebarCollapsed && (
                    <div className="ml-9 space-y-0.5">
                      {item.subItems.map((sub: any) => {
                        const isSubActive = pathname === `/${locale}${sub.href}`;
                        return (
                          <Link 
                            key={sub.href}
                            href={`/${locale}${sub.href}`}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors",
                              isSubActive 
                                ? "bg-[--color-primary]/10 text-[--color-primary] font-semibold" 
                                : "text-[--color-muted-foreground] hover:text-[--color-text] hover:bg-[--color-muted]"
                            )}
                          >
                            <span>{sub.name}</span>
                            {sub.badge && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[--color-danger] text-white text-[12px] font-medium min-w-[18px] text-center">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: User + Actions */}
      <div className="mt-auto border-t border-[--color-border]">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[--color-muted] flex items-center justify-center text-[--color-primary] shrink-0 overflow-hidden text-[12px] font-medium">
            {(() => {
              const avatarUrl = user?.avatar_url || (user as any)?.member?.avatar_url;
              if (avatarUrl) {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://localhost:3001";
                const fullUrl = avatarUrl.startsWith('http') ? avatarUrl : `${apiBaseUrl}${avatarUrl}`;
                return <img src={fullUrl} alt="" className="w-full h-full object-cover" />;
              }
              const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";
              return <span>{initials}</span>;
            })()}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-none overflow-hidden min-w-0">
              <span className="font-medium text-[14px] truncate text-[--color-text]">{user?.name || t("guest")}</span>
              <span className="text-[12px] text-[--color-muted-foreground] truncate capitalize">
                {user?.impersonating 
                  ? t("system_owner") || "System Owner"
                  : user?.role?.name?.replace('_', ' ') || t("visitor")}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-7 py-3 hover:bg-[--color-danger]/5 hover:text-[--color-danger] transition-colors text-[--color-muted-foreground] text-[14px]"
        >
          <LogOut size={20} strokeWidth={2} />
          {!sidebarCollapsed && <span>{t("logout")}</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className="w-full px-7 py-3 flex items-center gap-3 hover:bg-[--color-muted] transition-colors text-[--color-muted-foreground] border-t border-[--color-border]"
        >
          <div className={cn(
            "transition-transform duration-300",
            sidebarCollapsed ? "rotate-180" : "rotate-0"
          )}>
            <ChevronLeft size={18} strokeWidth={2} />
          </div>
          {!sidebarCollapsed && <span className="text-[12px] font-medium text-[--color-muted-foreground]">{t("collapse")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
