"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiService } from "@/services/api";
import { 
  Building2, Globe, Shield, 
  ArrowLeft, CheckCircle,
  Info, Loader2, Save
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/Button";

interface TenantData {
  name: string;
  subdomain: string;
  status: string;
  owner_name: string;
  owner_email: string;
  owner_password?: string;
}

export default function EditTenantPage() {
  const router = useRouter();
  const { id } = useParams();
  const locale = useLocale();
  const t = useTranslations("Tenants");
  
  const [formData, setFormData] = useState<TenantData>({
    name: "",
    subdomain: "",
    status: "active",
    owner_name: "",
    owner_email: "",
    owner_password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const fetchTenant = async () => {
    try {
      setFetchLoading(true);
      const res = await apiService.tenants.get(id as string);
      if (res.tenant) {
        setFormData({
          name: res.tenant.name || "",
          subdomain: res.tenant.subdomain || "",
          status: res.tenant.status || "active",
          owner_name: res.tenant.owner?.name || "",
          owner_email: res.tenant.owner?.email || "",
          owner_password: ""
        });
      }
    } catch (err: any) {
      setError("Gagal memuat data tenant.");
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.subdomain.match(/^[a-z0-9-]+$/)) {
        throw new Error("Subdomain hanya boleh berisi huruf kecil, angka, dan tanda hubung.");
      }

      await apiService.tenants.update(id as string, formData);
      router.push(`/${locale}/tenants/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memperbarui tenant. Silakan periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (fetchLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-[--color-muted-foreground]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[--color-muted-foreground] hover:text-[--color-text] transition-colors mb-3 font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t("btn_back") || "Kembali"}
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">{t("btn_edit") || "Edit Tenant"}</h1>
        <p className="text-sm text-[--color-muted-foreground]">Perbarui konfigurasi dan status akses tenant perpustakaan ini.</p>
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
                      placeholder="Nama Lengkap Owner"
                      className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all text-foreground placeholder:text-[--color-muted-foreground]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                      <Shield size={14} /> Email Owner
                    </label>
                    <input
                      required
                      type="email"
                      name="owner_email"
                      value={formData.owner_email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all text-foreground placeholder:text-[--color-muted-foreground]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                    <Shield size={14} /> {t("owner_password") || "Password Baru"}
                  </label>
                  <input
                    type="password"
                    name="owner_password"
                    value={formData.owner_password}
                    onChange={handleChange}
                    placeholder={t("owner_password_placeholder") || "Kosongkan jika tidak ingin ganti"}
                    className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all text-foreground placeholder:text-[--color-muted-foreground]"
                  />
                  <p className="text-xs text-[--color-muted-foreground]">{t("owner_password_info") || "Gunakan kombinasi huruf, angka, dan simbol untuk keamanan."}</p>
                </div>

                <div className="h-px bg-[--color-border] my-6" />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[--color-muted-foreground] flex items-center gap-2">
                    <Shield size={14} /> Status Tenant
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all text-foreground"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif (Suspend)</option>
                    <option value="pending">Pending</option>
                  </select>
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
                      <Save size={16} />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-amber-900">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-800">
              <Info size={16} />
              Quick Info
            </h4>
            <div className="space-y-2.5 text-sm">
              <p className="text-amber-800/80 mb-2">Mengedit tenant akan mempengaruhi:</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                  <span>Subdomain akses bila diganti akan membuat URL lama tidak dapat diakses lagi.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                  <span>Mengubah ke status Nonaktif akan memaksa semua pengguna tenant ini logout.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
