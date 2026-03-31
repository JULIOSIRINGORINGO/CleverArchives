"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { Building2, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";

interface Stats {
  total_tenants: number;
  active_tenants: number;
  pending_tenants: number;
  total_users: number;
}

export default function SystemOwnerDashboard() {
  const t = useTranslations("Dashboard.system_owner");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    apiService.tenants.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: t("total_tenants"),    value: stats.total_tenants,  icon: Building2,    color: "text-blue-600",   bg: "bg-blue-50/50" },
    { label: t("active_tenants"),   value: stats.active_tenants, icon: CheckCircle,  color: "text-green-600", bg: "bg-green-50/50" },
    { label: t("pending_tenants"),  value: stats.pending_tenants,icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50/50" },
    { label: t("total_users"),      value: stats.total_users,    icon: Users,        color: "text-purple-600", bg: "bg-purple-50/50" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-[--color-muted-foreground] mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-[--color-muted] animate-pulse" />
            ))
          : statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl p-5 border border-[--color-border] bg-[--color-surface]`}
              >
                <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon size={20} strokeWidth={2} />
                </div>
                <div className="text-2xl font-semibold text-[--color-text]">{card.value}</div>
                <div className="text-sm font-medium text-[--color-muted-foreground] mt-1">{card.label}</div>
              </motion.div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href={`/${locale}/tenants`}
          className="group flex items-center gap-4 p-5 rounded-xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-primary]/30 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-lg bg-[--color-primary]/10 flex items-center justify-center text-[--color-primary] group-hover:scale-105 transition-transform">
            <Building2 size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="font-semibold text-sm text-[--color-text]">{t("tenant_mgmt")}</div>
            <div className="text-sm text-[--color-muted-foreground] mt-0.5">{t("tenant_mgmt_desc")}</div>
          </div>
          <TrendingUp size={18} className="ml-auto text-[--color-muted-foreground] group-hover:text-[--color-primary] transition-colors" />
        </Link>

        <Link
          href={`/${locale}/users`}
          className="group flex items-center gap-4 p-5 rounded-xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-primary]/30 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-lg bg-[--color-primary]/10 flex items-center justify-center text-[--color-primary] group-hover:scale-105 transition-transform">
            <Users size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="font-semibold text-sm text-[--color-text]">{t("user_mgmt")}</div>
            <div className="text-sm text-[--color-muted-foreground] mt-0.5">{t("user_mgmt_desc")}</div>
          </div>
          <TrendingUp size={18} className="ml-auto text-[--color-muted-foreground] group-hover:text-[--color-primary] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
