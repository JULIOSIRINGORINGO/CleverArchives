import BookCard from "./BookCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface BookSectionProps {
  title: string;
  subtitle?: string;
  books: any[];
  viewAllHref?: string;
  loading?: boolean;
}

const BookSection = ({ title, subtitle, books, viewAllHref, loading }: BookSectionProps) => {
  const locale = useLocale();
  const t = useTranslations("Public");

  return (
    <section className="container mx-auto px-gr-4 py-gr-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gr-5 mb-gr-7">
        <div className="space-y-gr-3">
          <h2 className="text-gr-2xl md:text-gr-3xl font-black tracking-tighter leading-none">{title}</h2>
        </div>
        
        {viewAllHref && (
          <Link 
            href={`/${locale}${viewAllHref}`} 
            className="group flex items-center gap-gr-2 px-gr-5 py-gr-3 rounded-gr bg-primary text-white font-black text-gr-sm tracking-widest transition-all duration-500 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0"
          >
            {t("explore_all")} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gr-5 lg:gap-gr-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-gr overflow-hidden border">
              <div className="aspect-[3/4] bg-muted"></div>
              <div className="p-gr-5 space-y-gr-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : (
          books.map((book) => (
            <BookCard key={book.id} {...book} />
          ))
        )}
      </div>
    </section>
  );
};

export default BookSection;
