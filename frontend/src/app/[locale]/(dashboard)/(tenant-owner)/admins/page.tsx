"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Users, Mail, UserPlus, Shield, 
  UserX, UserCheck, ShieldCheck, Search,
  Clock, MoreHorizontal, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminsPage() {
  const t = useTranslations("Admins");
  const locale = useLocale();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "librarian", password: "password123" });
  const [submitting, setSubmitting] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{show: boolean, admin: Admin | null, action: 'suspend' | 'activate'}>({
    show: false, admin: null, action: 'suspend'
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await apiService.users.list();
      const filtered = (data.users || []).filter((u: any) => 
        ['admin', 'librarian', 'tenant_owner'].includes(u.role)
      );
      setAdmins(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.users.create(inviteForm);
      setInviteModal(false);
      setInviteForm({ name: "", email: "", role: "librarian", password: "password123" });
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || t("error_invite"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async () => {
    if (!confirmModal.admin) return;
    setSubmitting(true);
    try {
      if (confirmModal.action === 'suspend') {
        await apiService.users.suspend(confirmModal.admin.id);
      } else {
        await apiService.users.activate(confirmModal.admin.id);
      }
      setAdmins(prev => prev.map(a => 
        a.id === confirmModal.admin?.id 
          ? { ...a, status: confirmModal.action === 'suspend' ? 'suspended' : 'active' } 
          : a
      ));
      setConfirmModal({ show: false, admin: null, action: 'suspend' });
    } catch (err) {
      console.error(err);
      alert(t("error_action"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <button 
          onClick={() => setInviteModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <UserPlus size={18} />
          {t("invite_button")}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t("stat_total"), value: admins.length, icon: Shield, color: "text-blue-600 bg-blue-50" },
          { label: t("stat_active"), value: admins.filter(a => a.status === 'active').length, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
          { label: t("stat_suspended"), value: admins.filter(a => a.status !== 'active').length, icon: UserX, color: "text-red-600 bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & List */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-muted-foreground/70">{t("table_identity")}</th>
                  <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-muted-foreground/70">{t("table_role")}</th>
                  <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-muted-foreground/70">{t("table_status")}</th>
                  <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-muted-foreground/70">{t("table_registered")}</th>
                  <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-muted-foreground/70 text-right">{t("table_action")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/10">
                      <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                    </tr>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      {t("no_staff")}
                    </td>
                  </tr>
                ) : filteredAdmins.map((admin, i) => (
                  <motion.tr 
                    key={admin.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/10 hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {admin.name?.[0]}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {admin.name}
                            {admin.role === 'tenant_owner' && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold tracking-tight shadow-sm border border-amber-200">Owner</span>}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Mail size={10} /> {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium tracking-tight text-muted-foreground bg-muted px-2 py-1 rounded">
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight border ${
                        admin.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                         {admin.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
                         {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {admin.role !== 'tenant_owner' && (
                        <button 
                          onClick={() => setConfirmModal({ 
                            show: true, 
                            admin, 
                            action: admin.status === 'active' ? 'suspend' : 'activate' 
                          })}
                          className={`p-2 rounded-lg transition-all ${
                            admin.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={admin.status === 'active' ? 'Nonavktifkan Akses' : 'Aktifkan Akses'}
                        >
                          {admin.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal 
        isOpen={inviteModal} 
        onClose={() => setInviteModal(false)}
        className="max-w-md"
      >
        <div className="p-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 mb-6">
              <UserPlus size={32} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground ">{t("invite_modal_title")}</h2>
          </div>
          
          <form onSubmit={handleInvite} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium tracking-tight text-muted-foreground ml-1">{t("label_name")}</label>
              <input 
                type="text" 
                required
                value={inviteForm.name}
                onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/30 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/30 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium tracking-tight text-muted-foreground ml-1">{t("label_email")}</label>
              <input 
                type="email" 
                required
                value={inviteForm.email}
                onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                placeholder="budi@example.com"
                className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/30 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/30 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-tight text-muted-foreground ml-1">{t("label_role")}</label>
                <select 
                  value={inviteForm.role}
                  onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/30 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-medium appearance-none"
                >
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-tight text-muted-foreground ml-1">{t("label_password")}</label>
                <input 
                  type="password" 
                  required
                  value={inviteForm.password}
                  onChange={e => setInviteForm({...inviteForm, password: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/30 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-mono"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-5 px-6 bg-primary text-primary-foreground rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex justify-center items-center gap-3 mt-6 tracking-tight text-xs"
            >
              {submitting ? t("btn_sending") : <><UserPlus size={18} /> {t("btn_invite")}</>}
            </button>
          </form>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, admin: null, action: 'suspend' })}
        onConfirm={handleAction}
        isLoading={submitting}
        variant={confirmModal.action === 'suspend' ? 'danger' : 'info'}
        title={t("confirm_title")}
        description={confirmModal.action === 'suspend' 
          ? t("confirm_suspend_desc", { name: confirmModal.admin?.name || "" }) 
          : t("confirm_activate_desc", { name: confirmModal.admin?.name || "" })}
        confirmLabel={t("confirm_btn")}
      />
    </div>
  );
}
