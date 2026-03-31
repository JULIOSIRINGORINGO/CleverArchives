"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AuthCallbackPage() {
  const { handleCallback } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string || "en";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    (async () => {
      try {
        // Clean the URL immediately (remove ?token=... from browser history)
        window.history.replaceState({}, document.title, window.location.pathname);

        await handleCallback(token);
        router.push(`/${locale}/dashboard`);
      } catch (err: any) {
        setError(err.message || "Autentikasi gagal. Silakan login ulang.");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-sm">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="font-black text-xl">Autentikasi Gagal</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Link
            href={`/${locale || 'en'}?login=true`} // Use locale state, default to 'en' if not yet set
            className="block w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-center hover:bg-primary/90 transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
          <BookOpen size={28} />
        </div>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="font-bold text-muted-foreground">Memverifikasi sesi Anda…</p>
        </div>
      </div>
    </div>
  );
}
