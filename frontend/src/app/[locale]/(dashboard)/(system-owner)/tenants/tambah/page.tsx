"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { 
  Building2, Mail, Globe, Shield, 
  CheckCircle, ArrowLeft, Plus, 
  Info, Loader2, Key
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/Button";

export default function AddTenantPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Tenants");
  const authT = useTranslations("Auth");
  
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    owner_name: "",
    owner_email: "",
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.subdomain.match(/^[a-z0-9-]+$/)) {
        throw new Error("Subdomain hanya boleh berisi huruf kecil, angka, dan tanda hubung.");
      }

      await apiService.tenants.create(formData);
      router.push(`/${locale}/tenants`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal membuat tenant baru. Silakan periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[--color-muted-foreground] hover:text-[--color-text] transition-colors mb-3 font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t("btn_back") || "Kembali ke Daftar"}
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">{t("new_tenant_btn")}</h1>
        <p className="text-sm text-[--color-muted-foreground]">Inisialisasi ekosistem perpustakaan baru di platform Clever Archives.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[--color-border] rounded-xl p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3 text-red-700 text-sm font-medium">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                    <Building2 size={14} /> Nama Perpustakaan
                  </label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Perpustakaan Nasional RI"
                    className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all text-foreground placeholder:text-[--color-muted-foreground]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                    <Globe size={14} /> Subdomain Akses
                  </label>
                  <div className="relative">
                    <input
                      required
                      name="subdomain"
                      value={formData.subdomain}
                      onChange={handleChange}
                      placeholder="perpusnas"
                      className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg pl-3 pr-24 py-2 text-sm transition-all font-mono placeholder:text-[--color-muted-foreground]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[--color-muted-foreground] bg-[--color-muted] px-2 py-1 rounded-md border border-[--color-border]">
                      .lvh.me
                    </div>
                  </div>
                  <p className="text-xs text-[--color-muted-foreground] flex items-center gap-1 mt-1">
                    <Info size={12} /> Hanya huruf kecil, angka, dan tanda hubung
                  </p>
                </div>

                <div className="h-px bg-[--color-border] my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                      <Shield size={14} /> Nama Owner
                    </label>
                    <input
                      required
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      placeholder="Nama Lengkap"
                      className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all placeholder:text-[--color-muted-foreground]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                      <Mail size={14} /> Email Owner
                    </label>
                    <input
                      required
                      type="email"
                      name="owner_email"
                      value={formData.owner_email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all placeholder:text-[--color-muted-foreground]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                    <Key size={14} /> Password Awal
                  </label>
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all placeholder:text-[--color-muted-foreground]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Plus size={16} />
                      Inisialisasi Tenant
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-blue-900">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-800">
              <Plus size={16} />
              Quick Info
            </h4>
            <div className="space-y-2.5 text-sm">
              <p className="text-blue-800/80 mb-2">Mendaftarkan tenant baru akan secara otomatis:</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 text-blue-600 mt-0.5" />
                  <span>Membuat akun User sebagai Tenant Owner.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 text-blue-600 mt-0.5" />
                  <span>Mengalokasikan subdomain unik untuk akses platform.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 text-blue-600 mt-0.5" />
                  <span>Mendaftarkan log audit inisialisasi sistem.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-[--color-border] rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-sm text-[--color-text] mb-2">Catatan Keamanan</h4>
            <p className="text-xs leading-relaxed text-[--color-muted-foreground]">
              Pastikan email owner yang dimasukkan valid karena akan digunakan untuk pengiriman notifikasi dan pemulihan akun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
