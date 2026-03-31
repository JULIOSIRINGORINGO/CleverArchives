"use client";

import { useState, useEffect } from "react";
import { 
  Users, Save, ArrowLeft, Mail, 
  Phone, User, MapPin, Hash,
  Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  const id = params?.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    member_code: "",
    status: ""
  });

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    setFetching(true);
    try {
      const res = await apiService.get(`/members/${id}`);
      const member = res.member || res;
      setFormData({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        address: member.address || "",
        member_code: member.member_code || "",
        status: member.status || "active"
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memuat data member");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.patch(`/members/${id}`, { member: formData });
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/members`), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memperbarui data member");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-black animate-pulse text-sm  tracking-widest">Memuat Data Member...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20 shadow-inner">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight flex items-center gap-3 justify-center">
            Pembaruan Berhasil!
          </h2>
          <p className="text-muted-foreground mt-2 font-medium text-lg">Data member berhasil diperbarui.</p>
        </div>
        <p className="text-sm font-bold text-primary animate-pulse  tracking-widest mt-8">Mengalihkan ke daftar member...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href={`/${locale}/members`}
          className="p-3 hover:bg-muted rounded-2xl transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Edit Member
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 shadow-sm animate-shake">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity Card */}
          <Card className="md:col-span-2 rounded-[2.5rem] border-none shadow-2xl shadow-black/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <h3 className="text-sm font-bold  tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <User size={16} /> Data Identitas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-2">Nama Lengkap <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                      <input 
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap member..."
                        className="w-full pl-14 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-2">Kode Member <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                      <input 
                        required
                        type="text"
                        name="member_code"
                        value={formData.member_code}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-4 py-4 bg-muted/10 border border-border/20 rounded-2xl outline-none font-black text-primary tracking-widest"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-2">Email Aktif <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@contoh.com"
                        className="w-full pl-14 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-2">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0812xxxxxxxx"
                        className="w-full pl-14 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-2">Status Keanggotaan</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-muted/30 border border-border/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                      <option value="suspended">Ditangguhkan</option>
                    </select>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Address & Other */}
          <Card className="md:col-span-2 rounded-[2.5rem] border-none shadow-2xl shadow-black/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <h3 className="text-sm font-bold  tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <MapPin size={16} /> Alamat & Tambahan
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold  tracking-widest text-muted-foreground ml-2">Alamat Domisili</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-8 -translate-y-1/2 text-muted-foreground/40" size={18} />
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Masukkan alamat lengkap..."
                    className="w-full pl-14 pr-4 py-6 bg-muted/30 border border-border/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-end items-center">
           <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            className="w-full sm:w-auto px-10 py-7 font-bold text-muted-foreground hover:text-foreground rounded-2xl"
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-64 py-7 rounded-2xl font-black shadow-2xl shadow-primary/20 gap-3 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} className="group-hover:scale-110 transition-transform" />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
