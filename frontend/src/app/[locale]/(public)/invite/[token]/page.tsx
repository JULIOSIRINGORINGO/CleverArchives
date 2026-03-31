"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const validateInvite = async () => {
      try {
        const res = await apiService.get(`/invitations/validate/${token}`);
        if (res.valid && res.tenant) {
          // Redirect to tenant subdomain registration
          const hostname = window.location.hostname;
          const port = window.location.port;
          const protocol = window.location.protocol;
          
          let targetHost = `${res.tenant.subdomain}.${hostname}`;
          if (hostname === 'localhost') {
            targetHost = `${res.tenant.subdomain}.lvh.me`;
          } else if (hostname.endsWith('.lvh.me')) {
            const rootHost = hostname.split('.').slice(-2).join('.');
            targetHost = `${res.tenant.subdomain}.${rootHost}`;
          }

          const finalUrl = `${protocol}//${targetHost}${port ? `:${port}` : ""}/register?token=${token}`;
          window.location.href = finalUrl;
        }
      } catch (err: any) {
        setError(err.message || "Undangan tidak valid atau sudah kedaluwarsa.");
      }
    };

    validateInvite();
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <BookOpen size={32} />
        </div>
        
        {error ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center text-red-500">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Gagal Memvalidasi Undangan</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              {error}
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-pulse">
            <Loader2 size={48} className="mx-auto text-primary animate-spin" />
            <h2 className="text-2xl font-black text-slate-900">Memvalidasi Undangan...</h2>
            <p className="text-slate-500 font-medium italic">Tunggu sebentar, kami sedang menyiapkan perpustakaan Anda.</p>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-slate-400 text-sm font-bold tracking-widest">
        Clever Archives
      </p>
    </div>
  );
}
