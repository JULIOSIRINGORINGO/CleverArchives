"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, BookOpen, ShoppingCart, 
  CheckCircle2, XCircle, FileText, 
  Calendar, Hash, Building2, User, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function BookDetail() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/books/${id}`, {
          headers: {
            'X-Tenant-Slug': 'stellar'
          }
        });
        const data = await response.json();
        setBook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="aspect-[3/4] bg-muted rounded-3xl"></div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-12 w-3/4 bg-muted rounded"></div>
            <div className="h-6 w-1/2 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-2/3 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Book not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isAvailable = book.available_copies_count > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button 
        variant="ghost" 
        className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ChevronLeft size={18} /> Back to Library
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src={book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80"} 
              alt={book.title}
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}?login=true`} className="w-full">
              <Button size="lg" className="w-full h-14 rounded-2xl font-bold bg-muted hover:bg-muted/80 text-foreground shadow-none">
                {t("sign_in_to_borrow")}
              </Button>
            </Link>
            {book.ebook && (
              <Link href={`/${locale}/books/${book.id}/preview`} className="w-full">
                <Button variant="outline" className="w-full rounded-2xl py-7 text-lg font-bold gap-3">
                  <FileText size={22} /> Preview Ebook
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wider ${
                isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {isAvailable ? "Available" : "Checked Out"}
              </span>
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-wider">
                {book.category?.name || "Uncategorized"}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-tight">{book.title}</h1>
            <p className="text-2xl text-muted-foreground mt-2 font-medium">by {book.author?.name || "Unknown Author"}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "ISBN", value: book.isbn || "N/A", icon: Hash },
              { label: "Year", value: book.published_year || "N/A", icon: Calendar },
              { label: "Publisher", value: book.publisher || "Stellar Press", icon: Building2 },
              { label: "Language", value: "English", icon: BookOpen },
            ].map((detail) => (
              <div key={detail.label} className="bg-white p-4 rounded-2xl border border-muted shadow-sm flex flex-col items-center text-center">
                <detail.icon size={20} className="text-primary mb-2" />
                <span className="text-xs font-bold text-muted-foreground tracking-widest">{detail.label}</span>
                <span className="font-bold text-sm mt-1">{detail.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">About this book</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {book.description || "No description available for this title."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
