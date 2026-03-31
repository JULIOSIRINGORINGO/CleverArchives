"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Users, Search, Filter, Plus, 
  MoreVertical, Edit2, Trash2, Mail,
  Phone, Calendar, UserCheck, UserMinus,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/Button";

export default function MembersListPage() {
  const t = useTranslations("Members");
  const locale = useLocale();
  const router = useRouter();
  const dateLocale = locale === 'id' ? id : enUS;
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Confirm Dialog states
  const [suspendModal, setSuspendModal] = useState<{ show: boolean; member: any | null }>({ show: false, member: null });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; member: any | null }>({ show: false, member: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.members.list();
      const data = res.data || res.members || res || [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredMembers = Array.isArray(members) ? members.filter(m => {
    const matchesSearch = 
      m.name?.toLowerCase().includes(search.toLowerCase()) || 
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleSuspendConfirm = async () => {
    if (!suspendModal.member) return;
    setIsProcessing(true);
    setErrorMsg(null);
    const member = suspendModal.member;
    const action = member.status === 'active' ? 'suspend' : 'activate';
    try {
      await apiService.post(`/members/${member.id}/${action}`, {});
      setSuspendModal({ show: false, member: null });
      fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t("error_update_status"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.member) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await apiService.delete(`/members/${deleteModal.member.id}`);
      setDeleteModal({ show: false, member: null });
      fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t("error_delete"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Users className="text-primary" size={22} />
            {t("title")}
          </h1>
        </div>
        <Link 
          href={`/${locale}/members/new`}
          className="w-full md:w-auto flex items-center justify-center gap-2 h-9 px-4 bg-primary text-white text-sm rounded-lg font-bold shadow-sm transition-all hover:bg-primary/90"
        >
          <Plus size={16} /> {t("add_button")}
        </Link>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground hidden md:block" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold min-w-[140px]"
          >
            <option value="all">{t("all_status")}</option>
            <option value="active">{t("status_active")}</option>
            <option value="inactive">{t("status_inactive")}</option>
            <option value="suspended">{t("status_suspended")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground">{t("table_profile")}</th>
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground hidden sm:table-cell">{t("table_contact")}</th>
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground hidden md:table-cell">{t("table_joined")}</th>
                <th className="px-4 py-3 text-xs font-bold  tracking-wider text-muted-foreground text-center">{t("table_status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-9 w-40 bg-muted rounded-md" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-32 bg-muted rounded-md" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 bg-muted rounded-md" /></td>
                    <td className="px-4 py-3 text-center"><div className="h-5 w-16 bg-muted rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground text-xs font-medium">{t("no_members")}</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    onClick={() => router.push(`/${locale}/members/${member.id}`)}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            member.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{member.name}</div>
                          <div className="text-xs text-muted-foreground font-bold  tracking-widest truncate">#{member.member_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 space-y-1 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs truncate">
                        <Mail size={12} className="text-primary/50 shrink-0" /> <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs">
                        <Phone size={12} className="text-primary/50 shrink-0" /> {member.phone || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar size={12} className="text-primary/50" />
                        {member.joined_at ? format(new Date(member.joined_at), 'dd MMM yyyy', { locale: dateLocale }) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                       <span className={`px-2.5 py-0.5 text-[9px] font-bold  tracking-wider rounded-md border ${
                         member.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         member.status === 'suspended' ? 'bg-red-50 text-red-600 border-red-100' :
                         'bg-gray-50 text-gray-500 border-gray-100'
                       }`}>
                         {t(`status_${member.status}`)}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={suspendModal.show}
        onClose={() => { setSuspendModal({ show: false, member: null }); setErrorMsg(null); }}
        onConfirm={handleSuspendConfirm}
        title={suspendModal.member?.status === 'active' ? t("suspend_title") : t("activate_title")}
        description={
          suspendModal.member?.status === 'active' 
            ? t("suspend_confirm", { name: suspendModal.member?.name })
            : t("activate_confirm", { name: suspendModal.member?.name })
        }
        confirmLabel={suspendModal.member?.status === 'active' ? t("suspend_btn") : t("activate_btn")}
        cancelLabel={t("cancel") || "Batal"}
        variant={suspendModal.member?.status === 'active' ? 'warning' : 'info'}
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={deleteModal.show}
        onClose={() => { setDeleteModal({ show: false, member: null }); setErrorMsg(null); }}
        onConfirm={handleDeleteConfirm}
        title={t("delete_title")}
        description={t("delete_confirm", { name: deleteModal.member?.name })}
        confirmLabel={t("delete_btn") || "Hapus"}
        cancelLabel={t("cancel") || "Batal"}
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
