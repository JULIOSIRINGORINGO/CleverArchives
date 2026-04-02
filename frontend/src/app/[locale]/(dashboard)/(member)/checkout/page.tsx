"use client";

import { useState, useEffect } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslations, useLocale } from "next-intl";
import { apiService } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle2, Package, ArrowLeft, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { WorkspacePanel, WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";
import { BookListCard } from "@/components/books/BookListCard";
import { useRouter } from "next/navigation";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { SplitPanelLayout } from "@/components/layout/SplitPanelLayout";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertCard } from "@/components/ui/AlertCard";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";

export default function CheckoutPage() {
  const t = useTranslations("Cart");
  const navT = useTranslations("Navigation");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { items: checkoutItems, removeFromCheckout, clearCheckout } = useCheckout();
  const [pending, setPending] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [showWarning, setShowWarning] = useState(true);

  const refresh = async () => {
    const res = await apiService.borrowings.list({ items: '100' });
    const list = Array.isArray(res) ? res : (res.data || []);
    setPending(list.filter((b: any) => ['pending', 'cancellation_requested'].includes(b.status)));
  };

  useEffect(() => { refresh(); }, []);

  const handleAction = async (action: 'single' | 'batch' | 'cancel', data?: any) => {
    setLoadingId(data?.barcode || data?.id || 'batch');
    try {
      if (action === 'single') {
        await apiService.borrowings.create({ borrowing: { barcode: data.barcode } });
        removeFromCheckout(data.barcode);
        toast(t("success_submitted", { barcode: data.barcode }), "success");
      } else if (action === 'batch') {
        const barcodes = checkoutItems.map(i => i.barcode);
        await apiService.borrowings.batchCreate({ barcodes });
        clearCheckout();
        toast(t("success_batch", { count: barcodes.length }), "success");
      } else if (action === 'cancel') {
        await apiService.borrowings.cancel(data.id.toString(), { member_id: data.member_id, barcode: data.book_copy?.barcode });
        toast(t("success_cancellation_requested"), "success");
      }
      refresh();
    } catch (err: any) {
      toast(err.message || t("error_failed_item", { barcode: data?.barcode || "batch" }), "error");
    }
    setLoadingId(null);
  };

  return (
    <DashboardPage
      title={navT("checkout")}
      subtitle={navT("checkout_desc")}
      icon={<ShoppingBag size={22} />}
      noPadding
      hideScroll
    >
      <SplitPanelLayout>
        {/* Primary Panel: Checkout Items */}
        <WorkspacePanel fullHeight>
          <WorkspacePanelHeader showDivider>
            <PanelSectionHeader
              icon={<ShoppingBag size={16} />}
              iconVariant="primary"
              title={t("ready_to_checkout")}
            />
          </WorkspacePanelHeader>

          <WorkspacePanelContent>
            <AnimatePresence mode="popLayout">
              {checkoutItems.length > 0 ? checkoutItems.map((item) => (
                <motion.div
                  key={item.barcode}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <BookListCard
                    isCompact
                    title={item.title}
                    author={item.barcode}
                    status="available"
                    metadata={[]}
                    action={
                      <>
                        <Button variant="primary" size="sm" rounded="xl" disabled={!!loadingId} onClick={() => handleAction('single', item)}>
                          {loadingId === item.barcode ? <Spinner size="xs" /> : t("submit_btn_simple")}
                        </Button>
                        <Button variant="danger" size="icon" rounded="xl" onClick={() => removeFromCheckout(item.barcode)}>
                          <Trash2 size={14} />
                        </Button>
                      </>
                    }
                  />
                </motion.div>
              )) : (
                <EmptyState
                  icon={Package}
                  title={t("checkout_empty")}
                  description={navT("checkout_desc")}
                />
              )}
            </AnimatePresence>
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
              {loadingId === 'batch' ? <Spinner /> : <CheckCircle2 size={18} />}
              {t("process_batch_btn")}
            </Button>
            <Button
              variant="outline"
              size="action"
              rounded="xl"
              fullWidth
              onClick={() => router.push(`/${locale}/cart`)}
            >
              <ArrowLeft size={14} />
              {t("add_from_cart")}
            </Button>
          </WorkspacePanelFooter>
        </WorkspacePanel>

        {/* Secondary Panel: Pending + Warning */}
        <>
          <WorkspacePanel fullHeight>
            <WorkspacePanelHeader showDivider>
              <PanelSectionHeader
                icon={<Clock size={14} />}
                iconVariant="warning"
                title={t("waiting_label")}
                titleVariant="label"
              />
            </WorkspacePanelHeader>

            <WorkspacePanelContent>
              {pending.map(b => (
                <BookListCard
                  key={b.id}
                  isCompact
                  title={b.book_copy?.book?.title}
                  author={b.book_copy?.barcode}
                  status={b.status}
                  metadata={[]}
                  action={
                    <Button
                      variant="danger"
                      size="icon"
                      rounded="lg"
                      disabled={b.status === 'cancellation_requested' || !!loadingId}
                      onClick={() => handleAction('cancel', b)}
                    >
                      {loadingId === b.id ? <Spinner size="xs" /> : <X size={14} />}
                    </Button>
                  }
                />
              ))}
              {!pending.length && (
                <EmptyState
                  icon={Clock}
                  title={t("no_pending")}
                  description=""
                />
              )}
            </WorkspacePanelContent>
          </WorkspacePanel>

          <AnimatePresence>
            {showWarning && (
              <AlertCard
                variant="info"
                title={t("confirmation")}
                description={t("verification_note")}
                dismissible
                onDismiss={() => setShowWarning(false)}
              />
            )}
          </AnimatePresence>
        </>
      </SplitPanelLayout>
    </DashboardPage>
  );
}
