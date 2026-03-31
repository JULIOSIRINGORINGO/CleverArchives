"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Settings, 
  Shield, 
  ShieldCheck, 
  AlertOctagon, 
  Save, 
  Power, 
  Loader2,
  X,
  Check,
  Monitor,
  Server,
  Database,
  Zap,
  AlertTriangle,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { Modal } from "@/components/ui/Modal";

export default function SystemSettingsPage() {
  const t = useTranslations("SystemSettings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    maintenance_message: ""
  });

  // Password Verification State
  const [showVerify, setShowVerify] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiService.systemSettings.get();
      setSettings({
        maintenance_mode: res.settings.maintenance_mode,
        maintenance_message: res.settings.maintenance_message
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initiateToggle = (val: boolean) => {
    setPendingToggle(val);
    setShowVerify(true);
    setVerifyPassword("");
    setVerifyError("");
  };

  const handleVerifyAndToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError("");
    try {
      await apiService.auth.verifyPassword(verifyPassword);
      // If verified, update the settings
      const newSettings = { ...settings, maintenance_mode: pendingToggle as boolean };
      await apiService.systemSettings.update(newSettings);
      setSettings(newSettings);
      setShowVerify(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setVerifyError(t("invalid_password"));
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await apiService.systemSettings.update(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert(t("save_error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-10 animate-pulse space-y-8">
      <div className="h-12 w-64 bg-muted rounded-2xl" />
      <div className="h-96 bg-muted rounded-[2.5rem]" />
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Verification Modal (Using standard Modal) */}
      <Modal 
        isOpen={showVerify} 
        onClose={() => setShowVerify(false)}
        className="max-w-md"
      >
        <div className="p-10">
          {/* Warning Alert Popup inside Modal */}
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-2xl flex items-start gap-3">
            <div className="mt-0.5 text-rose-600">
              <AlertOctagon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">{t("alert_title")}</h4>
              <p className="text-xs text-rose-800/70 dark:text-rose-300/60 font-medium leading-relaxed mt-1">
                {t("alert_description")}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 rounded-3xl flex items-center justify-center text-rose-600 shadow-sm mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center">{t("auth_required")}</h2>
            <p className="text-muted-foreground mt-2 text-center text-sm font-medium leading-relaxed">
              {t("auth_subtitle")}
            </p>
          </div>
          
          <form onSubmit={handleVerifyAndToggle} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">{t("password_label")}</label>
              <input 
                type="password"
                required
                value={verifyPassword}
                onChange={e => setVerifyPassword(e.target.value)}
                placeholder={t("password_placeholder")}
                className="w-full px-5 py-4 bg-muted/30 border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-center font-mono text-lg"
                autoFocus
              />
              {verifyError && (
                <p className="text-xs text-rose-500 font-medium mt-2 text-center">{verifyError}</p>
              )}
            </div>
            <button 
              type="submit"
              disabled={verifying}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
            >
              {verifying ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Shield size={18} />
                  {t("confirm_button")}
                </>
              )}
            </button>
          </form>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Settings size={32} />
            </div>
            {t("title")}
          </h1>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 h-fit"
        >
          {saving ? t("saving") : (success ? <><Check size={20} /> {t("success")}</> : <><Save size={20} /> {t("save")}</>)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Section */}
          <div className="bg-card border border-border/50 rounded-3xl p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Monitor size={20} className="text-primary" />
              {t("global_state")}
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border/50">
                <div className="max-w-[70%]">
                  <div className="font-bold flex items-center gap-2">
                    {t("maintenance_mode")}
                    {settings.maintenance_mode && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded-md animate-pulse border border-red-700 shadow-sm shadow-red-500/50">{t("maintenance_active")}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{t("maintenance_desc")}</div>
                </div>
                <button 
                  onClick={() => initiateToggle(!settings.maintenance_mode)}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner border ${settings.maintenance_mode ? 'bg-red-600 border-red-700 shadow-lg shadow-red-500/40' : 'bg-orange-500 border-orange-600 shadow-lg shadow-orange-500/20'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${settings.maintenance_mode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">{t("maintenance_msg_label")}</label>
                <textarea 
                  value={settings.maintenance_message}
                  onChange={e => setSettings({...settings, maintenance_message: e.target.value})}
                  className="w-full px-5 py-4 bg-muted/30 border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm min-h-[100px] resize-none"
                  placeholder={t("maintenance_msg_placeholder")}
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border/50">
                <div>
                  <div className="font-bold">{t("new_tenant_reg")}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t("new_tenant_desc")}</div>
                </div>
                <div className="w-14 h-8 bg-primary rounded-full relative cursor-not-allowed opacity-50">
                  <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Section */}
          <div className="bg-card border border-border/50 rounded-3xl p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Server size={20} className="text-primary" />
              {t("backup_infra")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-8 bg-muted/30 hover:bg-muted/50 rounded-3xl border border-border/50 transition-all border-dashed group">
                <Database size={32} className="text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                <span className="font-medium text-sm text-foreground">{t("trigger_backup")}</span>
                <span className="text-xs font-medium text-muted-foreground/60 mt-1">{t("trigger_backup_desc")}</span>
              </button>
              <button className="flex flex-col items-center justify-center p-8 bg-muted/30 hover:bg-muted/50 rounded-3xl border border-border/50 transition-all border-dashed group">
                <Zap size={32} className="text-muted-foreground group-hover:text-amber-500 transition-colors mb-4" />
                <span className="font-medium text-sm text-foreground">{t("flush_cache")}</span>
                <span className="text-xs font-medium text-muted-foreground/60 mt-1">{t("flush_cache_desc")}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-[2.5rem] p-8 border border-rose-100 dark:border-rose-900/30 backdrop-blur-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-500/10 transition-colors" />
             <h4 className="font-bold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2 text-sm">
               <AlertTriangle size={18} /> {t("critical_notice")}
             </h4>
             <p className="text-sm text-rose-800/80 dark:text-rose-300/80 leading-relaxed font-medium">
               {t("critical_notice_desc")} 
               <br /><br />
               <span className="text-rose-900 dark:text-rose-200">{t("critical_notice_backup")}</span>
             </p>
          </div>

          <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm space-y-6 transition-all hover:shadow-xl hover:shadow-primary/5">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Lock size={24} />
               </div>
               <div>
                 <div className="text-xs font-bold text-muted-foreground mb-0.5">{t("security_protocol")}</div>
                 <div className="font-bold text-sm">{t("security_logs")}</div>
               </div>
             </div>
             <p className="text-xs text-muted-foreground leading-relaxed font-medium">
               {t("security_logs_desc", { level: '"SYSTEM_LEVEL"' })}
             </p>
             <button className="w-full py-4 bg-muted hover:bg-muted/80 rounded-2xl text-xs font-bold transition-all active:scale-95">
               {t("view_logs")}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
