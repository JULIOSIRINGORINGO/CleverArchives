"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Auth");
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Check if this is a session-expired redirect
    if (typeof window !== "undefined") {
      const expired = sessionStorage.getItem("session_expired");
      if (expired) {
        setSessionExpired(true);
        sessionStorage.removeItem("session_expired");
        
        // Auto-dismiss after 2 seconds
        const timer = setTimeout(() => {
          setSessionExpired(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}?login=true`);
    }
  }, [user, loading, router, locale]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {sessionExpired && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 bg-amber-500 text-white rounded-2xl px-5 py-3 shadow-xl shadow-amber-500/20 text-sm font-semibold">
            <span>⏱</span>
            <span>{t("session_expired_desc")}</span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

