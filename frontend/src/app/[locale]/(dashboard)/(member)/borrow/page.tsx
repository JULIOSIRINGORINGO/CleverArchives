"use client";

import { useState } from "react";
import { 
  ArrowLeftRight, Search, BookOpen, 
  CheckCircle2, AlertCircle, Loader2,
  ScanLine, Database, ArrowRight, CornerUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

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
      console.error(err);
      setError(err.message || t("error_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-700 overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 pt-10 pb-6 border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-20 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <ScanLine size={28} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 italic leading-none">{t("subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
        <div className="max-w-4xl mx-auto space-y-10">
          <Card className="bg-card/50 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 shadow-[0_20px_80px_rgba(0,0,0,0.05)] border border-border/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-30" />
            
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="relative group">
                   <div className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-all duration-500 scale-110">
                      <ScanLine size={36} strokeWidth={2.5} />
                   </div>
                   <input 
                     type="text"
                     placeholder={t("input_placeholder")}
                     value={barcode}
                     onChange={(e) => setBarcode(e.target.value)}
                     autoFocus
                     className="w-full pl-24 pr-8 py-10 bg-muted/20 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-[2.5rem] outline-none text-2xl placeholder:text-muted-foreground/20 transition-all shadow-inner tracking-tight"
                   />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-6 bg-rose-50 text-rose-600 rounded-3xl flex items-center gap-4 text-sm font-medium border border-rose-100 shadow-sm animate-in shake-in duration-500"
                    >
                      <AlertCircle size={22} strokeWidth={2.5} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  type="submit" 
                  disabled={loading || !barcode.trim()}
                  className="w-full py-12 rounded-[2rem] font-bold text-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-6 tracking-tight border-none bg-primary text-white"
                >
                  {loading ? <Loader2 className="animate-spin" size={28} strokeWidth={2.5} /> : <CheckCircle2 size={28} strokeWidth={2.5} />}
                  {t("submit_btn")}
                </Button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-10 py-6 relative z-10"
              >
                 <div className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                    <CheckCircle2 size={56} strokeWidth={2.5} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-bold text-foreground tracking-tight">{t("success_title")}</h2>
                    <p className="text-sm font-bold text-muted-foreground/50 tracking-widest italic">{t("success_desc")}</p>
                 </div>
                 
                 <Card className="rounded-[2.5rem] border border-border/30 bg-muted/20 p-8 max-w-md mx-auto overflow-hidden shadow-inner">
                    <div className="flex items-center gap-6 text-left">
                       <div className="w-20 aspect-[3/4] bg-card rounded-2xl shadow-xl shrink-0 overflow-hidden border border-border/20">
                          {success.book_copy?.book?.cover_url ? (
                            <img src={success.book_copy.book.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/10"><BookOpen size={32} /></div>
                          )}
                       </div>
                       <div className="min-w-0 space-y-1">
                          <p className="font-bold truncate text-lg tracking-tight leading-tight">{success.book_copy?.book?.title || "Buku"}</p>
                          <p className="text-[10px] font-bold text-primary tracking-widest italic opacity-60">Barcode: {success.book_copy?.barcode}</p>
                       </div>
                    </div>
                 </Card>

                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button 
                      variant="ghost" 
                      className="px-10 h-14 rounded-2xl font-bold text-xs tracking-widest text-muted-foreground hover:bg-muted/30 transition-all border-none" 
                      onClick={() => setSuccess(null)}
                    >
                       {t("borrow_another")}
                    </Button>
                    <Button 
                      className="px-10 h-14 rounded-2xl font-bold text-xs tracking-widest shadow-2xl shadow-primary/20 bg-primary text-white border-none transition-all hover:scale-105 active:scale-95 gap-3" 
                      onClick={() => router.push(`/${locale}/borrowings`)}
                    >
                       {t("view_status")} <ArrowRight size={18} strokeWidth={2.5} />
                    </Button>
                 </div>
              </motion.div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
               <Card className="rounded-[2.5rem] border border-border/30 bg-card/10 p-10 hover:shadow-xl transition-all h-full">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-3 tracking-tight">
                     <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                       <Database size={20} strokeWidth={2.5} />
                     </div>
                     {t("barcode_info_title")}
                  </h3>
                  <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed tracking-tight italic">
                     {t("barcode_info_desc")}
                  </p>
               </Card>
             </motion.div>

             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
               <Card className="rounded-[2.5rem] border border-border/30 bg-card/10 p-10 hover:shadow-xl transition-all h-full">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-3 tracking-tight">
                     <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                       <ArrowLeftRight size={20} strokeWidth={2.5} />
                     </div>
                     {t("next_step_title")}
                  </h3>
                  <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed tracking-tight italic">
                     {t("next_step_desc")}
                  </p>
               </Card>
             </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
