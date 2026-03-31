import { ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { useLocale } from "next-intl";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_url: string;
  available: boolean;
  rating?: number;
}

const BookCard = ({ id, title, author, category, cover_url, available, rating = 4.5 }: BookCardProps) => {
  const locale = useLocale();

  return (
    <Card className="group border border-[--color-border]/40 shadow-sm hover:shadow-2xl dark:shadow-none transition-all duration-500 bg-[--color-surface] overflow-hidden rounded-gr flex flex-col h-full hover:-translate-y-3">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted/20">
        <img 
          src={cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        <div className="absolute top-gr-3 left-gr-3">
          <span className="bg-[--color-surface]/80 backdrop-blur-xl text-[--color-primary] text-gr-xs font-black px-gr-4 py-gr-2 rounded-full tracking-[0.2em] shadow-xl border border-[--color-border]/20">
            {category}
          </span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-gr-5">
          <Link href={`/${locale}/books/${id}`} className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <Button className="w-full rounded-gr h-12 font-black text-gr-sm gap-gr-2 bg-[--color-primary] hover:bg-white hover:text-[--color-primary] transition-all duration-300 group/btn shadow-2xl">
              VIEW DETAILS <ArrowUpRight size={18} strokeWidth={2} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
      
      <CardContent className="p-gr-5 flex-1 flex flex-col justify-between relative bg-gradient-to-b from-transparent to-muted/5">
        <div className="space-y-gr-3">
          <div className="flex items-center gap-gr-2 mb-gr-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} fill={s <= Math.floor(rating) ? "#f59e0b" : "none"} className={s <= Math.floor(rating) ? "text-amber-500" : "text-muted-foreground/30"} />
              ))}
            </div>
            <span className="text-gr-xs font-black text-[--color-muted-foreground]/60">{rating}</span>
          </div>
          <h3 className="font-black text-gr-xl leading-[1.2] tracking-tight line-clamp-2 group-hover:text-[--color-primary] transition-colors duration-500 text-[--color-text]">
            {title}
          </h3>
          <p className="text-gr-sm text-[--color-muted-foreground] font-bold tracking-wider opacity-70 italic">{author}</p>
        </div>
        
        <div className="mt-gr-5 pt-gr-4 border-t border-[--color-border]/40 flex items-center justify-between">
          <div className="flex items-center gap-gr-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${available ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
            <span className={`text-gr-xs font-black tracking-widest ${
              available ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}>
              {available ? "Available" : "Checked Out"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
