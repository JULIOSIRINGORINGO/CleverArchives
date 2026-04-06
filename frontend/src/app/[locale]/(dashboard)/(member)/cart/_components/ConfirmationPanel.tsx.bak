"use client";

import { memo, ReactNode } from "react";
import { BookOpen, ShoppingBag, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DESIGN } from "@/config/design-system";

// UI Components
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

// Types & Context
import { CartItem } from "@/contexts/CartContext";

// --- Helpers ---

const MotionItem = memo(({ children, index }: { children: ReactNode; index: number }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: DESIGN.ANIM.EXIT_SCALE }}
    transition={{ delay: index * DESIGN.ANIM.STAGGER_DELAY }}
  >
    {children}
  </motion.div>
));
MotionItem.displayName = "MotionItem";

const ListRenderer = <T extends { barcode?: string; id: number }>({ 
  items, 
  renderItem, 
  emptyIcon: Icon, 
  emptyTitle 
}: { 
  items: T[]; 
  renderItem: (item: T) => ReactNode; 
  emptyIcon: any; 
  emptyTitle: string 
}) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <Stack spacing="md" flex="1">
      {items.length > 0 ? (
        items.map((item, i) => (
          <MotionItem key={item.barcode || item.id} index={i}>
            {renderItem(item)}
          </MotionItem>
        ))
      ) : (
        <EmptyState icon={Icon} title={emptyTitle} description="" className={DESIGN.STYLING.EMPTY_CARD} />
      )}
    </Stack>
  </AnimatePresence>
);

interface ConfirmationPanelProps {
  item: CartItem | null;
  movingToCheckout: boolean;
  handleMoveToCheckout: () => void;
  clearCart: () => void;
  t: any;
}

export const ConfirmationPanelContent = ({ 
  item, movingToCheckout, handleMoveToCheckout, clearCart, t 
}: ConfirmationPanelProps) => (
  <>
    <WorkspacePanelHeader showDivider>
      <PanelSectionHeader
        icon={<BookOpen size={DESIGN.ICON.HEADER} />}
        iconVariant="primary"
        title={t("borrow_confirmation")}
      />
    </WorkspacePanelHeader>

    <WorkspacePanelContent>
      {item ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
            <Stack align="center" justify="center" spacing="xl" className="h-full max-w-2xl mx-auto">
              <Inline spacing="xl" align="center" justify="center" wrap className="w-full">
                <Box 
                  rounded="2xl" 
                  border="none" 
                  shadow="lg"
                  background="white"
                  className="w-40 md:w-48 xl:w-56 aspect-[3/4] border-8 overflow-hidden shrink-0 relative group"
                >
                  <Box position="absolute" className="inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  {item.cover_url ? (
                    <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Box className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                      <BookOpen size={48} />
                    </Box>
                  )}
                </Box>
                
                <Stack flex="1" spacing="xl" align="center" className="lg:items-start text-center lg:text-left min-w-[240px]">
                  <Stack spacing="md" align="center" className="lg:items-start">
                    <StatusBadge status="available" label={t("ready_to_checkout")} className={DESIGN.TEXT.STATUS} />
                    <Heading level="h2" weight="bold" className="text-2xl md:text-3xl xl:text-4xl leading-tight">
                      {item.title}
                    </Heading>
                    <Text variant="body" weight="medium" className="text-muted-foreground italic">
                      {item.author}
                    </Text>
                  </Stack>
                  
                  <Box 
                    background="muted-soft" 
                    border="subtle" 
                    padding="md" 
                    rounded="2xl"
                    className="w-full backdrop-blur-sm"
                  >
                    <Stack spacing="xs" align="center" className="lg:items-start">
                      <Text variant="label" weight="bold" uppercase tracking="widest">
                        {t("copy_id_label")}
                      </Text>
                      <Text variant="heading" weight="black" tracking="widest" className="text-primary font-mono text-lg md:text-xl">
                        {item.barcode}
                      </Text>
                    </Stack>
                  </Box>
                </Stack>
              </Inline>
            </Stack>
          </motion.div>
      ) : (
        <ListRenderer items={[]} emptyIcon={ShoppingBag} emptyTitle={t("empty_cart")} renderItem={() => null} />
      )}
    </WorkspacePanelContent>

    <WorkspacePanelFooter showDivider>
      <Inline spacing="md" maxWidth="full">
        <Button 
          variant="danger" 
          size="xl"
          rounded="2xl"
          className="px-8"
          onClick={clearCart} 
          disabled={!item}
        >
          <Inline spacing="sm" align="center">
            <Trash2 size={DESIGN.ICON.ACTION} /> 
            {t("cancel")}
          </Inline>
        </Button>
        <Button 
          variant="primary"
          size="xl"
          rounded="2xl"
          fullWidth
          className={cn(DESIGN.STYLING.BTN_VIVID_BLUE)}
          disabled={!item || movingToCheckout}
          onClick={handleMoveToCheckout}
        >
          <Inline spacing="sm" align="center">
            {movingToCheckout ? <Spinner size="sm" /> : <CheckCircle2 size={DESIGN.ICON.STAKE} />}
            {t("process_checkout")}
          </Inline>
        </Button>
      </Inline>
    </WorkspacePanelFooter>
  </>
);
ConfirmationPanelContent.displayName = "ConfirmationPanelContent";
