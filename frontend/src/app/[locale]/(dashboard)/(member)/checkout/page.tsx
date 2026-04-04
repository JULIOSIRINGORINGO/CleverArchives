"use client";

import { useState, useEffect, useMemo, memo, ReactNode } from "react";
import { 
  ShoppingBag, Clock, CheckCircle2, Package, 
  ArrowLeft, X, Trash2, Loader2 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

// Design System
import { DESIGN } from "@/config/design-system";

// Context & Services
import { useCheckout } from "@/contexts/CheckoutContext";
import { apiService } from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/Button";
import { WorkspacePanel, WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";
import { BookListCard } from "@/components/books/BookListCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertCard } from "@/components/ui/AlertCard";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Box } from "@/components/ui/Box";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { PageBody } from "@/components/ui/Layout";

// --- SHARED UI MODULES ---

const Header = ({ icon: Icon, title, variant }: { icon: any; title: string, variant: 'primary' | 'warning' }) => (
  <Inline spacing="md" align="center">
    <Box className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-border/50",
      variant === 'primary' ? "text-primary" : "text-amber-500"
    )}>
      <Icon size={20} strokeWidth={2.5} />
    </Box>
    <Heading level="h4" weight="bold">{title}</Heading>
  </Inline>
);

const MotionItem = memo(({ children, index }: { children: ReactNode; index: number }) => (
  <motion.div 
    layout 
    initial={{ opacity: 0, y: 5 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, scale: 0.95 }} 
    transition={{ delay: index * 0.05 }}
  >
    {children}
  </motion.div>
));

const ListItem = memo(({ title, barcode, status, isLoading, onAction, actionIcon: Icon, actionVariant, t }: any) => (
  <BookListCard
    isCompact 
    title={title || "Buku"} 
    author={barcode || "Unknown"} 
    status={status || "available"} 
    metadata={[]}
    action={
      <Button 
        variant={actionVariant} 
        size={status === 'available' ? 'sm' : 'icon'} 
        disabled={isLoading} 
        onClick={onAction}
        rounded="xl"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : Icon ? (
          <Icon size={18} strokeWidth={2.5} />
        ) : (
          t("submit_btn_simple")
        )}
      </Button>
    }
  />
));

const ListRenderer = ({ items, renderItem, emptyIcon: Icon, emptyTitle }: any) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <Stack spacing="sm">
      {items.length > 0 ? (
        items.map((item: any, i: number) => (
          <MotionItem key={item.barcode || item.id} index={i}>
            {renderItem(item)}
          </MotionItem>
        ))
      ) : (
        <Box className="py-12 bg-white/50 rounded-[2.5rem] border border-dashed border-border/10">
          <EmptyState icon={Icon} title={emptyTitle} description="" />
        </Box>
      )}
    </Stack>
  </AnimatePresence>
);

// --- MAIN PAGE ---

export default function CheckoutPage() {
  const t = useTranslations("Cart");
  const l = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { items: checkoutItems, removeFromCheckout, clearCheckout } = useCheckout();
  
  const [pending, setPending] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [showWarning, setShowWarning] = useState(true);

  const fetch = async () => {
    try {
      const res = await apiService.borrowings.list({ items: "100" });
      setPending((Array.isArray(res) ? res : (res.data || [])).filter((b: any) => ["pending", "cancellation_requested"].includes(b.status)));
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetch(); }, []);

  const handle = async (action: 'single' | 'batch' | 'cancel', data?: any) => {
    const id = data?.barcode || data?.id || 'batch';
    setLoadingId(id);
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
      fetch();
    } catch (e: any) { toast(e.message || t("error_failed"), "error"); }
    finally { setLoadingId(null); }
  };

  return (
    <Box className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <PageBody className="flex-1">
        
        {/* PANEL 1: DAFTAR BUKU SIAP CHECKOUT */}
        <Box className="flex-1 flex flex-col min-w-0 h-full">
          <Stack spacing="md" className="h-full">
            <WorkspacePanel className="flex-1 min-h-0">
              <WorkspacePanelHeader showDivider={false}>
                <Header icon={ShoppingBag} title={t("ready_to_checkout")} variant="primary" />
              </WorkspacePanelHeader>
              <WorkspacePanelContent>
                <ListRenderer 
                  items={checkoutItems} 
                  emptyIcon={Package} 
                  emptyTitle={t("checkout_empty")} 
                  renderItem={(item: any) => (
                    <ListItem 
                      title={item.title} 
                      barcode={item.barcode} 
                      t={t} 
                      isLoading={loadingId === item.barcode} 
                      onAction={() => handle('single', item)} 
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
                  onClick={() => handle('batch')}
                >
                  {loadingId === 'batch' ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <CheckCircle2 size={20} />
                  )} 
                  {t("process_batch_btn")}
                </Button>
              </WorkspacePanelFooter>
            </WorkspacePanel>

            <Button 
              variant="outline" 
              size="xl" 
              rounded="2xl" 
              fullWidth 
              onClick={() => router.push(`/${l}/cart`)}
            >
              <ArrowLeft size={20} /> {t("add_from_cart")}
            </Button>
          </Stack>
        </Box>

        {/* PANEL 2: MENUNGGU DISETUJUI */}
        <Box className="flex-1 flex flex-col min-w-0 h-full">
          <Stack spacing="md" className="h-full">
            <WorkspacePanel className="flex-1 min-h-0">
              <WorkspacePanelHeader showDivider={false}>
                <Header icon={Clock} title={t("waiting_label")} variant="warning" />
              </WorkspacePanelHeader>
              <WorkspacePanelContent>
                <ListRenderer 
                  items={pending} 
                  emptyIcon={Clock} 
                  emptyTitle={t("no_pending")} 
                  renderItem={(item: any) => (
                    <ListItem 
                      title={item.book_copy?.book?.title} 
                      barcode={item.book_copy?.barcode} 
                      status={item.status} 
                      t={t} 
                      isLoading={loadingId === item.id} 
                      onAction={() => handle('cancel', item)} 
                      actionIcon={X} 
                      actionVariant="danger" 
                    />
                  )} 
                />
              </WorkspacePanelContent>
            </WorkspacePanel>

            <AnimatePresence>
              {showWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                >
                  <AlertCard 
                    variant="info" 
                    title="Konfirmasi" 
                    description="Permintaan peminjaman akan diverifikasi oleh sistem sebelum diaktifkan." 
                    dismissible 
                    onDismiss={() => setShowWarning(false)} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Box>

      </PageBody>
    </Box>
  );
}
