"use client";

import { useAuth } from "@/contexts/AuthContext";
import MemberCatalog from "@/components/catalog/MemberCatalog";
import TenantCatalog from "@/components/catalog/TenantCatalog";
import StandardLayout from "@/components/layout/StandardLayout";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CatalogDispatcher() {
  const t = useTranslations("Catalog");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <StandardLayout>
        <div className="min-h-[60vh] h-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground animate-pulse">{t("loading")}</p>
        </div>
      </StandardLayout>
    );
  }

  const role = user?.role?.name;

  if (role === "tenant_owner" || role === "admin" || role === "librarian") {
    return <StandardLayout><TenantCatalog /></StandardLayout>;
  }

  return <StandardLayout><MemberCatalog /></StandardLayout>;
}
