"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/home/Hero";
import BookSection from "@/components/home/BookSection";
import Categories from "@/components/home/Categories";
import EbookHighlight from "@/components/home/EbookHighlight";
import TenantFinder from "@/components/home/TenantFinder";
import { apiService } from "@/services/api";
import { useTranslations } from "next-intl";

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80",
  "https://images.unsplash.com/photo-1614728263952-84ea206f99b6?w=500&q=80",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&q=80",
  "https://images.unsplash.com/photo-1589998059171-988d887df64e?w=500&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80",
  "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=500&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
];

function mapBookToCard(book: any, index: number) {
  return {
    id: String(book.id),
    title: book.title,
    author: book.author?.name || "Unknown Author",
    category: book.category?.name || "Uncategorized",
    cover_url: COVER_IMAGES[index % COVER_IMAGES.length],
    available: book.available_copies_count > 0,
    rating: (4.5 + (index % 5) * 0.1).toFixed(1),
  };
}



export default function PublicLandingPage() {
  const t = useTranslations();
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMainDomain, setIsMainDomain] = useState(true);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    // Subdomain detection
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const isSub = parts.length > 2 && !['www', 'api', 'localhost'].includes(parts[0]);
    const sub = isSub ? parts[0] : null;
    setIsMainDomain(!isSub);

    const fetchData = async () => {
      try {
        const fetchPromises: Promise<any>[] = [
          apiService.books.list(),
          apiService.books.getLibraryStats(),
          apiService.categories.list()
        ];
        
        if (sub) {
          fetchPromises.push(apiService.tenants.publicFind(sub));
        }

        const [booksData, statsData, categoriesData, tenantData] = await Promise.all(fetchPromises);
        
        if (Array.isArray(booksData)) {
          setFeaturedBooks(booksData.slice(0, 4).map(mapBookToCard));
          setPopularBooks(booksData.slice(4, 8).map((b: any, i: number) => mapBookToCard(b, i + 4)));
        }
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
        setStats(statsData);
        if (tenantData) {
          setTenant(tenantData);
        }
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isSub) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  if (isMainDomain && !loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <TenantFinder />
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-1000">
      <Hero tenant={tenant} />
      
      <BookSection 
        title={t("Public.featured_books")} 
        subtitle={t("Public.featured_subtitle")}
        books={featuredBooks}
        viewAllHref="/books"
        loading={loading}
      />
      
      <Categories categories={categories} loading={loading} />
      
      <BookSection 
        title={t("Public.most_popular")} 
        subtitle={t("Public.popular_subtitle")}
        books={popularBooks}
        viewAllHref="/books?sort=popular"
        loading={loading}
      />
      
      <EbookHighlight />
      
      <section className="container mx-auto px-gr-4 py-gr-7 border-t border-muted">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-gr-6 text-center">
            <div>
               <h3 className="text-gr-2xl font-black text-primary mb-gr-2">
                 {stats?.total_books ? `${(stats.total_books / 1) >= 1000 ? (stats.total_books / 1000).toFixed(1) + 'k+' : stats.total_books}` : "10k+"}
               </h3>
               <p className="text-muted-foreground font-bold tracking-widest text-gr-xs">{t("Index.stats_books")}</p>
            </div>
            <div>
               <h3 className="text-gr-2xl font-black text-primary mb-gr-2">
                 {stats?.total_members ? `${(stats.total_members / 1) >= 1000 ? (stats.total_members / 1000).toFixed(1) + 'k+' : stats.total_members}` : "5k+"}
               </h3>
               <p className="text-muted-foreground font-bold tracking-widest text-gr-xs">{t("Index.stats_readers")}</p>
            </div>
            <div>
               <h3 className="text-gr-2xl font-black text-primary mb-gr-2">
                 {stats?.total_ebooks ? `${(stats.total_ebooks / 1) >= 1000 ? (stats.total_ebooks / 1000).toFixed(1) + 'k+' : stats.total_ebooks}` : "100%"}
               </h3>
               <p className="text-muted-foreground font-bold tracking-widest text-gr-xs">{t("Index.stats_ebooks")}</p>
            </div>
         </div>
      </section>
    </div>
  );
}
