"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { Plus, Building2, CheckCircle, Clock, XCircle, UserCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

interface Tenant {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  owner_email: string | null;
  owner_name: string | null;
  user_count: number;
  created_at: string;
}

export default function TenantManagementPage() {
  const t = useTranslations("Tenants");
  const locale = useLocale();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, tenant: Tenant | null}>({
    show: false, tenant: null
  });
  const router = useRouter();

  const statusConfig = {
    active:  { label: t("status_active"),   color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle },
    pending: { label: t("status_pending"), color: "text-amber-700 bg-amber-50 border-amber-200",         icon: Clock      },
    inactive:{ label: t("status_inactive"),color: "text-red-700 bg-red-50 border-red-200",                  icon: XCircle    },
  };

  const handleImpersonate = async (tenant: Tenant) => {
    try {
      const res = await apiService.tenants.impersonate(tenant.id);
      if (res.redirect_url) {
        window.open(res.redirect_url, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert(t("error_impersonate"));
    }
  };

  const fetchTenants = () => {
    setLoading(true);
    apiService.tenants.list()
      .then((data) => setTenants(data.tenants || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleToggleStatus = async () => {
    if (!confirmModal.tenant) return;
    const tenant = confirmModal.tenant;
    const isSuspending = tenant.status === "active";
    setSubmitting(true);
    try {
      if (isSuspending) {
        await apiService.tenants.suspend(tenant.id);
      } else {
        await apiService.tenants.activate(tenant.id);
      }
      fetchTenants();
      setConfirmModal({ show: false, tenant: null });
    } catch (err) {
      console.error(err);
      alert(t("error_status"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        </div>
        <Button
          onClick={() => router.push(`/${locale}/tenants/tambah`)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          {t("new_tenant_btn")}
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-[--color-border] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-muted]">
                <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground]">{t("table_library")}</th>
                <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground]">{t("table_subdomain")}</th>
                <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground]">{t("table_owner")}</th>
                <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground] text-center">{t("table_users")}</th>
                <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground] text-center">{t("table_status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 rounded-md bg-[--color-muted] animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : tenants.map((tenant, i) => {
                    const sc = statusConfig[tenant.status as keyof typeof statusConfig] || statusConfig.inactive;
                    return (
                      <motion.tr
                        key={tenant.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/${locale}/tenants/${tenant.id}`)}
                        className="group hover:bg-[--color-muted]/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-semibold">
                              {tenant.name?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-sm text-[--color-text]">{tenant.name}</div>
                              <div className="text-xs text-[--color-muted-foreground]">{tenant.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs text-[--color-text-secondary]">{tenant.subdomain}</code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-[14px] text-[--color-text]">{tenant.owner_name || "—"}</div>
                          <div className="text-[12px] text-[--color-muted-foreground]">{tenant.owner_email || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-[14px] font-medium text-[--color-text]">{tenant.user_count}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[12px] font-medium border ${sc.color}`}>
                              <sc.icon size={14} />
                              {sc.label}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
              }
            </tbody>
          </table>
          {!loading && tenants.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[--color-muted] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-[--color-muted-foreground]" />
              </div>
              <p className="font-medium text-base text-[--color-text]">{t("no_tenants")}</p>
              <p className="text-sm text-[--color-muted-foreground] max-w-sm mx-auto mt-1">{t("no_tenants_subtitle")}</p>
              <Button
                onClick={() => router.push(`/${locale}/tenants/tambah`)}
                className="mt-6"
              >
                {t("new_tenant_btn")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, tenant: null })}
        onConfirm={handleToggleStatus}
        isLoading={submitting}
        variant={confirmModal.tenant?.status === 'active' ? 'danger' : 'info'}
        title={t("confirm_title")}
        description={t("confirm_desc", { 
          action: confirmModal.tenant?.status === 'active' ? t("confirm_deactivate") : t("confirm_activate"),
          name: confirmModal.tenant?.name || "" 
        })}
        confirmLabel={t("confirm_btn")}
      />
    </div>
  );
}
