"use client";

import { useState } from "react";
import { Search, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { apiService } from "@/services/api";

export default function TenantFinder() {
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiService.tenants.publicFind(subdomain);
      if (response && response.subdomain) {
        // Redirect to subdomain
        const hostname = window.location.hostname; // Just the domain, no port
        const port = window.location.port;
        const protocol = window.location.protocol;
        
        // In development, handle lvh.me or localhost
        let targetHost = `${response.subdomain}.${hostname}`;
        if (hostname === 'localhost') {
           // On localhost, we can't easily do subdomains without editing /etc/hosts 
           // but lvh.me works. 
           targetHost = `${response.subdomain}.lvh.me`;
        } else if (hostname.endsWith('.lvh.me')) {
           // If we are already on a subdomain or root lvh.me, don't double up
           const rootHost = hostname.split('.').slice(-2).join('.'); // get 'lvh.me'
           targetHost = `${response.subdomain}.${rootHost}`;
        }
        
        const finalUrl = `${protocol}//${targetHost}${port ? `:${port}` : ""}`;
        window.location.href = finalUrl;
      }
    } catch (err: any) {
      setError("Library not found or inactive. Please check the name.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-gr-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-2xl text-center space-y-gr-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[--color-primary]/10 text-[--color-primary] mb-gr-4 shadow-lg shadow-[--color-primary]/5">
          <BookOpen size={32} strokeWidth={2} />
        </div>
        
        <div className="space-y-gr-3">
          <h1 className="text-gr-3xl font-black tracking-tight leading-none text-[--color-text]">
            Find Your <span className="text-[--color-primary] italic font-serif">Library</span>
          </h1>
          <p className="text-gr-lg text-[--color-muted-foreground] font-medium max-w-lg mx-auto leading-relaxed">
            Enter the name of your library to access books, digital archives, and your member dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative group max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="library-name"
              className="w-full px-gr-6 py-gr-5 text-gr-lg rounded-2xl border-2 border-[--color-border] bg-[--color-surface]/50 backdrop-blur-sm focus:border-[--color-primary] focus:ring-4 focus:ring-[--color-primary]/10 transition-all outline-none font-bold placeholder:text-[--color-muted-foreground]/30 pr-[140px] text-[--color-text]"
              autoFocus
            />
            <div className="absolute right-gr-2 top-gr-2 bottom-gr-2 flex items-center gap-gr-2">
               <button
                 type="submit"
                 disabled={loading || !subdomain}
                 className="h-full px-gr-5 bg-[--color-primary] hover:bg-[--color-primary]/90 text-[--color-primary-foreground] rounded-xl font-black flex items-center gap-gr-2 transition-all shadow-lg hover:shadow-[--color-primary]/20 disabled:opacity-50 disabled:grayscale"
               >
                 {loading ? <Loader2 className="animate-spin" size={20} strokeWidth={2} /> : <><ArrowRight size={20} strokeWidth={2} /> Go</>}
               </button>
            </div>
          </div>
          <p className="mt-gr-3 text-gr-xs font-bold text-[--color-muted-foreground]/60 tracking-widest">
            {subdomain ? `${subdomain}.lvh.me` : "your-library.cleverarchives.com"}
          </p>
          
          {error && (
            <div className="mt-gr-4 p-gr-3 rounded-xl bg-red-50 text-red-600 text-gr-sm font-bold border border-red-100 animate-in shake dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30">
              {error}
            </div>
          )}
        </form>

        <div className="pt-gr-8 flex flex-wrap justify-center gap-gr-4 opacity-50">
          <p className="text-gr-xs font-bold text-[--color-muted-foreground] tracking-wider w-full mb-gr-2">Public Libraries</p>
          {["demo-lib", "library-alpha", "central-archive"].map(lib => (
            <button 
              key={lib}
              onClick={() => setSubdomain(lib)}
              className="px-gr-3 py-gr-1.5 rounded-full border border-[--color-border] hover:border-[--color-primary] hover:text-[--color-primary] transition-colors text-gr-xs font-bold text-[--color-text]"
            >
              {lib}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
