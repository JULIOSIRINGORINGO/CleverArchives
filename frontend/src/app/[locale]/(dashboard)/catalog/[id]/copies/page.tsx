"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { 
  Book as BookIcon, 
  ArrowLeft, 
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Info,
  ScanLine,
  ShoppingBag,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/contexts/CartContext";

interface Book {
  id: number;
  title: string;
  isbn: string;
  description: string;
  published_year: number;
  author?: { name: string };
  category?: { name: string };
  cover_url?: string;
  available_copies_count: number;
  copies_count: number;
}

interface Copy {
  id: number;
  barcode: string;
  status: string;
  display_status: string;
  shelf_location?: string;
}

export default function MemberBookCopiesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Catalog");
  const { addItem } = useCart();
  
  const [book, setBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedBarcode, setAddedBarcode] = useState<string | null>(null);

  const handleAddToCart = (copy: Copy) => {
    if (!book || copy.status !== 'available') return;
    
    const success = addItem({
      id: book.id,
      title: book.title,
      author: book.author?.name || t("unknown_author"),
      cover_url: book.cover_url,
      copy_id: copy.id,
      barcode: copy.barcode
    });

    if (success) {
      setAddedBarcode(copy.barcode);
      setTimeout(() => {
        router.push(`/${locale}/cart`);
      }, 800);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, copiesRes] = await Promise.all([
          apiService.books.get(params.id as string),
          apiService.books.getCopies(params.id as string)
        ]);
        setBook(bookRes);
        setCopies(copiesRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-x-0 -bottom-12 flex justify-center">
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
        <p className="text-xs font-black tracking-widest text-muted-foreground animate-pulse mt-4">
          {t("loading_copies")}
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-8 animate-in fade-in">
        <div className="w-24 h-24 rounded-[2rem] bg-rose-50 flex items-center justify-center shadow-xl shadow-rose-100/50">
           <XCircle size={48} className="text-rose-500" />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black tracking-tight">{t("book_not_found")}</h2>
           <p className="text-sm font-bold text-muted-foreground opacity-60">Silakan periksa kembali parameter pencarian Anda.</p>
        </div>
        <Button onClick={() => router.push(`/${locale}/catalog`)} variant="outline" className="rounded-2xl h-12 px-8 font-black text-xs tracking-widest gap-2 shadow-sm border-border/50">
          <ArrowLeft size={16} /> {t("back_to_catalog")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-700 overflow-hidden">
      {/* Dynamic Hero Header */}
      <div className="flex-shrink-0 pt-10 pb-4">
         <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black tracking-tighter text-foreground line-clamp-1">{book.title}</h1>
              <p className="text-xs font-black tracking-widest text-muted-foreground/60">{book.author?.name || t("unknown_author")}</p>
            </div>
         </div>

         <Card className="bg-card border border-border/40 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden transition-all hover:shadow-[0_25px_80px_rgba(0,0,0,0.06)] border-white/50 relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
           <CardContent className="p-0">
             <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border/20">
               {/* Left: Cover */}
               <div className="lg:w-72 h-80 lg:h-auto relative shrink-0">
                 {book.cover_url ? (
                   <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                 ) : (
                   <div className="absolute inset-0 bg-muted/40 flex flex-col items-center justify-center text-muted-foreground/10">
                     <BookIcon size={80} strokeWidth={1} />
                     <span className="text-[10px] font-black tracking-widest mt-6">{t("no_cover_label")}</span>
                   </div>
                 )}
               </div>

               {/* Right: Detailed Info */}
               <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                   <div className="space-y-6">
                     <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20 tracking-widest">
                          {book.category?.name || "Umum"}
                        </span>
                        <span className="px-4 py-1.5 bg-muted/40 text-muted-foreground text-[10px] font-black rounded-full border border-border/30 tracking-widest">
                          {t("published_year_label")} {book.published_year || "-"}
                        </span>
                     </div>
                     <div className="p-6 bg-muted/[0.03] rounded-3xl border border-border/30 shadow-inner">
                        <p className="text-[10px] font-black text-muted-foreground/40 tracking-widest mb-3">{t("availability_status")}</p>
                        <div className="flex items-end gap-3 mb-4">
                           <span className="text-4xl font-black tracking-tighter text-foreground">{book.available_copies_count}</span>
                           <span className="text-base font-black text-muted-foreground/40 mb-1 tracking-widest">{t("copies_unit")} / {book.copies_count}</span>
                        </div>
                        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(book.available_copies_count / book.copies_count) * 100}%` }}
                             className={cn("h-full transition-all duration-1000", book.available_copies_count > 0 ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-rose-500")}
                           />
                        </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-2 p-5 bg-card border border-border/30 rounded-2xl shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground"><Info size={16}/></div>
                            <span className="text-[10px] font-black tracking-widest text-muted-foreground/60">{t("isbn_code")}</span>
                         </div>
                         <p className="text-sm font-black font-mono ml-11 text-foreground/80 tracking-tight">{book.isbn || "N/A"}</p>
                      </div>
                      <div className="flex flex-col gap-2 p-5 bg-card border border-border/30 rounded-2xl shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground"><Layers size={16}/></div>
                            <span className="text-[10px] font-black tracking-widest text-muted-foreground/60">{t("registered_stock")}</span>
                         </div>
                         <p className="text-sm font-black ml-11 text-foreground/80 tracking-tight">{book.copies_count} {t("copies_unit_alt")}</p>
                      </div>
                   </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center justify-between mt-10 pt-8 border-t border-border/10 gap-6">
                    <p className="text-[11px] font-black text-muted-foreground/30 tracking-widest max-w-md italic">Aset fisik ini dikelola secara digital melalui modul Smart Inventory.</p>
                    <Button 
                      onClick={() => router.push(`/${locale}/borrow`)}
                      className="w-full sm:w-auto rounded-[1.5rem] px-10 h-14 font-black text-xs shadow-2xl shadow-primary/20 gap-3 bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all border-none text-white tracking-widest"
                    >
                      <ScanLine size={20} strokeWidth={2.5} /> {t("borrow_btn")}
                    </Button>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
      </div>

      {/* Grid of Copies */}
      <div className="flex-1 flex flex-col min-h-0 space-y-8 mt-10 overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-2">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                 <Layers size={24} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter">{t("copies_list_title")}</h2>
                <p className="text-[10px] font-black text-muted-foreground/50 tracking-widest italic">{t("copies_list_subtitle")}</p>
              </div>
           </div>
           <div className="px-6 py-2.5 bg-muted/30 rounded-full border border-border/20 flex items-center gap-4 shadow-inner">
              <span className="text-[10px] font-black text-muted-foreground/40 tracking-widest">{t("total_copies_label")}:</span>
              <span className="text-xs font-black text-primary tracking-tighter px-3 py-1 bg-white rounded-full shadow-sm">{copies.length} {t("item_unit")}</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-1 grid grid-cols-1 gap-4 content-start pb-20">
           <AnimatePresence mode="popLayout">
               {copies.map((copy, index) => {
                  const isAvailable = copy.status === 'available';
                  const justAdded = addedBarcode === copy.barcode;
                  return (
                  <motion.div 
                    key={copy.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                     <Card 
                       onClick={() => isAvailable && handleAddToCart(copy)}
                       className={cn(
                         "rounded-[2rem] border border-border/30 bg-card overflow-hidden shadow-sm transition-all duration-300 relative group",
                         justAdded ? "ring-2 ring-emerald-500 bg-emerald-50/10 shadow-lg shadow-emerald-500/10" : 
                         !isAvailable ? "opacity-50 grayscale border-dashed" : "cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
                       )}
                     >
                        <CardContent className="p-0 flex items-center h-20">
                           <div className={cn(
                             "w-2 h-full shrink-0 transition-colors duration-500",
                             copy.status === 'available' ? 'bg-emerald-500 group-hover:bg-primary' :
                             copy.status === 'borrowed' ? 'bg-amber-500' : 'bg-rose-500'
                           )} />
                           
                           <div className="flex-1 flex items-center justify-between px-8 gap-10">
                              <div className="flex items-center gap-6 min-w-[220px]">
                                 <div className={cn(
                                   "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                                   justAdded ? 'bg-emerald-100 border-emerald-500 text-emerald-600' :
                                   copy.status === 'available' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-emerald-100/50' :
                                   copy.status === 'borrowed' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                   'bg-rose-50 border-rose-200 text-rose-600'
                                 )}>
                                    {justAdded ? <ShoppingBag size={22} className="animate-bounce" /> :
                                     copy.status === 'available' ? <CheckCircle2 size={22} strokeWidth={2.5} /> : 
                                     copy.status === 'borrowed' ? <Clock size={22} strokeWidth={2.5} /> : <XCircle size={22} strokeWidth={2.5} />}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className={cn(
                                       "text-[10px] font-black tracking-widest mb-0.5",
                                       copy.status === 'available' ? 'text-emerald-600' :
                                       copy.status === 'borrowed' ? 'text-amber-600' : 'text-rose-600'
                                    )}>
                                       {copy.display_status}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-black tracking-tight opacity-40">{t("copy_status_label")}</span>
                                 </div>
                              </div>

                              <div className="flex-1 flex flex-col items-start min-w-[200px]">
                                 <p className="text-[10px] font-black text-muted-foreground/30 tracking-widest mb-1 italic leading-none">{t("asset_barcode")}</p>
                                 <code className="text-lg font-black text-primary p-0 leading-none tracking-tighter group-hover:tracking-normal transition-all duration-500">{copy.barcode}</code>
                              </div>

                              <div className="flex items-center gap-4 min-w-[180px]">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20 shrink-0" />
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-muted-foreground/30 tracking-widest mb-1 italic leading-none">{t("location")}</span>
                                    <span className="text-xs font-black text-foreground tracking-tight">{copy.shelf_location || "N/A"}</span>
                                 </div>
                              </div>

                              <div className="flex items-center gap-6">
                                 {isAvailable && (
                                    <span className="text-[10px] font-black tracking-widest text-emerald-600/40 italic hidden xl:block animate-in fade-in slide-in-from-right-2">{t("available_to_borrow")}</span>
                                 )}
                                 <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                   justAdded ? 'bg-emerald-500 text-white shadow-lg' :
                                   isAvailable ? 'bg-muted/50 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg shadow-primary/20' : 'bg-muted/10 text-muted-foreground/30'
                                 )}>
                                    {justAdded ? <CheckCircle2 size={20} strokeWidth={2.5} /> :
                                     isAvailable ? <ShoppingBag size={20} strokeWidth={2.5} /> : <ChevronRight size={20} />}
                                 </div>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </motion.div>
                  );
               })}
           </AnimatePresence>

           {copies.length === 0 && (
              <div className="py-32 text-center bg-muted/[0.03] rounded-[3rem] border-2 border-dashed border-border/40 flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                 <div className="w-20 h-20 bg-muted/20 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                   <Layers size={40} className="text-muted-foreground/10" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-black tracking-widest opacity-30">{t("no_copies")}</p>
                    <p className="text-[10px] text-muted-foreground/20 font-black tracking-widest italic">Silakan hubungi administrator perpustakaan.</p>
                 </div>
              </div>
           )}

           {/* Large Action Banner */}
           <div className="mt-10 relative group overflow-hidden rounded-[3.5rem] px-10 py-12 border border-primary/20 shadow-2xl shadow-primary/5 bg-card transition-all hover:border-primary/40">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-indigo-500/[0.02] to-transparent"></div>
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-all duration-1000"></div>
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                 <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-primary/10 shadow-xl shadow-primary/5 group-hover:scale-110 transition-transform duration-700">
                    <ScanLine size={48} className="text-primary" strokeWidth={2} />
                 </div>
                 <div className="flex-1 text-center md:text-left space-y-3">
                    <h4 className="font-black text-3xl text-foreground tracking-tighter">{t("ready_to_borrow_title")}</h4>
                    <p className="text-xs text-muted-foreground font-black tracking-widest leading-relaxed max-w-3xl italic opacity-50">
                       {t("ready_to_borrow_desc")}
                    </p>
                 </div>
                 <Button 
                   onClick={() => router.push(`/${locale}/borrow`)} 
                   className="w-full md:w-auto h-16 rounded-[1.75rem] px-10 font-black text-xs shadow-2xl shadow-primary/20 bg-primary hover:scale-[1.05] active:scale-[0.98] transition-all border-none text-white tracking-widest whitespace-nowrap"
                 >
                    {t("open_scanner")}
                 </Button>
              </div>
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
