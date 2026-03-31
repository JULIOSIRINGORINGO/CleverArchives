"use client";

import { useState } from "react";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface HeroProps {
  tenant?: any;
}

const Hero = ({ tenant }: HeroProps) => {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Index");
  const [query, setQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/books?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/${locale}/books`);
    }
  };

  return (
    <section className="relative pt-gr-7 pb-gr-8 md:pt-gr-8 md:pb-[14.4rem] overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/20 blur-[150px] rounded-full"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-gr-4 text-center relative z-10">
        <div className="inline-flex items-center gap-gr-2 px-gr-4 py-gr-2 rounded-full bg-[--color-primary]/10 border border-[--color-primary]/20 text-[--color-primary] text-gr-xs font-bold tracking-widest mb-gr-5 animate-in fade-in slide-in-from-bottom-3 duration-500 shadow-lg shadow-[--color-primary]/5 hover:bg-[--color-primary]/15 transition-colors cursor-default">
          <Sparkles size={14} strokeWidth={2} className="animate-pulse text-indigo-500" />
          {t("hero_badge")}
        </div>
        
        <h1 className="text-gr-2xl md:text-gr-3xl lg:text-[6.8rem] font-black tracking-tighter leading-[1.05] mb-gr-5 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
          {tenant ? (
            <>
              Welcome to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] via-blue-500 to-purple-600 drop-shadow-sm">{tenant.name}</span>
            </>
          ) : (
            <>
              {t("hero_title")} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] via-blue-500 to-purple-600 drop-shadow-sm">{t("hero_title_gradient")}</span>
            </>
          )}
        </h1>
        

        <form onSubmit={handleSearch} className="max-w-4xl mx-auto p-gr-2 bg-[--color-surface]/40 backdrop-blur-2xl border border-[--color-border]/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2.6rem] flex flex-col md:flex-row gap-gr-3 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex-1 relative group">
            <Search className="absolute left-gr-4 top-1/2 -translate-y-1/2 text-[--color-muted-foreground]/60 group-focus-within:text-[--color-primary] transition-colors" size={24} strokeWidth={2} />
            <Input 
              className="h-14 border-none shadow-none focus-visible:ring-0 pl-gr-7 text-gr-lg rounded-gr w-full bg-transparent placeholder:text-[--color-muted-foreground]/50 transition-all font-medium text-[--color-text]" 
              placeholder={t("search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-gr-6 rounded-gr font-black text-gr-base bg-gradient-to-r from-[--color-primary] to-blue-600 hover:from-[--color-primary]/90 hover:to-blue-600/90 text-white shadow-xl shadow-[--color-primary]/25 flex gap-gr-2 items-center group w-full md:w-auto transition-all hover:scale-[1.02] active:scale-[0.98]">
            {t("browse_books")}
            <ArrowRight size={20} strokeWidth={2} className="group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
