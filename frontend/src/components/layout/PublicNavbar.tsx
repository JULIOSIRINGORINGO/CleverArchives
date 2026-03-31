"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import LoginModal from "@/components/auth/LoginModal";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const LoginModalTrigger = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setOpen(true);
    }
  }, [searchParams, setOpen]);
  return null;
};

const PublicNavbar = () => {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-gr-4 h-gr-7 flex items-center justify-between">
          <div className="flex items-center gap-gr-6">
            <Link href={`/${locale}`} className="flex items-center gap-gr-2 group transition-all">
              <div className="w-10 h-10 bg-primary rounded-gr flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
                <BookOpen size={22} />
              </div>
              <span className="font-extrabold text-gr-lg tracking-tight hidden sm:inline-block">
                Clever Archives
              </span>
            </Link>

            <nav className="hidden md:flex gap-gr-5">
              <Link href={`/${locale}`} className="text-gr-sm font-semibold hover:text-primary transition-colors">
                {t("home")}
              </Link>
              <Link href={`/${locale}/books`} className="text-gr-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                {t("browse")}
              </Link>
              <Link href={`/${locale}/books?filter=ebook`} className="text-gr-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                {t("ebooks")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-gr-3">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="ghost"
              className="hidden sm:flex rounded-gr font-bold gap-gr-2 h-10 px-gr-4"
              onClick={() => setIsLoginOpen(true)}
            >
              <LogIn size={18} /> {t("login")}
            </Button>
            <Link href={`/${locale}/register`}>
              <Button className="rounded-gr font-bold gap-gr-2 px-gr-5 h-10 shadow-md hover:shadow-lg transition-all">
                <UserPlus size={18} /> {t("register")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <Suspense fallback={null}>
        <LoginModalTrigger setOpen={setIsLoginOpen} />
      </Suspense>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default PublicNavbar;
