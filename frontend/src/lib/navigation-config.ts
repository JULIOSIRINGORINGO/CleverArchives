import {
  LayoutDashboard, Book, Users, ArrowLeftRight, FileText,
  BarChart3, Settings, Database, Wallet, Clock, User, 
  Building2, ScrollText, ClipboardList, UserCog, BookMarked, 
  Megaphone, Mail, ShoppingBag
} from "lucide-react";

export interface NavSubItem {
  name: string;
  href: string;
  badge?: string | number | boolean;
}

export interface NavItem {
  name: string;
  icon: any;
  href: string;
  badge?: string | number | boolean;
  subItems?: NavSubItem[];
  description?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const getNavigationGroups = (t: any, role: string, counts: any) => {
  const { unreadCount, systemUnreadCount, messagesUnreadCount } = counts;

  const systemOwnerGroups: NavGroup[] = [
    {
      title: t("core_platform"),
      items: [
        { name: t("overview"),          icon: LayoutDashboard, href: "/dashboard", description: t("overview_desc") },
        { name: t("tenant_management"), icon: Building2,       href: "/tenants", description: t("tenant_mgmt_desc") },
        { name: t("user_management"),   icon: Users,           href: "/users", description: t("user_mgmt_desc") },
      ]
    },
    {
      title: t("communications"),
      items: [
        { name: t("communications_center"),  icon: Megaphone,       href: "/communications", description: t("comm_center_desc") },
        { name: t("my_profile"),             icon: User,            href: "/profil", description: t("profile_desc") },
      ]
    },
    {
      title: t("security_ops"),
      items: [
        { name: t("audit_trail"),       icon: ScrollText,      href: "/activity-logs", description: t("audit_trail_desc") },
        { name: t("system_settings"),   icon: Settings,        href: "/system-settings", description: t("system_settings_desc") },
      ]
    },
    {
      title: t("master_data"),
      items: [
        { 
          name: t("master_data"), icon: Database, href: "/master-data",
          description: t("master_data_desc"),
          subItems: [
            { name: t("field_config"),      href: "/master-data/fields" },
            { name: t("dropdown_options"),  href: "/master-data/options" },
          ]
        },
      ]
    }
  ];

  const tenantOwnerGroups: NavGroup[] = [
    {
      title: t("management"),
      items: [
        { name: t("dashboard"),                   icon: LayoutDashboard, href: "/dashboard", description: t("dashboard_desc") },
        { name: t("monitoring_catalog"),          icon: BookMarked,      href: "/book-catalog", description: t("catalog_desc") },
        { 
          name: t("members"), icon: Users, href: "/members",
          description: t("members_desc"),
          subItems: [
            { name: t("member_list"), href: "/members" },
            { name: t("add_member"), href: "/members/new" },
          ]
        },
        { name: t("admin_management"),             icon: UserCog,         href: "/admins", description: t("admins_desc") },
      ]
    },
    {
      title: t("communications"),
      items: [
        { 
          name: t("communications_center"),       icon: Megaphone,       href: "/messaging/internal",
          description: t("comm_center_desc"),
          badge: unreadCount > 0,
          subItems: [
            { name: t("internal_messaging"),      href: "/messaging/internal", badge: messagesUnreadCount > 0 ? messagesUnreadCount : undefined },
            { name: t("system_messaging"),        href: "/messaging/system", badge: systemUnreadCount > 0 ? systemUnreadCount : undefined },
            { name: t("broadcast_messaging"),     href: "/messaging/broadcast" },
          ]
        },
        { name: t("financial_report"),            icon: Wallet,          href: "/financial-report", description: t("finance_desc") },
        { name: t("my_profile"),                  icon: User,            href: "/profil", description: t("profile_desc") },
      ]
    },
    {
      title: t("system"),
      items: [
        { name: t("library_config"),              icon: Settings,        href: "/library-settings", description: t("settings_desc") },
        { name: t("activity_logs"),               icon: ScrollText,      href: "/activity-logs", description: t("audit_trail_desc") },
      ]
    }
  ];

  const adminGroups: NavGroup[] = [
    {
      title: t("management"),
      items: [
        { name: t("dashboard"), icon: LayoutDashboard, href: "/dashboard", description: t("dashboard_desc") },
        { 
          name: t("monitoring_catalog"), icon: BookMarked, href: "/book-catalog",
          description: t("catalog_desc"),
          subItems: [
            { name: t("book_list"), href: "/book-catalog" },
            { name: t("add_book"), href: "/book-catalog/new" },
          ]
        },
        {
          name: t("library"), icon: ArrowLeftRight, href: "/loans",
          description: t("loans_desc"),
          subItems: [
            { name: t("active_loans"), href: "/loans/active" },
            { name: t("process_loan"), href: "/loans/process" },
            { name: t("process_return"), href: "/loans/return" },
          ]
        },
        {
          name: t("members"), icon: Users, href: "/members",
          description: t("members_desc"),
          subItems: [
            { name: t("member_list"), href: "/members" },
            { name: t("add_member"), href: "/members/new" },
          ]
        }
      ]
    },
    {
      title: t("communications"),
      items: [
        { 
          name: t("communications_center"), icon: Megaphone, href: "/messaging/internal",
          description: t("comm_center_desc"),
          badge: unreadCount > 0,
          subItems: [
            { name: t("internal_messaging"),      href: "/messaging/internal", badge: messagesUnreadCount > 0 ? messagesUnreadCount : undefined },
            { name: t("system_messaging"),        href: "/messaging/system", badge: systemUnreadCount > 0 ? systemUnreadCount : undefined },
          ]
        },
        { 
          name: t("financial_report"), icon: BarChart3, href: "/reports",
          description: t("finance_desc"),
          subItems: [
            { name: t("loan_report"), href: "/reports/loans" },
            { name: t("popular_books"), href: "/reports/popular" },
          ]
        },
      ]
    },
    {
      title: t("system"),
      items: [
        { name: t("activity_logs"), icon: Clock, href: "/activity-logs", description: t("audit_trail_desc") },
        { name: t("my_profile"), icon: User, href: "/profil", description: t("profile_desc") },
      ]
    }
  ];

  const memberGroups: NavGroup[] = [
    {
      title: t("main"),
      items: [
        { name: t("dashboard"), icon: LayoutDashboard, href: "/dashboard", description: t("dashboard_desc") },
        { name: t("browse"), icon: Book, href: "/catalog", description: t("browse_desc") },
        { name: t("ebooks"), icon: FileText, href: "/ebooks", description: t("ebooks_desc") },
      ]
    },
    {
      title: t("library"),
      items: [
        { name: t("borrowed"), icon: ArrowLeftRight, href: "/borrowed", description: t("borrowed_desc") },
        { name: t("history"), icon: Clock, href: "/history", description: t("history_desc") },
        { name: t("cart"), icon: ShoppingBag, href: "/cart", description: t("cart_desc") },
        { name: t("checkout"), icon: ClipboardList, href: "/checkout", description: t("checkout_desc") },
      ]
    },
    {
      title: t("communications"),
      items: [
        { 
          name: t("communications_center"), icon: Megaphone, href: "/messaging/internal",
          description: t("comm_center_desc"),
          badge: unreadCount > 0,
          subItems: [
            { name: t("internal_messaging"),      href: "/messaging/internal", badge: messagesUnreadCount > 0 ? messagesUnreadCount : undefined },
            { name: t("system_messaging"),        href: "/messaging/system", badge: systemUnreadCount > 0 ? systemUnreadCount : undefined },
          ]
        },
      ]
    },
    {
      title: t("account"),
      items: [
        { name: t("my_profile"), icon: User, href: "/profil", description: t("profile_desc") },
      ]
    }
  ];

  if (role === "system_owner") return systemOwnerGroups;
  if (role === "tenant_owner") return tenantOwnerGroups;
  if (role === "admin" || role === "librarian") return adminGroups;
  return memberGroups;
};
