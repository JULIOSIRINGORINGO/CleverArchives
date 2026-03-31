"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2, BookOpen, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login({ email, password });
      
      if (res.redirect_url) {
        // Tenant owner -> Redirect to subdomain callback with locale
        const url = new URL(res.redirect_url);
        if (!url.pathname.includes(`/${locale}`)) {
          url.pathname = `/${locale}${url.pathname === '/' ? '' : url.pathname}`;
        }
        // Biarkan modal tetap terbuka dengan state loading sampai browser berpindah halaman
        window.location.href = url.toString();
        return;
      }

      // System owner / Member -> Biarkan modal tetap terbuka sampai Next.js selesai mounting dashboard
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || t("login_error"));
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-md bg-[--color-surface] rounded-gr shadow-2xl border border-[--color-border]/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-gr-4 right-gr-4 p-gr-2 text-[--color-muted-foreground] hover:text-[--color-text] hover:bg-[--color-muted] rounded-full transition-all"
          aria-label="Tutup"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <div className="p-gr-5">
          {/* Header */}
          <div className="flex flex-col items-center mb-gr-5">
            <div className="w-gr-6 h-gr-6 bg-gradient-to-tr from-[--color-primary] to-blue-500 rounded-gr flex items-center justify-center text-white shadow-lg mb-gr-4">
              <BookOpen size={24} strokeWidth={2} />
            </div>
            <h2 className="text-gr-xl font-black text-center tracking-tight text-[--color-text]">
              {t("welcome_back")}
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div className="p-gr-3 mb-gr-5 text-gr-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-gr border border-red-100 dark:border-red-800/30 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-gr-4">
            <div className="space-y-gr-2">
              <label className="text-gr-xs font-semibold text-[--color-text]">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-gr-4 py-gr-3 rounded-gr border border-[--color-muted] bg-[--color-muted]/30 focus:bg-[--color-surface] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30 transition-all text-[--color-text] placeholder:text-[--color-muted-foreground]/50"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-gr-2">
              <label className="text-gr-xs font-semibold text-[--color-text]">{t("password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-gr-4 py-gr-3 rounded-gr border border-[--color-muted] bg-[--color-muted]/30 focus:bg-[--color-surface] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30 transition-all pr-gr-7 text-[--color-text] placeholder:text-[--color-muted-foreground]/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-gr-3 top-1/2 -translate-y-1/2 text-[--color-muted-foreground] hover:text-[--color-text] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-gr-3.5 px-gr-6 bg-[--color-primary] hover:bg-[--color-primary]/90 text-[--color-primary-foreground] rounded-gr font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-gr-2 mt-gr-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} strokeWidth={2} /> : <><LogIn size={18} strokeWidth={2} /> {t("sign_in")}</>}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-gr-6 text-center text-gr-xs text-[--color-muted-foreground] font-medium">
            {t("no_account")}{" "}
            <Link
              href={`/${locale}/register`}
              onClick={onClose}
              className="font-bold text-[--color-primary] hover:underline"
            >
              {t("create_account")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
