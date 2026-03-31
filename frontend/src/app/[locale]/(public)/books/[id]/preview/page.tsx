"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useLocale } from "next-intl";
import { apiService } from "@/services/api";

export default function EbookPreview() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    apiService.books.get(id as string)
      .then(data => setBook(data))
      .catch(err => console.error("Failed to fetch book:", err));
  }, [id]);

  if (!book) return <div className="p-20 text-center animate-pulse">Loading preview...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-700">
      <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
        <ChevronLeft size={18} className="mr-2" /> Back to Book
      </Button>

      <div className="bg-white rounded-3xl border shadow-xl overflow-hidden flex flex-col items-center justify-center p-12 text-center min-h-[500px] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-muted/20 z-0"></div>
        
        <div className="relative z-10 w-full max-w-xl">
          <div className="text-sm font-bold tracking-widest text-primary mb-4">Ebook Preview Extract</div>
          <h1 className="text-3xl font-black mb-6 font-serif leading-tight">{book.title}</h1>
          
          <div className="prose prose-lg mx-auto text-muted-foreground mb-12 italic text-left relative">
            <div className="absolute -left-6 -top-4 text-6xl text-primary/20">&quot;</div>
            <p>
              This is a digital preview snippet of the ebook&apos;s first chapter. 
              The full text for {book.title} by {book.author?.name || "Unknown Author"} is securely stored in our library archives.
              To continue reading this fascinating journey, please become a member of our library community.
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border p-8 rounded-2xl">
            <Lock size={40} className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Unlock Full Access</h3>
            <p className="text-muted-foreground mb-6">You&apos;ve reached the end of this preview. Join the library to read the complete ebook instantly.</p>
            <Link href={`/${locale}?login=true`}>
              <Button size="lg" className="rounded-xl px-12 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
                Login to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
