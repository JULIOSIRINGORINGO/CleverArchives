"use client";

import { useState } from "react";
import { apiService } from "@/services/api";
import { X, Building2, Globe, Mail, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9\-]*[a-z0-9]$|^[a-z0-9]$/;

export default function CreateTenantModal({ onClose, onCreated }: Props) {
  const [name, setName]       = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  const validateSubdomain = (val: string) => {
    if (!val) return "Subdomain wajib diisi";
    if (!SUBDOMAIN_REGEX.test(val)) return "Hanya huruf kecil, angka, dan tanda hubung. Tidak boleh diawali/diakhiri tanda hubung.";
    if (val.length < 2) return "Minimal 2 karakter";
    if (val.length > 50) return "Maksimal 50 karakter";
    return null;
  };

  const handleSubdomainChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    setSubdomain(cleaned);
    setSubdomainError(null); // clear on change
  };

  const handleSubdomainBlur = () => {
    setSubdomainError(validateSubdomain(subdomain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sdError = validateSubdomain(subdomain);
    if (sdError) { setSubdomainError(sdError); return; }

    setLoading(true);
    setError(null);

    try {
      await apiService.tenants.create({
        name,
        subdomain,
        owner_email: ownerEmail,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 bg-background rounded-3xl shadow-2xl border border-border/50 w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-md">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Buat Tenant Baru</h2>
              <p className="text-sm text-muted-foreground">Tambahkan perpustakaan ke platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-800/30">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Building2 size={14} className="text-muted-foreground" />
              Nama Instansi
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Library Alpha"
              required
              className="w-full px-4 py-3 rounded-xl border border-muted bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Subdomain */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Globe size={14} className="text-muted-foreground" />
              Subdomain
            </label>
            <div className="relative">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                onBlur={handleSubdomainBlur}
                placeholder="contoh: tenant-a"
                required
                className={`w-full px-4 py-3 rounded-xl border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 transition-all text-sm font-mono ${
                  subdomainError
                    ? "border-red-400 focus:ring-red-400/20"
                    : "border-muted focus:ring-primary/20"
                }`}
              />
              {subdomain && !subdomainError && (
                <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
            {subdomainError ? (
              <p className="text-xs text-red-500 font-semibold">{subdomainError}</p>
            ) : subdomain ? (
              <p className="text-xs text-muted-foreground">
                Akan diakses di: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{subdomain}.lvh.me:3000</code>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Hanya huruf kecil, angka, dan tanda hubung (–)</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Mail size={14} className="text-muted-foreground" />
              Email Tenant Owner
            </label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="contoh: owner@tenant-a.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-muted bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-border/50 font-bold text-sm hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
              {loading ? "Membuat…" : "Buat Tenant"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
