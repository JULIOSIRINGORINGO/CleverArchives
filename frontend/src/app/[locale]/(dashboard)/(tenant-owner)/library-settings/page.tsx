"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Settings, Building2, Palette, ShieldCheck, 
  Upload, Check, Info, Save, Globe,
  Briefcase, Mail, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

export default function LibrarySettingsPage() {
  const t = useTranslations("LibrarySettings");
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'policy'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    accent_color: "indigo",
    fine_per_day: 1000,
    max_borrow_days: 14,
    max_books_per_member: 5
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError("");
    try {
      await apiService.auth.verifyPassword(verifyPassword);
      setIsVerified(true);
    } catch (err: any) {
      setVerifyError(t("invalid_password"));
    } finally {
      setVerifying(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiService.settings.get();
      if (res.tenant) {
        setForm({
          name: res.tenant.name || "",
          description: res.settings?.description || "",
          address: res.settings?.address || "",
          accent_color: res.settings?.accent_color || "indigo",
          fine_per_day: res.settings?.fine_per_day || 1000,
          max_borrow_days: res.settings?.max_borrow_days || 14,
          max_books_per_member: res.settings?.max_books_per_member || 5
        });
        if (res.tenant.logo_url) setLogoPreview(res.tenant.logo_url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (logoFile) {
        const formData = new FormData();
        formData.append('tenant[name]', form.name);
        formData.append('tenant[logo]', logoFile);
        await apiService.tenants.updateSettings(formData);
      }

      await apiService.settings.update({
        tenant_setting: {
          description: form.description,
          address: form.address,
          accent_color: form.accent_color,
          fine_per_day: form.fine_per_day,
          max_borrow_days: form.max_borrow_days,
          max_books_per_member: form.max_books_per_member
        }
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert(t("save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) return (
    <div className="p-8 animate-pulse space-y-8">
      <div className="h-10 w-64 bg-[--color-muted] rounded-lg" />
      <div className="h-96 bg-[--color-muted] rounded-xl" />
    </div>
  );

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm bg-white border border-[--color-border] rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-semibold mb-2 tracking-tight text-[--color-text]">{t("protected_area")}</h2>
          <p className="text-[--color-muted-foreground] text-sm mb-6 font-medium">
            {t("protected_desc")}
          </p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1">
              <input 
                type="password"
                required
                value={verifyPassword}
                onChange={e => setVerifyPassword(e.target.value)}
                placeholder={t("password_placeholder")}
                className="w-full px-4 py-2.5 bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg text-center font-mono text-sm transition-all"
                autoFocus
              />
              {verifyError && (
                <p className="text-xs text-red-500 font-medium mt-1.5">{verifyError}</p>
              )}
            </div>
            <Button 
              type="submit"
              disabled={verifying}
              className="w-full"
            >
              {verifying ? t("verifying") : t("verify_button")}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Settings size={24} className="text-[--color-primary]" />
            {t("title")}
          </h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? t("saving") : (success ? <><Check size={16} /> {t("success")}</> : <><Save size={16} /> {t("save")}</>)}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[--color-muted] rounded-lg w-fit border border-[--color-border]">
        {[
          { id: 'profile', label: t('tabs.profile'), icon: Building2 },
          { id: 'branding', label: t('tabs.branding'), icon: Palette },
          { id: 'policy', label: t('tabs.policy'), icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-[--color-text] shadow-sm' 
                : 'text-[--color-muted-foreground] hover:text-[--color-text]'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                className="bg-white border border-[--color-border] rounded-xl p-6 space-y-6 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                       <Building2 size={14} /> {t("profile.name")}
                    </label>
                    <input 
                      type="text" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                       <MapPin size={14} /> {t("profile.address")}
                    </label>
                    <input 
                      type="text" 
                      value={form.address}
                      onChange={e => setForm({...form, address: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                     <Info size={14} /> {t("profile.description")}
                  </label>
                  <textarea 
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg text-sm transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'branding' && (
              <motion.div 
                key="branding"
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                className="bg-white border border-[--color-border] rounded-xl p-6 space-y-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[--color-text]">{t("branding.logo")}</label>
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-lg bg-[--color-muted] border border-dashed border-[--color-border] flex items-center justify-center overflow-hidden transition-all group-hover:border-[--color-primary]">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="text-[--color-muted-foreground] opacity-50" size={24} />
                        )}
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium  text-center px-2">
                          {t("branding.change_logo")}
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <label className="text-sm font-medium text-[--color-text]">{t("branding.accent_color")}</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {['indigo', 'blue', 'emerald', 'amber', 'rose', 'violet'].map(color => (
                        <button
                          key={color}
                          onClick={() => setForm({...form, accent_color: color})}
                          className={`h-10 rounded-lg transition-all border-2 flex items-center justify-center ${
                            form.accent_color === color ? 'border-[--color-primary] ring-1 ring-[--color-primary]/20' : 'border-transparent opacity-80 hover:opacity-100'
                          } bg-${color}-500`}
                          style={{ backgroundColor: color === 'indigo' ? '#6366f1' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : color === 'rose' ? '#f43f5e' : '#8b5cf6' }}
                        >
                          {form.accent_color === color && <Check className="text-white" size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'policy' && (
              <motion.div 
                key="policy"
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                className="bg-white border border-[--color-border] rounded-xl p-6 space-y-6 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-text]">{t("policy.fine")}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-[--color-muted-foreground] text-sm">Rp</span>
                      <input 
                        type="number" 
                        value={form.fine_per_day}
                        onChange={e => setForm({...form, fine_per_day: parseInt(e.target.value)})}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg text-sm transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-text]">{t("policy.max_days")}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={form.max_borrow_days}
                        onChange={e => setForm({...form, max_borrow_days: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg text-sm transition-all pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[--color-muted-foreground]">{t("policy.days_suffix")}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-text]">{t("policy.max_books")}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={form.max_books_per_member}
                        onChange={e => setForm({...form, max_books_per_member: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg text-sm transition-all pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[--color-muted-foreground]">{t("policy.books_suffix")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
             <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-1.5 text-sm">
               <Info size={16} className="text-blue-600" /> {t("tips_title")}
             </h4>
             <ul className="space-y-2.5 text-sm text-blue-800/80 font-medium">
               {["0", "1", "2"].map((i) => (
                 <li key={i} className="flex gap-2 items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <span className="leading-tight">{t(`tips.${i}`)}</span>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="bg-white border border-[--color-border] rounded-xl p-5 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-lg bg-[--color-muted] flex items-center justify-center">
                 <Globe size={16} className="text-[--color-primary]" />
               </div>
               <div>
                 <div className="text-xs font-medium text-[--color-muted-foreground]">{t("connection_status")}</div>
                 <div className="text-sm font-semibold text-[--color-text]">{t("connected")}</div>
               </div>
             </div>
             <p className="text-xs text-[--color-muted-foreground] leading-relaxed mt-2">
               {t("infra_note")}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
