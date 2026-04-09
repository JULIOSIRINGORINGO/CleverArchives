"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut } from "lucide-react";
import { getNavigationGroups } from "@/lib/navigation-config";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import { useNotifications } from "@/contexts/NotificationContext";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { IconWrapper } from "@/components/ui/IconWrapper";

/** 
 * LEVEL 3: ESTETIKA LOKAL (Sidebar Specific)
 * Standardized wrappers to ensure "Zero ClassName" in the main return block.
 */

// 1. Root Containers
const SidebarRoot = ({ collapsed, children }: { collapsed: boolean; children: React.ReactNode }) => (
  <Box
    as="aside"
    position="fixed"
    display="flex"
    direction="col"
    border="subtle"
    background="surface"
    className={cn(
      "top-0 left-0 z-30 h-screen transition-all duration-300 overflow-hidden border-r",
      collapsed ? "w-16" : "w-64"
    )}
  >
    {children}
  </Box>
);

const NavContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    as="nav"
    flex="1"
    minHeight="0"
    overflow="auto"
    paddingX="xs" 
    paddingY="xs"
    className="space-y-6 scrollbar-none"
  >
    {children}
  </Box>
);

// 2. Header & Labels
const SidebarHeader = ({ children }: { children: React.ReactNode }) => (
  <Box
    height="20"
    paddingX="md"
    display="flex"
    align="center"
    gap="md"
    shrink="0"
  >
    {children}
  </Box>
);

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <Box paddingX="md" paddingY="sm">
    <Text
      variant="label-strong"
      weight="black"
      uppercase
      opacity="60"
      className="text-[11px] tracking-widest block"
    >
      {children}
    </Text>
  </Box>
);

// 3. Footer Elements
const FooterRoot = ({ children }: { children: React.ReactNode }) => (
  <Box
    as="footer"
    marginTop="auto"
    border="subtle"
    shrink="0"
    background="surface"
    className="border-t"
  >
    {children}
  </Box>
);

const ActionRow = ({ onClick, children, isDanger }: any) => (
  <Box
    as="button"
    onClick={onClick}
    width="full"
    display="flex"
    align="center"
    gap="lg"
    paddingX="lg"
    paddingY="md"
    variant="interactive"
    className={cn(
      "border-none outline-none group",
      isDanger ? "hover:bg-red-50 text-[--color-muted-foreground] hover:text-red-500" : "text-[--color-muted-foreground]"
    )}
  >
    {children}
  </Box>
);


const NavItem = ({ 
  href, 
  icon: Icon, 
  name, 
  collapsed, 
  active, 
  badge, 
  onClick 
}: { 
  href: string; 
  icon: any; 
  name: string; 
  collapsed: boolean; 
  active: boolean; 
  badge?: string | number;
  onClick: () => void;
}) => (
  <Box
    asChild
    display="flex"
    align="center"
    gap="md"
    paddingX="md"
    paddingY="sm"
    rounded="lg"
    className={cn(
      "transition-all duration-200 group no-underline border-none",
      active 
        ? "bg-[--color-primary]/10 text-[--color-primary]" 
        : "text-[--color-text-secondary] hover:bg-[--color-muted] hover:text-[--color-text]"
    )}
  >
    <Link href={href} onClick={onClick}>
      <IconWrapper size="sm" isGhost={!active}>
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      </IconWrapper>
      {!collapsed && (
        <Box flex="1" minWidth="0">
          <Text 
            variant="body" 
            weight={active ? "black" : "medium"} 
            className="truncate block"
            color={active ? "primary" : "default"}
          >
            {name}
          </Text>
        </Box>
      )}
      {!collapsed && badge && (
         <Box width="2" height="2" rounded="full" background="danger" shrink="0" />
      )}
    </Link>
  </Box>
);

const SubNavItem = ({ 
  href, 
  name, 
  active, 
  badge,
  onClick
}: { 
  href: string; 
  name: string; 
  active: boolean; 
  badge?: string | number;
  onClick?: () => void;
}) => (
  <Box
    asChild
    display="flex"
    align="center"
    justify="between"
    paddingX="md"
    paddingY="xs"
    rounded="md"
    className={cn(
      "transition-all no-underline border-none",
      active 
        ? "bg-[--color-primary]/10 text-[--color-primary]" 
        : "text-[--color-muted-foreground] hover:text-[--color-text] hover:bg-[--color-muted]"
    )}
  >
    <Link href={href} onClick={onClick}>
      <Text 
        variant="subheading" 
        weight={active ? "black" : "medium"} 
        color={active ? "primary" : "default"}
        className="truncate"
      >
        {name}
      </Text>
      {badge && (
        <Box background="danger" rounded="full" paddingX="xs" className="min-w-[18px] text-center py-0.5">
          <Text variant="caption" weight="black" color="white">{badge}</Text>
        </Box>
      )}
    </Link>
  </Box>
);

