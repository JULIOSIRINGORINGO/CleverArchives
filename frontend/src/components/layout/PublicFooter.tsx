import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react";

import { useTranslations } from "next-intl";

const PublicFooter = () => {
  const t = useTranslations("Footer");
  
  return (
    <footer className="bg-muted/40 border-t pt-gr-6 pb-gr-4">
      <div className="container mx-auto px-gr-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gr-6 mb-gr-6">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-gr-2 mb-gr-5 group">
              <div className="w-gr-5 h-gr-5 bg-primary rounded-gr flex items-center justify-center text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                <BookOpen size={18} />
              </div>
              <span className="font-extrabold text-gr-lg tracking-tight">
                Clever Archives
              </span>
            </Link>
            <p className="text-gr-xs text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gr-xs tracking-wider mb-gr-5">{t("library")}</h4>
            <ul className="space-y-gr-3 text-gr-xs text-muted-foreground">
              <li><Link href="/books" className="hover:text-primary transition-colors">{t("browse")}</Link></li>
              <li><Link href="/books?filter=ebook" className="hover:text-primary transition-colors">{t("digital")}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">{t("about")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gr-xs tracking-wider mb-gr-5">{t("legal")}</h4>
            <ul className="space-y-gr-3 text-gr-xs text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{t("privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t("terms")}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t("cookies")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gr-xs tracking-wider mb-gr-5">{t("contact")}</h4>
            <ul className="space-y-gr-3 text-gr-xs text-muted-foreground">
              <li className="flex items-center gap-gr-3">
                <span className="text-gr-xs">Email:</span>
                <span className="text-foreground font-medium">hello@cleverarchives.com</span>
              </li>
              <li className="flex gap-4 mt-gr-4">
                <Link href="#" className="p-2 bg-background rounded-full border hover:text-primary transition-all shadow-sm"><Github size={18} /></Link>
                <Link href="#" className="p-2 bg-background rounded-full border hover:text-primary transition-all shadow-sm"><Twitter size={18} /></Link>
                <Link href="#" className="p-2 bg-background rounded-full border hover:text-primary transition-all shadow-sm"><Linkedin size={18} /></Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-gr-5 border-t flex flex-col md:flex-row justify-between items-center gap-gr-4 text-gr-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Clever Archives. {t("rights")}</p>
          <div className="flex gap-gr-5">
            <Link href="#" className="hover:text-primary transition-colors">{t("status")}</Link>
            <Link href="#" className="hover:text-primary transition-colors">{t("security")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
