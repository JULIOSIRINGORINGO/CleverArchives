"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import useSWR, { useSWRConfig, unstable_serialize } from "swr";
import { 
  History, User, Activity, Calendar, 
  Search, Filter, ChevronLeft, ChevronRight,
  Clock, Wrench, Database, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import StandardLayout from "@/components/layout/StandardLayout";

interface LogEntry {
  id: number;
  actor_name: string;
  actor_type: string;
  action: string;
  target_type: string;
  target_id: string | number;
  metadata: any;
  created_at: string;
}

export default function ActivityLogsPage() {
  const t = useTranslations("ActivityLogs");
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  
  const { cache } = useSWRConfig();
  
  // Try to get initial logs from cache to avoid flicker
  const initialKey = unstable_serialize(['/activity_logs', null, '', '', '', '']);
  const cachedLogs = cache.get(initialKey)?.data;
  const initialLogsData = cachedLogs?.logs || cachedLogs || [];

  const [logs, setLogs] = useState<LogEntry[]>(Array.isArray(initialLogsData) ? initialLogsData : []);
  const [loading, setLoading] = useState(!cachedLogs);
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenant_id");
  const [filter, setFilter] = useState({ 
    action_type: "", 
    from: "", 
    to: "",
    tenant_id: tenantId || ""
  });

  const lastSyncRef = useRef<string | null>(null);
  
  // useSWR for activity logs - Stable key
  const { mutate: mutateLogs } = useSWR(
    !authLoading && user ? ['/activity_logs', filter.action_type, filter.from, filter.to, filter.tenant_id] : null,
    () => apiService.auditLogs.list({ 
      ...filter,
      updated_after: lastSyncRef.current || ''
    }),
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onSuccess: (newData) => {
        if (newData?.logs) {
          setLogs(prev => {
            const newItems = newData.logs;
            if (newItems.length === 0) return prev;

            const merged = [...prev];
            newItems.forEach((item: LogEntry) => {
              const idx = merged.findIndex(l => l.id === item.id);
              if (idx > -1) merged[idx] = item;
              else merged.unshift(item);
            });
            return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          });
          lastSyncRef.current = new Date().toISOString();
        }
        setLoading(false);
      }
    }
  );

  const fetchLogs = async () => {
    mutateLogs();
  };

  useEffect(() => { 
    lastSyncRef.current = null;
    // No-clear: we leave the old data shown until SWR gets a fresh list for the new filter.
  }, [filter.action_type, filter.from, filter.to, filter.tenant_id]);

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <Shield size={16} className="text-emerald-500" />;
    if (action.includes('create') || action.includes('add')) return <Database size={16} className="text-blue-500" />;
    if (action.includes('update') || action.includes('edit')) return <Wrench size={16} className="text-amber-500" />;
    return <Activity size={16} className="text-muted-foreground" />;
  };

  const getLogColor = (action: string) => {
    if (action.includes('login')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (action.includes('create') || action.includes('add')) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (action.includes('update') || action.includes('edit')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-500/10 text-red-600 border-red-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getActionName = (action: string) => {
    try {
      return t(`actions.${action}`);
    } catch {
      return action.replace(/_/g, ' ');
    }
  };

  const renderMetadata = (log: LogEntry) => {
    if (!log.metadata || Object.keys(log.metadata).length === 0) return t("no_additional_detail");

    if (log.action === 'update_book' || log.action === 'update_library_settings') {
      const changes = log.metadata.changes || {};
      const changedKeys = Object.keys(changes);
      if (changedKeys.length === 0) return t("no_changes");
      return `${t("changing")}: ${changedKeys.join(', ')}`;
    }

    if (log.metadata.book_title) {
      return `${t("book")}: ${log.metadata.book_title}`;
    }

    if (log.metadata.title) {
      return `${t("item")}: ${log.metadata.title}`;
    }

    return JSON.stringify(log.metadata);
  };

  if (authLoading) return null;

  return (
    <StandardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <History className="text-primary" size={32} />
            {t("title")}
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-xs font-bold tracking-widest text-muted-foreground ml-1">{t("filter_label")}</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <select 
                value={filter.action_type}
                onChange={e => setFilter({...filter, action_type: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none text-sm"
              >
                <option value="">{t("filter_all")}</option>
                <option value="user_login">{t("filter_login")}</option>
                <option value="create_book">{t("filter_add_book")}</option>
                <option value="update_book">{t("filter_update_book")}</option>
                <option value="borrow_book">{t("filter_borrow")}</option>
                <option value="return_book">{t("filter_return")}</option>
                <option value="update_library_settings">{t("filter_settings")}</option>
              </select>
            </div>
          </div>

          <button 
            onClick={fetchLogs}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            {t("apply_filter")}
          </button>
        </div>

        {/* Logs Table */}
        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-muted-foreground">{t("table_time")}</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-muted-foreground">{t("table_actor")}</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-muted-foreground">{t("table_action")}</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-muted-foreground">{t("table_target")}</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-muted-foreground">{t("table_detail")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-muted rounded w-full" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                      {t("no_logs")}
                    </td>
                  </tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold flex items-center gap-1.5">
                          <Clock size={12} className="text-muted-foreground" />
                          {new Date(log.created_at).toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(log.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{log.actor_name || t("system")}</span>
                          <span className="text-xs text-muted-foreground font-black tracking-tighter">{log.actor_type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest border ${getLogColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {getActionName(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{log.target_type || "-"}</span>
                        <span className="text-xs text-muted-foreground">ID: {log.target_id || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-muted-foreground font-medium max-w-[200px] truncate" title={renderMetadata(log)}>
                        {renderMetadata(log)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StandardLayout>
  );
}
