"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

// UI Primitives
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { PageBody, MainArea } from "@/components/ui/Layout";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Button } from "@/components/ui/Button";
import { Inline } from "@/components/ui/Inline";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { WorkspacePanel, WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";

// Features & Logic
import { useCheckoutActions } from "./hooks/useCheckoutActions";
import { CheckoutListItem, CheckoutListRenderer, CheckoutAnimatedAlert } from "./_components/CheckoutAesthetics";

/**
 * CheckoutPage - Full-Height Workstation Refactor (v5.6.0)
 * Handles book checkout process and pending borrowing requests.
 * Harmonized with Cart UI using global components.
 */
export default function CheckoutPage() {
  const l = useLocale();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(true);
  
  const { 
    checkoutItems, 
    pending, 
    loadingId, 
    handleAction, 
    t 
  } = useCheckoutActions();

  return (
    <DashboardPage hideHeader hideScroll>
      <DashboardSection layout="full" fullHeight>
        <PageBody>
          {/* 1. SECURE CHECKOUT AREA */}
          <MainArea flex="1" height="full">
            <Stack spacing="md" height="full" width="full" flex="1">
          <WorkspacePanel fullHeight>
            <WorkspacePanelHeader showDivider={false}>
              {/* Manual header removed to avoid double title with systematic PageHeader */}
            </WorkspacePanelHeader>
            <WorkspacePanelContent>
              <CheckoutListRenderer 
                items={checkoutItems} 
                emptyIcon="shelf" 
                emptyTitle={t("checkout_empty")} 
                renderItem={(item: any) => (
                  <CheckoutListItem 
                    title={item.title} 
                    barcode={item.barcode} 
                    t={t} 
                    isLoading={loadingId === item.barcode} 
                    onAction={() => handleAction('single', item)} 
                    actionVariant="primary" 
                  />
                )} 
              />
            </WorkspacePanelContent>
            <WorkspacePanelFooter showDivider>
              <Button 
                variant="primary" 
                size="xl" 
                rounded="2xl" 
                fullWidth 
                disabled={!checkoutItems.length || !!loadingId} 
                onClick={() => handleAction('batch')}
              >
                <Inline spacing="sm" align="center">
                  {loadingId === 'batch' ? (
                    <IconWrapper icon="loader" shouldSpin size="xs" isGhost />
                  ) : (
                    <IconWrapper icon="check-all" size="xs" isGhost color="white" />
                  )} 
                  {t("process_batch_btn")}
                </Inline>
              </Button>
            </WorkspacePanelFooter>
          </WorkspacePanel>

          <Button 
            variant="primary" 
            size="xl" 
            rounded="2xl" 
            fullWidth 
            onClick={() => router.push(`/${l}/cart`)}
          >
            <Inline spacing="sm" align="center">
              <IconWrapper icon="arrow-left" size="xs" isGhost color="white" /> 
              {t("add_from_cart")}
            </Inline>
          </Button>
        </Stack>
      </MainArea>

      {/* 2. PENDING REQUESTS AREA */}
      <MainArea flex="1" height="full">
        <Stack spacing="md" height="full" width="full" flex="1">
          <WorkspacePanel fullHeight>
            <WorkspacePanelHeader showDivider={false}>
              <PanelSectionHeader 
                icon="time" 
                title={t("waiting_label")} 
                iconVariant="avatar" 
              />
            </WorkspacePanelHeader>
            <WorkspacePanelContent>
              <CheckoutListRenderer 
                items={pending} 
                emptyIcon="time" 
                emptyTitle={t("no_pending")} 
                renderItem={(item: any) => (
                  <CheckoutListItem 
                    title={item.book_copy?.book?.title} 
                    barcode={item.book_copy?.barcode} 
                    status={item.status} 
                    t={t} 
                    isLoading={loadingId === item.id} 
                    onAction={() => handleAction('cancel', item)} 
                    actionIcon="close" 
                    actionVariant="danger" 
                  />
                )} 
              />
            </WorkspacePanelContent>
          </WorkspacePanel>

          <CheckoutAnimatedAlert 
            isVisible={showWarning} 
            onDismiss={() => setShowWarning(false)}
            title="Konfirmasi"
            description="Permintaan peminjaman akan diverifikasi oleh sistem sebelum diaktifkan."
          />
            </Stack>
          </MainArea>
        </PageBody>
      </DashboardSection>
    </DashboardPage>
  );
}
