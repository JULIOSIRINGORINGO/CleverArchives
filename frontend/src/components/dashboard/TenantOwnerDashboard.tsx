import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, Building2, TrendingUp, BookOpen, 
  ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, 
  BarChart3, LineChart as LineChartIcon 
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import useSWR from "swr";
import React, { useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  PieChart, Cell, Pie, Legend
} from 'recharts';
import { PageHeader } from "@/components/layout/PageHeader";

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export default function TenantOwnerDashboard() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const locale = useLocale();
  const tenant = user?.tenant;
  
  const { data: statsData, mutate, isValidating } = useSWR('/tenants/stats', apiService.fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const stats = useMemo(() => statsData || null, [statsData]);
  const loading = !statsData;

  const quickLinks = [
    {
      href: `/${locale}/admins`,
      label: t("tenant_owner.admin_mgmt"),
      desc: t("tenant_owner.admin_desc"),
      icon: Users,
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      href: `/${locale}/library-settings`,
      label: t("tenant_owner.lib_settings"),
      desc: t("tenant_owner.lib_desc"),
      icon: Building2,
      color: "from-primary to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
  ];

  if (loading) return (
    <div className="space-y-gr-5 pb-gr-7 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded skeleton" />
          <div className="h-4 w-40 rounded skeleton opacity-60" />
        </div>
        <div className="h-9 w-40 rounded-xl skeleton" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gr-5">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gr-6">
        <div className="h-80 rounded-2xl skeleton" />
        <div className="h-80 rounded-2xl skeleton" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gr-6">
        <div className="h-64 rounded-2xl skeleton" />
        <div className="lg:col-span-2 h-64 rounded-2xl skeleton" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
      <PageHeader
        title={t("tenant_owner.welcome", { name: user?.name?.split(' ')[0] || "" })}
        subtitle={tenant ? tenant.name : "Dashboard Tenant Owner"}
        badge={t("tenant_owner.platform_status")}
        icon={<Building2 size={24} strokeWidth={2.5} />}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-6 px-4 md:px-6 space-y-gr-5">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gr-5">
        {[
          { label: t("tenant_owner.total_books"), value: stats?.summary?.total_books ?? 0, icon: BookOpen, color: "text-blue-600 bg-blue-500/10" },
          { label: t("tenant_owner.total_members"), value: stats?.summary?.total_members ?? 0, icon: Users, color: "text-violet-600 bg-violet-500/10" },
          { label: t("tenant_owner.active_borrows"), value: stats?.summary?.active_borrows ?? 0, icon: ArrowUpRight, color: "text-emerald-600 bg-emerald-500/10" },
          { label: t("tenant_owner.pending_returns"), value: stats?.summary?.pending_returns ?? 0, icon: ArrowDownRight, color: "text-amber-600 bg-amber-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border/50 p-gr-5 rounded-gr flex items-center gap-gr-4 shadow-sm"
          >
            <div className={`w-gr-6 h-gr-6 rounded-gr flex items-center justify-center ${stat.color}`}>
              <stat.icon size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="text-gr-xs font-medium text-muted-foreground">{stat.label}</div>
              <div className="text-gr-xl font-black">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gr-6">
        <div className="bg-card border border-border/50 rounded-gr p-gr-5 shadow-sm">
          <h3 className="font-black text-gr-xs tracking-widest mb-gr-5 flex items-center gap-gr-2">
            <TrendingUp size={18} strokeWidth={2} className="text-primary" /> {t("tenant_owner.member_growth")}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.member_growth || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-gr p-gr-5 shadow-sm">
          <h3 className="font-black text-gr-xs tracking-widest mb-gr-5 flex items-center gap-gr-2">
            <BarChart3 size={18} strokeWidth={2} className="text-primary" /> {t("tenant_owner.circulation")}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.circulation || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="borrows" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gr-6">
        <div className="lg:col-span-1 bg-card border border-border/50 rounded-gr p-gr-5 shadow-sm">
          <h3 className="font-black text-gr-xs tracking-widest mb-gr-5 flex items-center gap-gr-2">
            <PieChartIcon size={18} strokeWidth={2} className="text-primary" /> {t("tenant_owner.genre_distribution")}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categories || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.categories || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-gr-xs font-black tracking-widest text-muted-foreground/60 mb-gr-3">{t("tenant_owner.quick_access")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gr-5">
            {quickLinks.map((link, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={`group flex items-center gap-gr-5 p-gr-5 rounded-gr border border-border/50 ${link.bg} hover:border-primary/30 hover:shadow-lg transition-all duration-300`}
                >
                  <div className={`w-gr-6 h-gr-6 rounded-gr bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <link.icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="font-bold text-gr-sm">{link.label}</div>
                    <div className="text-gr-xs text-muted-foreground">{link.desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
