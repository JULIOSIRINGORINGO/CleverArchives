"use client";

import { useState } from "react";
import { 
  CheckCircle2, AlertCircle, Loader2,
  ScanLine, Database, ArrowRight, BookOpen,
  ArrowLeftRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

// UI Components
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { StatCard } from "@/components/ui/StatCard";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Inline } from "@/components/ui/Inline";

export default function MemberBorrowPage() {
  const t = useTranslations("Borrow");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiService.borrowings.create({ 
        book_copy_barcode: barcode.trim() 
      });
      setSuccess(res);
      setBarcode("");
    } catch (err: any) {
      console.error("Borrow Error:", err);
      setError(err.message || t("error_failed") || "Failed to process borrowing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardPage
      title={t("title") || "Pinjam Buku"}
      icon={<ScanLine className="text-primary" size={22} />}
      subtitle={t("subtitle") || "Gunakan barcode buku untuk memproses peminjaman"}
    >
      <Stack spacing="xl" className="pb-24 max-w-5xl mx-auto pt-6">
        {/* Main Scanner Section */}
        <DashboardSection layout="full">
          <Card 
            variant="glow" 
            padding="none" 
            rounded="3xl" 
            className="overflow-hidden bg-card/40 backdrop-blur-xl border-primary/5 shadow-2xl shadow-primary/[0.02]"
          >
            <div className="p-8 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-30" />
              
              {!success ? (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                  <Stack spacing="lg">
                    <div className="relative group">
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-all duration-500 scale-110">
                        <ScanLine size={32} strokeWidth={2.5} />
                      </div>
                      <input 
                        type="text"
                        placeholder={t("input_placeholder") || "Scan atau masukkan barcode..."}
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        autoFocus
                        className="w-full pl-24 pr-8 py-10 bg-muted/20 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-[2.5rem] outline-none text-2xl placeholder:text-muted-foreground/30 transition-all shadow-inner tracking-tight font-bold"
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Inline spacing="md" className="p-6 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 shadow-sm">
                            <AlertCircle size={22} strokeWidth={2.5} />
                            <span className="text-xs font-black uppercase tracking-widest leading-relaxed">{error}</span>
                          </Inline>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Stack>

                  <Button 
                    type="submit" 
                    disabled={loading || !barcode.trim()}
                    className="w-full py-12 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-6 tracking-tight bg-primary text-white border-none"
                  >
                    {loading ? <Loader2 className="animate-spin" size={28} strokeWidth={3} /> : <CheckCircle2 size={28} strokeWidth={3} />}
                    {t("submit_btn") || "Proses Pinjam Sekarang"}
                  </Button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-10 py-6 relative z-10"
                >
                  <Box className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                    <CheckCircle2 size={56} strokeWidth={2.5} />
                  </Box>
                  
                  <Stack spacing="xs">
                    <h2 className="text-4xl font-black text-foreground tracking-tighter">{t("success_title") || "Berhasil Dipinjam!"}</h2>
                    <p className="text-xs font-black text-muted-foreground/50 tracking-widest italic">{t("success_desc") || "Buku telah terdaftar dalam akun Anda."}</p>
                  </Stack>
                  
                  <Card padding="lg" variant="default" rounded="3xl" className="border-emerald-100 bg-emerald-50/20 max-w-md mx-auto shadow-inner">
                    <Inline spacing="lg" align="center" className="text-left">
                      <Box className="w-20 aspect-[3/4] bg-card rounded-2xl shadow-xl shrink-0 overflow-hidden border border-border/20">
                        {success.book_copy?.book?.cover_url ? (
                          <img src={success.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Box className="w-full h-full flex items-center justify-center text-muted-foreground/10"><BookOpen size={32} /></Box>
                        )}
                      </Box>
                      <Stack spacing="xs" className="min-w-0">
                        <p className="font-black truncate text-lg tracking-tight leading-tight">{success.book_copy?.book?.title || "Buku"}</p>
                        <Inline spacing="xs" align="center">
                          <code className="text-[10px] font-black text-primary tracking-widest italic opacity-60">ID: {success.book_copy?.barcode}</code>
                        </Inline>
                      </Stack>
                    </Inline>
                  </Card>

                  <Inline spacing="md" justify="center" className="pt-6">
                    <Button 
                      variant="ghost" 
                      className="px-10 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest text-muted-foreground hover:bg-muted/30 transition-all" 
                      onClick={() => setSuccess(null)}
                    >
                       {t("borrow_another") || "Pinjam Lagi"}
                    </Button>
                    <Button 
                      className="px-10 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/20 bg-primary text-white gap-4 hover:scale-105 active:scale-95 transition-all" 
                      onClick={() => router.push(`/${locale}/borrowed`)}
                    >
                       {t("view_status") || "Lihat Status"} <ArrowRight size={18} strokeWidth={3} />
                    </Button>
                  </Inline>
                </motion.div>
              )}
            </div>
          </Card>
        </DashboardSection>

        {/* Info Section */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard
            variant="blue"
            icon={Database}
            title={t("barcode_info_title") || "Informasi Barcode"}
            trend={t("barcode_info_desc") || "Barcode terletak di sisi belakang atau halaman pertama buku."}
            value="Info"
          />
          <StatCard
            variant="indigo"
            icon={ArrowLeftRight}
            title={t("next_step_title") || "Langkah Selanjutnya"}
            trend={t("next_step_desc") || "Buku harus dikembalikan sesuai tanggal jatuh tempo yang tertera."}
            value="Info"
          />
        </Box>
      </Stack>
    </DashboardPage>
  );
}
