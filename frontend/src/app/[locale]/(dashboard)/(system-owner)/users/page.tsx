"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Users, Search, Filter, Shield, 
  UserX, UserCheck, Mail, Building2,
  CheckCircle, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant_name: string | null;
  tenant_id: number | null;
  status: string;
  created_at: string;
}

interface Tenant {
  id: number;
  name: string;
}

export default function UserManagementPage() {
  const t = useTranslations("Users");
  const locale = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{show: boolean, user: User | null, action: 'suspend' | 'activate'}>({
    show: false, user: null, action: 'suspend'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, tenantData] = await Promise.all([
        apiService.users.list({ 
          q: search, 
          role: roleFilter, 
          tenant_id: tenantFilter 
        }),
        apiService.tenants.list()
      ]);
      setUsers(userData.users || []);
      setTenants(tenantData.tenants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter, tenantFilter]);

  const handleAction = async () => {
    if (!confirmModal.user) return;
    setSubmitting(true);
    try {
      if (confirmModal.action === 'suspend') {
        await apiService.users.suspend(confirmModal.user.id);
      } else {
        await apiService.users.activate(confirmModal.user.id);
      }
      setUsers(prev => prev.map(u => 
        u.id === confirmModal.user?.id 
          ? { ...u, status: confirmModal.action === 'suspend' ? 'suspended' : 'active' } 
          : u
      ));
      setConfirmModal({ show: false, user: null, action: 'suspend' });
    } catch (err) {
      console.error(err);
      alert(t("error_action"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 min-w-[150px]">
          <Filter size={18} className="text-muted-foreground" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2 text-sm outline-none w-full appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1em_1em] bg-[right_0.5em_center] bg-no-repeat"
          >
            <option value="">{t("all_roles")}</option>
            <option value="system_owner">System Owner</option>
            <option value="tenant_owner">Tenant Owner</option>
            <option value="admin">Admin</option>
            <option value="librarian">Librarian</option>
            <option value="member">Member</option>
          </select>
        </div>
        <div className="flex items-center gap-2 min-w-[150px]">
          <Building2 size={18} className="text-muted-foreground" />
          <select 
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2 text-sm outline-none w-full appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1em_1em] bg-[right_0.5em_center] bg-no-repeat"
          >
            <option value="">{t("all_tenants")}</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_user")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_role")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_tenant")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_status")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_joined")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70 text-right">{t("table_action")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                    {t("no_users")}
                  </td>
                </tr>
              ) : users.map((u, i) => (
                <motion.tr 
                  key={u.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-muted border border-border/50 flex items-center justify-center font-bold text-xs text-primary">
                        {u.name?.[0]}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {u.name}
                          {u.role === 'system_owner' && <Shield size={12} className="text-amber-500" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Mail size={10} /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full border ${
                      u.role === 'system_owner' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      u.role === 'tenant_owner' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-muted text-muted-foreground border-border/50'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-xs">{u.tenant_name || t("platform_staff")}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      u.status === 'active' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {u.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {u.status === 'active' ? t("status_active") : t("status_suspended")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'system_owner' && (
                      <button 
                        onClick={() => setConfirmModal({ 
                          show: true, 
                          user: u, 
                          action: u.status === 'active' ? 'suspend' : 'activate' 
                        })}
                        className={`p-2 rounded-lg transition-all ${
                          u.status === 'active' 
                            ? 'text-red-500 hover:bg-red-50' 
                            : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'active' ? 'Suspend User' : 'Aktifkan User'}
                      >
                        {u.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, user: null, action: 'suspend' })}
        onConfirm={handleAction}
        isLoading={submitting}
        variant={confirmModal.action === 'suspend' ? 'danger' : 'info'}
        title={t("confirm_title")}
        description={confirmModal.action === 'suspend' 
          ? t("confirm_suspend_desc", { name: confirmModal.user?.name || "" }) 
          : t("confirm_activate_desc", { name: confirmModal.user?.name || "" })}
        confirmLabel={t("confirm_btn")}
      />
    </div>
  );
}
