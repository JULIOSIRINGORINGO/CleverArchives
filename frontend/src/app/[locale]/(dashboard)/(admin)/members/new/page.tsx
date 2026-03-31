"use client";

import { useState } from "react";
import { 
  Users, Save, ArrowLeft, Mail, 
  Phone, User, MapPin, Hash, Lock,
  Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

export default function AddMemberPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  const t = useTranslations("Members");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    member_code: `MBR-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
    joined_at: format(new Date(), 'yyyy-MM-dd')
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.post("/members", { member: formData });
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/members`), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menambah member baru");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/20">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 justify-center">
            {t("success_title")}
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm">{t("success_add_member")}</p>
        </div>
        <p className="text-xs font-bold text-primary animate-pulse  tracking-wider mt-4">{t("redirecting")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Link 
          href={`/${locale}/members`}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="text-primary" size={24} />
            {t("add_member_title")}
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-xs font-bold border border-red-100 shadow-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5">
          {/* Identity Card */}
          <Card className="rounded-xl border shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <h3 className="text-xs font-bold  tracking-widest text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border/40">
                <User size={14} /> {t("identity_data")}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">{t("full_name")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <input 
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t("name_placeholder")}
                        className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm"
                      />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">{t("member_code")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <input 
                        required
                        type="text"
                        name="member_code"
                        value={formData.member_code}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 bg-muted/10 border border-border/20 rounded-lg outline-none font-bold text-sm text-primary tracking-wider"
                      />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">{t("email_active")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@contoh.com"
                        className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm"
                      />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">{t("password_login")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <input 
                        required
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={t("password_hint")}
                        minLength={6}
                        className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm"
                      />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">{t("phone_number")}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0812xxxxxxxx"
                        className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm"
                      />
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Address & Other */}
          <Card className="rounded-xl border shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <h3 className="text-xs font-bold  tracking-widest text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border/40">
                <MapPin size={14} /> {t("address_extra")}
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">{t("domicile_address")}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 -translate-y-1/2 text-muted-foreground/40" size={16} />
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder={t("address_placeholder")}
                    className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end items-center">
           <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 font-bold text-muted-foreground hover:text-foreground rounded-lg h-10"
          >
            {t("cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-56 h-10 rounded-lg font-bold shadow-sm gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {t("register_member_btn")}
          </Button>
        </div>
      </form>
    </div>
  );
}
