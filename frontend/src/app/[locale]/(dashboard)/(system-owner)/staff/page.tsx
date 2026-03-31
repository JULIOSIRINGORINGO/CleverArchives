"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  UserPlus, ShieldCheck, Mail, Calendar, 
  Trash2, UserCog, CheckCircle, XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function InternalStaffPage() {
  const t = useTranslations("InternalStaff");
  const locale = useLocale();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await apiService.users.list({ role: 'system_owner' });
      setStaffs(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            {t("title")}
          </h1>
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          onClick={() => alert(t("invite_alert"))}
        >
          <UserPlus size={18} />
          {t("invite_btn")}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
          <div className="text-xs font-medium text-muted-foreground tracking-tight mb-1">{t("total_staf")}</div>
          <div className="text-3xl font-bold">{staffs.length}</div>
        </div>
        <div className="bg-white/5 border border-border/10 p-6 rounded-2xl shadow-sm italic text-xs text-muted-foreground leading-relaxed flex items-center justify-center text-center">
          &quot;{t("description")}&quot;
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_name")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_email")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_status")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70">{t("table_joined")}</th>
                <th className="px-6 py-4 font-bold text-xs text-muted-foreground/70 text-right">{t("table_management")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/10">
                    <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : staffs.map((s: Staff, i: number) => (
                <motion.tr 
                  key={s.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white font-bold text-xs">
                        {s.name?.[0]}
                      </div>
                      <span className="font-bold">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-muted-foreground flex items-center gap-2">
                    <Mail size={14} className="opacity-50" /> {s.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 text-[11px] font-bold border border-emerald-100 dark:border-emerald-800/50">
                      <CheckCircle size={12} /> {t("status_active")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all" title={t("edit_role")}>
                        <UserCog size={18} />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title={t("revoke_access")}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
