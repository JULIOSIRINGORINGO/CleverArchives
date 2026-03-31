import { Tablet, Sparkles, Zap, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const EbookHighlight = () => {
  const locale = useLocale();
  const t = useTranslations("Ebook");

  return (
    <section className="container mx-auto px-gr-4 py-gr-8">
      <div className="relative overflow-hidden rounded-gr bg-[--color-surface] text-[--color-text] min-h-[600px] flex items-center shadow-2xl shadow-[--color-primary]/10 border border-[--color-border]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[--color-primary]/30 via-[--color-primary]/5 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gr-6 relative z-10 p-gr-5 md:p-gr-7">
          <div className="space-y-gr-5">
            <div className="inline-flex items-center gap-gr-2 px-gr-4 py-gr-2 rounded-full bg-[--color-muted] backdrop-blur-md border border-[--color-border]/50 text-[--color-text] text-gr-sm font-bold tracking-widest shadow-xl">
              <Sparkles size={16} strokeWidth={2} className="text-blue-400 animate-pulse" /> {t("badge")}
            </div>
            
            <h2 className="text-gr-2xl md:text-gr-3xl font-black tracking-tighter leading-[1.1] text-[--color-text]">
              {t("title")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic font-serif pr-2">{t("title_italic")}</span>
            </h2>
            
            
            <div className="space-y-gr-4">
              {[
                { icon: Zap, text: t("feature_1") },
                { icon: Tablet, text: t("feature_2") },
                { icon: Smartphone, text: t("feature_3") },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-gr-3 text-[--color-text]/80 font-semibold text-gr-lg">
                  <div className="w-gr-4 h-gr-4 rounded-full bg-[--color-muted] flex items-center justify-center text-blue-400 shrink-0">
                    <item.icon size={16} strokeWidth={2} />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>

            <Link href={`/${locale}/books?filter=ebook`} className="inline-block mt-gr-4">
              <Button size="lg" className="h-14 px-gr-6 rounded-gr font-black text-gr-base bg-[--color-primary] text-white hover:opacity-90 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.3)] hover:scale-105 transition-all duration-300">
                {t("cta")}
              </Button>
            </Link>
          </div>

          <div className="relative hidden lg:flex items-center justify-center mt-gr-5 lg:mt-0">
             <div className="w-full h-full relative group perspective-1000">
                {/* Visual representation of an ebook reader/tablet */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[520px] bg-slate-900 border-[14px] border-slate-800 rounded-gr shadow-[0_20px_50px_rgb(0,0,0,0.5)] rotate-y-6 rotate-z-3 group-hover:rotate-y-0 group-hover:rotate-z-0 transition-transform duration-700 ease-out z-20">
                  <div className="absolute top-gr-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[--color-border] rounded-full"></div>
                  <div className="absolute bottom-gr-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[--color-border]/50 rounded-full"></div>
                  <div className="w-full h-full p-gr-3 overflow-hidden rounded-gr">
                    <div className="w-full h-full bg-[#f8fafc] dark:bg-slate-100 relative overflow-hidden rounded-gr p-gr-4 text-slate-900 space-y-gr-4 font-serif pt-gr-6">
                      <div className="absolute top-0 right-0 w-gr-6 h-gr-6 bg-gradient-to-bl from-slate-200/50 to-transparent"></div>
                      <div className="h-gr-4 bg-slate-300 rounded-gr w-3/4 mb-gr-6"></div>
                      <div className="space-y-gr-2">
                        <div className="h-4 bg-slate-200 rounded-gr w-full"></div>
                        <div className="h-4 bg-slate-200 rounded-gr w-[90%]"></div>
                        <div className="h-4 bg-slate-200 rounded-gr w-[95%]"></div>
                        <div className="h-4 bg-slate-200 rounded-gr w-[80%]"></div>
                      </div>
                      <div className="space-y-gr-2 mt-gr-5">
                        <div className="h-4 bg-slate-200 rounded-gr w-full"></div>
                        <div className="h-4 bg-slate-200 rounded-gr w-[85%]"></div>
                      </div>
                      <div className="h-[180px] bg-gradient-to-br from-slate-200 to-slate-300 rounded-gr w-full mt-gr-5 flex items-center justify-center">
                        <div className="w-gr-5 h-gr-5 rounded-full bg-white/50 flex items-center justify-center">
                          <div className="w-gr-3 h-gr-3 rounded-sm bg-slate-400/50 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floats */}
                <div className="absolute top-[10%] left-[5%] w-28 h-36 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-gr shadow-2xl -rotate-12 animate-[float_6s_ease-in-out_infinite] z-30 opacity-90 backdrop-blur-3xl border border-white/20 flex items-center justify-center hover:scale-110 transition-transform">
                    <div className="w-12 h-2 bg-white/30 rounded-full absolute top-6"></div>
                    <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
                </div>
                <div className="absolute bottom-[10%] right-[5%] w-36 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-gr shadow-2xl rotate-12 animate-[float_8s_ease-in-out_infinite_reverse] z-10 opacity-80 backdrop-blur-3xl border border-white/20 hover:scale-110 transition-transform"></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EbookHighlight;
