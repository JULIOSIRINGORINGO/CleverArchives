"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import MemberCatalog from "@/components/catalog/MemberCatalog";
import TenantCatalog from "@/components/catalog/TenantCatalog";
import { Spinner } from "@/components/ui/Spinner";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { useTranslations } from "next-intl";

const styles = {
  loadingContainer: "min-h-[60vh] h-full",
  spinner: "text-primary",
  loadingText: "animate-pulse text-muted-foreground"
};

/**
 * LoadingState - Local isolated UI for Catalog loading.
 * Ensures the main dispatcher remains a Lean Orchestrator.
 * Note: StandardLayout is provided by the parent (dashboard)/layout.tsx.
 */
const LoadingState = ({ message }: { message: string }) => (
  <Box
    display="flex"
    align="center"
    justify="center"
    className={styles.loadingContainer}
  >
    <Stack spacing="lg" align="center">
      <Spinner size="lg" className={styles.spinner} />
      <Text
        variant="label-xs"
        uppercase
        tracking="widest"
        className={styles.loadingText}
      >
        {message}
      </Text>
    </Stack>
  </Box>
);

// --- MAIN COMPONENT: THE DISPATCHER ---
export default function CatalogDispatcher() {
  const t = useTranslations("Catalog");
  const { user, loading } = useAuth();

  // 1. Handle Loading (Clean & Encapsulated)
  if (loading) return <LoadingState message={t("loading")} />;

  // 2. Logic Dispatcher (Logic-only)
  const role = user?.role?.name;
  const isManagement = role === "tenant_owner" || role === "admin" || role === "librarian";

  // 3. Return Utama (ZCN & Declarative)
  return isManagement ? <TenantCatalog /> : <MemberCatalog />;
}