const Sidebar = () => {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);
  
  const currentPath = optimisticPath || pathname;

  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const { unreadCount, systemUnreadCount, messagesUnreadCount } = useNotifications();

  const role = user?.role?.name || "member";
  const counts = { unreadCount, systemUnreadCount, messagesUnreadCount };
  const menuGroups = getNavigationGroups(t, role, counts);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://localhost:3001";
  const logoUrl = user?.tenant?.logo_url ? (user.tenant.logo_url.startsWith('http') ? user.tenant.logo_url : `${apiBaseUrl}${user.tenant.logo_url}`) : null;
  const libraryName = user?.tenant?.name || t("logo_main");

  const getInitials = () => user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";
  const getAvatarUrl = () => {
    const avatar = user?.avatar_url || (user as any)?.member?.avatar_url;
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${apiBaseUrl}${avatar}`;
  };

  return (
    <SidebarRoot collapsed={sidebarCollapsed}>
      <SidebarHeader>
        <Box 
          width="10" 
          height="10" 
          rounded="lg" 
          background="primary" 
          display="flex" 
          align="center" 
          justify="center" 
          overflow="hidden" 
          shrink="0"
        >
          {logoUrl ? (
            <Box as="img" src={logoUrl} alt="" width="full" height="full" className="object-cover" />
          ) : (
            <Text variant="label-strong" color="white" className="text-lg">
              {libraryName.charAt(0).toUpperCase()}
            </Text>
          )}
        </Box>
        {!sidebarCollapsed && (
          <Text variant="heading" weight="black" className="truncate text-[18px]">
            {libraryName}
          </Text>
        )}
      </SidebarHeader>

      <NavContainer>
        {menuGroups.map((group, groupIdx) => (
          <Stack key={groupIdx} spacing="xs">
            {!sidebarCollapsed && <GroupLabel>{group.title}</GroupLabel>}
            <Stack spacing="xs">
              {group.items.map((item: any) => {
                const fullHref = `/${locale}${item.href}`;
                const isSubActive = item.subItems?.some((sub: any) => currentPath === `/${locale}${sub.href}`);
                const isActive = currentPath === fullHref || isSubActive || (item.subItems && currentPath.startsWith(`${fullHref}/`));
                
                return (
                  <Stack key={item.href} spacing="xs">
                    <NavItem 
                      href={fullHref}
                      icon={item.icon}
                      name={item.name}
                      collapsed={sidebarCollapsed}
                      active={isActive}
                      badge={item.badge}
                      onClick={() => {
                        setOptimisticPath(fullHref);
                        if (window.innerWidth < 1024 && !sidebarCollapsed) toggleSidebar();
                      }}
                    />
                    
                    {item.subItems && isActive && !sidebarCollapsed && (
                      <Box marginLeft="lg" display="flex" direction="col" gap="xs">
                        {item.subItems.map((sub: any) => (
                          <SubNavItem 
                            key={sub.href}
                            href={`/${locale}${sub.href}`}
                            name={sub.name}
                            active={currentPath === `/${locale}${sub.href}`}
                            badge={sub.badge}
                            onClick={() => setOptimisticPath(`/${locale}${sub.href}`)}
                          />
                        ))}
                      </Box>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        ))}
      </NavContainer>

      <FooterRoot>
        {/* User Profile Info */}
        <Box padding="sm" display="flex" align="center" gap="md">
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
              <Text variant="caption" weight="black" color="primary" className="text-sm">
                {getInitials()}
              </Text>
            )}
          </Box>
          {!sidebarCollapsed && (
            <Box minWidth="0" display="flex" direction="col">
              <Text variant="subheading" weight="black" className="truncate text-sm">
                {user?.name || t("guest")}
              </Text>
              <Text variant="caption" color="muted" className="capitalize truncate text-xs">
                {user?.impersonating 
                  ? t("system_owner") 
                  : user?.role?.name?.replace('_', ' ') || t("visitor")}
              </Text>
            </Box>
          )}
        </Box>
        
        {/* Logout Button */}
        <ActionRow onClick={logout} isDanger>
          <IconWrapper size="xs" isGhost color="primary">
             <LogOut size={18} strokeWidth={2.5} />
          </IconWrapper>
          {!sidebarCollapsed && <Text variant="caption" weight="black" className="text-[13px]">{t("logout")}</Text>}
        </ActionRow>
        
        {/* Collapse Button */}
        <ActionRow onClick={toggleSidebar}>
          <Box className={cn("transition-transform duration-300 flex items-center justify-center", sidebarCollapsed ? "rotate-180" : "rotate-0")}>
            <IconWrapper size="xs" isGhost>
              <ChevronLeft size={18} strokeWidth={2.5} />
            </IconWrapper>
          </Box>
          {!sidebarCollapsed && (
            <Text variant="caption" weight="black" opacity="60" className="text-[13px]">
              {t("collapse")}
            </Text>
          )}
        </ActionRow>
      </FooterRoot>
    </SidebarRoot>
  );
};

export default Sidebar;
