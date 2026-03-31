"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { 
  Building2, Users, Shield, Calendar, Globe, 
  CheckCircle, Clock, XCircle, ArrowLeft, 
  UserCheck, AlertTriangle, Book, Library, Activity, Edit
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

interface TenantDetail {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  created_at: string;
  owner: {
    name: string | null;
    email: string | null;
  };
  stats: {
    total_books: number;
    total_copies: number;
    total_members: number;
    active_members: number;
  };
  activity_summary: {
    last_active_at: string | null;
    last_config_change_at: string | null;
    activity_count_7days: number;
  };
}

export default function TenantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations("Tenants");
  const locale = useLocale();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const dateLocale = locale === 'id' ? idLocale : enUS;

  const statusConfig = {
    active:  { label: t("status_active"),   color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle },
    pending: { label: t("status_pending"), color: "text-amber-700 bg-amber-50 border-amber-200",         icon: Clock      },
    inactive:{ label: t("status_inactive"),color: "text-red-700 bg-red-50 border-red-200",                  icon: XCircle    },
  };

  const fetchTenant = () => {
    setLoading(true);
    apiService.tenants.get(id as string)
      .then((data) => setTenant(data.tenant))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTenant(); }, [id]);

  const handleToggleStatus = async () => {
    if (!tenant) return;
    const isSuspending = tenant.status === "active";
    setActionLoading(true);
    try {
      if (isSuspending) {
        await apiService.tenants.suspend(tenant.id);
      } else {
        await apiService.tenants.activate(tenant.id);
      }
      fetchTenant();
      setConfirmModal(false);
    } catch (err) {
      console.error(err);
      alert(t("error_status"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!tenant) return;
    try {
      const res = await apiService.tenants.impersonate(tenant.id);
      if (res.redirect_url) {
        window.location.href = res.redirect_url;
      }
    } catch (err) {
      console.error(err);
      alert(t("error_impersonate"));
    }
  };

  const formatRelative = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: dateLocale });
    } catch (e) {
      return "—";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[--color-muted] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[--color-muted] rounded-xl" />)}
        </div>
        <div className="h-96 bg-[--color-muted] rounded-xl" />
      </div>
    );
  }

  if (!tenant) return <div className="text-center py-20 font-medium text-[--color-text]">{t("no_tenants")}</div>;

  const sc = statusConfig[tenant.status as keyof typeof statusConfig] || statusConfig.inactive;
  const isSuspended = tenant.status === 'inactive';

  return (
    <div className="space-y-6">
      {/* Suspended Banner */}
      {isSuspended && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-900 text-sm">{t("suspended_status")}</h4>
            <p className="text-sm text-amber-800 font-medium">
              {t("suspended_banner")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[--color-muted-foreground] hover:text-[--color-text] transition-colors mb-3 font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t("btn_back") || "Kembali ke Daftar"}
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-semibold">
              {tenant.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{tenant.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <code className="text-xs text-[--color-text-secondary]">
                  {tenant.subdomain}
                </code>
                <span className="w-1 h-1 rounded-full bg-[--color-border]" />
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${sc.color}`}>
                  <sc.icon size={14} />
                  {sc.label}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/tenants/${tenant.id}/edit`)}
            className="flex-1 md:flex-none"
          >
            <Edit size={16} className="mr-2" />
            {t("btn_edit") || "Edit"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleImpersonate}
            className="flex-1 md:flex-none"
          >
            <UserCheck size={16} className="mr-2" />
            {t("view_as_admin")}
          </Button>
          <Button
            variant={tenant.status === "active" ? "danger" : "primary"}
            onClick={() => setConfirmModal(true)}
            disabled={actionLoading}
            className="flex-1 md:flex-none"
          >
            {tenant.status === "active" ? t("btn_deactivate") : t("btn_activate")}
          </Button>
        </div>
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("stat_books"), value: tenant.stats.total_books, icon: Book, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: t("stat_copies"), value: tenant.stats.total_copies, icon: Library, color: "text-violet-600 bg-violet-50 border-violet-100" },
          { label: t("table_users"), value: tenant.stats.total_members, icon: Users, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: t("stat_active_members"), value: tenant.stats.active_members, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-white border p-5 rounded-xl flex items-center gap-4 ${stat.color.split(' ')[2]}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-xs font-medium text-[--color-muted-foreground] mb-0.5">{stat.label}</div>
              <div className="text-2xl font-semibold tracking-tight">{stat.value.toLocaleString()}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info & Owner */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[--color-border] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[--color-border] bg-[--color-muted] flex items-center justify-between">
              <h3 className="font-medium text-sm text-[--color-text]">
                {t("owner_info") || "Informasi Owner & Dasar"}
              </h3>
              <Building2 size={16} className="text-[--color-muted-foreground]" />
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-[--color-muted-foreground] font-medium flex items-center gap-2">
                    <Users size={14} /> {t("table_owner")}
                  </span>
                  <span className="font-semibold text-[--color-text]">{tenant.owner.name || "—"}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-[--color-muted-foreground] font-medium flex items-center gap-2">
                    <Mail size={14} /> Email Owner
                  </span>
                  <span className="font-semibold text-[--color-text] break-all">{tenant.owner.email || "—"}</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-[--color-muted-foreground] font-medium flex items-center gap-2">
                    <Globe size={14} /> Domain Akses
                  </span>
                  <span className="font-semibold text-[--color-text] font-mono bg-[--color-muted] px-2 py-1 rounded-md w-fit">
                    {tenant.subdomain}.lvh.me:3000
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-[--color-muted-foreground] font-medium flex items-center gap-2">
                    <Calendar size={14} /> {t("table_joined") || "Bergabung Pada"}
                  </span>
                  <span className="font-semibold text-[--color-text]">
                    {new Date(tenant.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border] bg-blue-50 flex items-start gap-4">
              <Shield size={20} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800 leading-relaxed font-medium">
                {t("impersonate_note") || "Sebagai System Owner, Anda dapat masuk ke dashboard tenant ini menggunakan fitur Impersonation untuk keperluan bantuan teknis atau audit data."}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-[--color-border] rounded-xl overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-[--color-border] bg-[--color-muted] flex items-center justify-between">
              <h3 className="font-medium text-sm text-[--color-text]">
                {t("detail_activity")}
              </h3>
              <Activity size={16} className="text-[--color-muted-foreground]" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[--color-muted-foreground] mb-0.5">{t("activity_last_active")}</div>
                    <div className="text-sm font-semibold text-[--color-text]">{formatRelative(tenant.activity_summary.last_active_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Settings size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[--color-muted-foreground] mb-0.5">{t("activity_config_change")}</div>
                    <div className="text-sm font-semibold text-[--color-text]">{formatRelative(tenant.activity_summary.last_config_change_at)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[--color-muted-foreground] mb-0.5">{t("activity_count")}</div>
                    <div className="text-sm font-semibold text-[--color-text]">{tenant.activity_summary.activity_count_7days} {t("actions") || "Aksi"}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[--color-border] text-center">
                <button 
                  onClick={() => router.push(`/${locale}/activity-logs?tenant_id=${tenant.id}`)}
                  className="text-sm font-medium text-[--color-primary] hover:underline"
                >
                  Lihat Semua Log Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleToggleStatus}
        isLoading={actionLoading}
        variant={tenant.status === 'active' ? 'danger' : 'info'}
        title={t("confirm_title")}
        description={t("confirm_desc", { 
          action: tenant.status === 'active' ? t("confirm_deactivate") : t("confirm_activate"),
          name: tenant.name 
        })}
        confirmLabel={t("confirm_btn")}
      />
    </div>
  );
}

// Dummy Mail icon for info section
const Mail = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const Settings = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
