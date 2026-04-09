import { useState, useCallback } from "react";
import useSWR from "swr";
import { apiService } from "@/services/api";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "next-intl";

export function useCheckoutActions() {
  const t = useTranslations("Cart");
  const { toast } = useToast();
  const { items: checkoutItems, removeFromCheckout, clearCheckout } = useCheckout();
  
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  // 1. Unified SWR for Pending Borrowings
  const { data: pendingData, mutate: refreshPending, isLoading: isRefreshing } = useSWR(
    '/api/v1/borrowings/pending',
    async () => {
      const res = await apiService.borrowings.list({ items: "100" });
      const items = Array.isArray(res) ? res : (res.data || []);
      return items.filter((b: any) => ["pending", "cancellation_requested"].includes(b.status));
    },
    { refreshInterval: 15000 }
  );

  const pending = pendingData || [];

  // 2. Action Handler
  const handleAction = useCallback(async (action: 'single' | 'batch' | 'cancel', data?: any) => {
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
        await apiService.borrowings.cancel(data.id.toString(), { 
          member_id: data.member_id, 
          barcode: data.book_copy?.barcode 
        });
        toast(t("success_cancellation_requested"), "success");
      }
      refreshPending();
    } catch (e: any) {
      toast(e.message || t("error_failed"), "error");
    } finally {
      setLoadingId(null);
    }
  }, [checkoutItems, clearCheckout, removeFromCheckout, refreshPending, t, toast]);

  return {
    checkoutItems,
    pending,
    loadingId,
    isRefreshing,
    handleAction,
    t
  };
}
