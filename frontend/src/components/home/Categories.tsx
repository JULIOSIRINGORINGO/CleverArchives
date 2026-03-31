"use client";

import { 
  Laptop, Microscope, History, 
  PenTool, GraduationCap, Shapes,
  ArrowRight, Book
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface CategoryData {
  id: number;
  name: string;
  books_count: number;
  slug?: string;
}

interface CategoriesProps {
  categories?: CategoryData[];
  loading?: boolean;
}

const ICON_MAP: Record<string, any> = {
  "technology": Laptop,
  "science": Microscope,
  "history": History,
  "literature": PenTool,
  "philosophy": Shapes,
  "education": GraduationCap,
};

const COLOR_MAP: Record<string, string> = {
  "technology": "from-blue-500 to-cyan-400 shadow-blue-500/20",
  "science": "from-emerald-500 to-teal-400 shadow-emerald-500/20",
  "history": "from-amber-500 to-orange-400 shadow-amber-500/20",
  "literature": "from-purple-500 to-fuchsia-400 shadow-purple-500/20",
  "philosophy": "from-rose-500 to-pink-400 shadow-rose-500/20",
  "education": "from-indigo-500 to-blue-500 shadow-indigo-500/20",
};

const Categories: React.FC<CategoriesProps> = ({ categories = [], loading }) => {
  const locale = useLocale();
  const t = useTranslations("Categories");

  const displayCategories = categories.length > 0 ? categories : [
    { name: t("technology"), key: "technology", icon: Laptop, color: "from-blue-500 to-cyan-400 shadow-blue-500/20" },
    { name: t("science"), key: "science", icon: Microscope, color: "from-emerald-500 to-teal-400 shadow-emerald-500/20" },
    { name: t("history"), key: "history", icon: History, color: "from-amber-500 to-orange-400 shadow-amber-500/20" },
    { name: t("literature"), key: "literature", icon: PenTool, color: "from-purple-500 to-fuchsia-400 shadow-purple-500/20" },
  ].map(c => ({ ...c, books_count: 0 }));

  return (
    <section className="bg-muted/10 py-gr-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[--color-primary]/5 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-gr-4 relative z-10">
        <div className="text-center mb-gr-7">
          <h2 className="text-gr-2xl md:text-gr-3xl font-black tracking-tighter mb-gr-4">{t("title")}</h2>
          <p className="text-muted-foreground text-gr-lg max-w-2xl mx-auto font-medium">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gr-4 lg:gap-gr-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[--color-muted] animate-pulse rounded-gr"></div>
            ))
          ) : (
            displayCategories.map((cat: any) => {
              const Icon = ICON_MAP[cat.name.toLowerCase()] || cat.icon || Book;
              const colorClasses = COLOR_MAP[cat.name.toLowerCase()] || cat.color || "from-slate-500 to-slate-400 shadow-slate-500/20";
              const countText = cat.books_count > 0 ? t("books_count", { count: cat.books_count.toLocaleString() }) : t("books_count", { count: "0" });

              return (
                <Link 
                  key={cat.id || cat.key} 
                  href={`/${locale}/books?category_id=${cat.id}`}
                  className="group"
                >
                  <div className="bg-[--color-surface]/50 backdrop-blur-xl rounded-gr p-gr-5 h-full flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-3 border border-[--color-border]/50 hover:border-[--color-text]/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[--color-primary] to-blue-600 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-10 transition-opacity duration-500"></div>
                    
                    <div className={`w-gr-7 h-gr-7 bg-gradient-to-br ${colorClasses} rounded-gr flex items-center justify-center text-white shadow-xl mb-gr-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10`}>
                      <Icon size={24} strokeWidth={2} />
                    </div>
                    
                    <h3 className="font-black text-gr-lg mb-gr-2 relative z-10 text-[--color-text] group-hover:text-[--color-primary] transition-colors">{cat.name}</h3>
                    <p className="text-gr-xs text-[--color-muted-foreground] font-bold tracking-widest relative z-10">{cat.books_count >= 1000 ? `${(cat.books_count / 1000).toFixed(1)}k+` : countText}</p>
                    
                    <div className="mt-gr-5 flex items-center justify-center w-12 h-12 rounded-full bg-[--color-primary]/5 text-[--color-primary] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 relative z-10">
                      <ArrowRight size={20} strokeWidth={2} />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
