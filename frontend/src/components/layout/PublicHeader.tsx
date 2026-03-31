"use client";

import Link from "next/link";
import { BookOpen, Search, LogIn, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function PublicHeader() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-primary/20 transition-all">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
              Stellar Library
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link href={`/${locale}/books`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <Search size={16} /> Browse Catalog
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${locale}?login=true`}>
            <Button variant="ghost" className="hidden sm:flex rounded-xl font-medium gap-2 text-muted-foreground hover:text-foreground">
              <LogIn size={18} /> Sign In
            </Button>
          </Link>
          <Link href={`/${locale}/register`}>
            <Button className="rounded-xl font-bold gap-2">
              <UserPlus size={18} /> Join Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
