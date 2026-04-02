"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useToast } from "@/components/ui/Toast";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Auth");
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is a session-expired redirect
    if (typeof window !== "undefined") {
      const expired = sessionStorage.getItem("session_expired");
      if (expired) {
        toast(t("session_expired_desc"), "info");
        sessionStorage.removeItem("session_expired");
      }
    }
  }, [t, toast]);

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
      {children}
    </>
  );
}

