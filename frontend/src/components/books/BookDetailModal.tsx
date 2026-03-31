"use client";

import { 
  X, Hash, Calendar, Building2, 
  BookOpen, CheckCircle2, XCircle,
  ArrowUpRight, Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { motion } from "framer-motion";

interface BookDetailModalProps {
  book: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDetailModal({ book, isOpen, onClose }: BookDetailModalProps) {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  const { addItem } = useCart();

  if (!book) return null;

  const isAvailable = book.available_copies_count > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-[0_30px_100px_rgba(0,0,0,0.15)]">
      <div className="flex flex-col md:flex-row overflow-hidden max-h-[90vh] bg-background">
        {/* Left Side: Cover Image with Overlays */}
        <div className="w-full md:w-[42%] bg-muted relative aspect-[3.5/4] md:aspect-auto overflow-hidden group">
          <img 
            src={book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80"} 
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
             <div className="flex justify-between items-start">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white text-[10px] font-black tracking-widest shadow-xl">
                  {book.category?.name || t("uncategorized")}
                </span>
                <Button 
                  onClick={onClose} 
                  variant="ghost" 
                  className="w-10 h-10 p-0 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 md:hidden"
                >
                  <X size={20} />
                </Button>
             </div>
             
             <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1"
                >
                  <h2 className="text-white text-3xl font-black tracking-tighter leading-[1.1]">{book.title}</h2>
                  <p className="text-white/60 text-sm font-black tracking-widest">{book.author?.name || t("unknown_author")}</p>
                </motion.div>
                
                <div className="flex gap-2">
                   <div className={cn(
                     "px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-lg backdrop-blur-md",
                     isAvailable ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-300" : "bg-rose-500/20 border-rose-500/20 text-rose-300"
                   )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
                      <span className="text-[10px] font-black tracking-widest">
                        {isAvailable ? `${book.available_copies_count} ${t("available")}` : t("borrowed")}
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Detailed Metadata & Actions */}
        <div className="flex-1 flex flex-col min-h-0 bg-background relative shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
          {/* Header Action Button (Desktop Only) */}
          <div className="absolute top-6 right-6 z-10 hidden md:block">
            <Button 
              onClick={onClose} 
              variant="ghost" 
              className="w-10 h-10 p-0 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-border/20 text-muted-foreground transition-all active:scale-95"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <div className="space-y-10">
              {/* Info Matrix */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t("shelf"), value: book.shelf?.name || "A-12", icon: Hash },
                  { label: t("year"), value: book.published_year || "N/A", icon: Calendar },
                  { label: t("publisher"), value: book.publisher || "Stellar Press", icon: Building2 },
                  { label: "ISBN", value: book.isbn || "N/A", icon: BookOpen },
                ].map((detail, idx) => (
                  <motion.div 
                    key={detail.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="bg-muted/10 p-5 rounded-[2rem] border border-border/30 group hover:bg-muted/20 transition-all duration-300"
                  >
                    <div className="flex flex-col gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-border/10 flex items-center justify-center text-primary/60 group-hover:text-primary transition-colors">
                          <detail.icon size={18} strokeWidth={2.5} />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-muted-foreground/40 tracking-widest">{detail.label}</p>
                          <p className="font-black text-sm text-foreground/80 tracking-tight truncate">{detail.value}</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                 <div className="flex items-center gap-3 ml-1">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="text-[10px] font-black tracking-widest text-muted-foreground">{t("synopsis")}</h3>
                 </div>
                 <div className="p-6 bg-muted/[0.03] rounded-[2rem] border border-dashed border-border/60">
                    <p className="text-sm text-foreground/60 leading-relaxed font-black/10 italic">
                      {book.description || t("no_description")}
                    </p>
                 </div>
              </div>
            </div>
          </div>
 
          {/* Footer Actions */}
          <div className="p-8 border-t border-border/10 bg-muted/[0.02]">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button 
                  variant="ghost"
                  className="w-full sm:w-auto px-8 rounded-2xl h-14 font-black text-xs tracking-widest text-muted-foreground hover:bg-muted/20 transition-all"
                  onClick={onClose}
                >
                  {t("close")}
              </Button>
              <Link href={`/${locale}/catalog/${book.id}/copies`} className="w-full" onClick={onClose}>
                <Button 
                  className="w-full px-12 rounded-[1.75rem] h-14 text-xs font-black tracking-widest shadow-2xl shadow-primary/20 bg-primary group hover:scale-[1.02] active:scale-[0.98] transition-all border-none text-white"
                >
                  {t("details")} <ArrowUpRight size={20} strokeWidth={2.5} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
      `}</style>
    </Modal>
  );
}
