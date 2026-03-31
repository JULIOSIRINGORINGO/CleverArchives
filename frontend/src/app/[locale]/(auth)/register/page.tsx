"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, BookOpen, ArrowLeft } from "lucide-react";
import { apiService } from "@/services/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tenant, setTenant] = useState<any>(null);
  const [fetchingTenant, setFetchingTenant] = useState(true);
  
  // Get token from URL if present
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    if (token) {
      setInvitationToken(token);
    }

    const checkTenant = async () => {
      const host = window.location.hostname;
      const parts = host.split('.');
      const subdomain = parts.length > 2 && !['www', 'api', 'localhost'].includes(parts[0]) ? parts[0] : null;

      if (!subdomain) {
        // Redirect to main domain/discovery if no subdomain
        router.push(`/${locale}`);
        return;
      }

      try {
        const data = await apiService.tenants.publicFind(subdomain);
        setTenant(data);
      } catch (err) {
        // If tenant doesn't exist, redirect back to find library
        router.push(`/${locale}`);
      } finally {
        setFetchingTenant(false);
      }
    };

    checkTenant();
  }, [router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError(t("password_mismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({ 
        name, 
        email, 
        password, 
        password_confirmation: passwordConfirmation,
        tenant_id: tenant?.id, // Although backend should detect from subdomain, we pass it for safety
        invitation_token: invitationToken
      });
      // Biarkan button tetap state loading saat navigasi
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || t("registration_error"));
      setLoading(false);
    }
  };

  if (fetchingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between p-gr-6 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-gr-3 group z-10">
          <div className="w-gr-6 h-gr-6 bg-white/20 backdrop-blur-md rounded-gr flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden p-gr-1">
            {tenant?.logo_url ? (
               <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
            ) : (
               <BookOpen size={24} />
            )}
          </div>
          <span className="font-black text-gr-xl tracking-tight">{tenant?.name || "Clever Archives"}</span>
        </Link>

        {/* Tagline */}
        <div className="z-10 space-y-gr-5">
          <div>
            <h1 className="text-gr-2xl font-black leading-[1.1] tracking-tight">
              {t("adventure_title")}<br />
              <span className="opacity-70">{tenant?.name || t("adventure_highlight")}</span>
            </h1>
          </div>

          {/* Social proof / quick stats */}
          <div className="grid grid-cols-3 gap-gr-4">
            {[
              { label: t("stats_books"), value: "10K+" },
              { label: t("stats_members"), value: "5K+" },
              { label: t("stats_free"), value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-gr p-gr-4 text-center">
                <p className="text-gr-xl font-black">{stat.value}</p>
                <p className="text-gr-xs font-bold opacity-70 tracking-widest mt-gr-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home link */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-gr-2 text-white/70 hover:text-white font-semibold text-gr-xs transition-colors z-10 w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t("back_to_home")}
        </Link>
      </div>

      {/* Right: Form Panel */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile: Back to Home */}
        <div className="lg:hidden p-gr-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-gr-2 text-muted-foreground hover:text-foreground font-semibold text-gr-xs transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t("back_to_home")}
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-gr-5 lg:p-gr-6">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-gr-2 mb-gr-5">
              <div className="w-gr-5 h-gr-5 bg-primary rounded-gr flex items-center justify-center text-primary-foreground overflow-hidden p-gr-1">
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
                ) : (
                  <BookOpen size={20} />
                )}
              </div>
              <span className="font-black text-gr-xl tracking-tight">{tenant?.name || "Clever Archives"}</span>
            </div>

            <div className="mb-gr-5">
              <h2 className="text-gr-xl font-black tracking-tight">{t("join_library")}</h2>
            </div>

            {error && (
              <div className="p-gr-3.5 mb-gr-5 text-gr-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-gr border border-red-100 dark:border-red-800/30">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-gr-4">
              <div className="grid sm:grid-cols-2 gap-gr-4">
                <div className="space-y-gr-1.5">
                  <label className="text-gr-xs font-semibold text-foreground">{t("name")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-gr-4 py-gr-3 rounded-gr border border-muted bg-muted/30 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-gr-1.5">
                  <label className="text-gr-xs font-semibold text-foreground">{t("email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-gr-4 py-gr-3 rounded-gr border border-muted bg-muted/30 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-gr-1.5">
                <label className="text-gr-xs font-semibold text-foreground">{t("password")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-gr-4 py-gr-3 rounded-gr border border-muted bg-muted/30 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-gr-7 text-foreground placeholder:text-muted-foreground/50"
                    placeholder={t("password_hint")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-gr-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-gr-1.5">
                <label className="text-gr-xs font-semibold text-foreground">{t("confirmPassword")}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full px-gr-4 py-gr-3 rounded-gr border border-muted bg-muted/30 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                  placeholder={t("password_hint")}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-gr-3.5 px-gr-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-gr font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-gr-2 mt-gr-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={18} /> {t("create_button")}</>}
              </button>
            </form>

            <div className="mt-gr-6 text-center text-gr-xs text-muted-foreground">
              {t("has_account")}{" "}
              <Link href={`/${locale}?login=true`} className="font-bold text-primary hover:underline">
                {t("sign_in_link")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
