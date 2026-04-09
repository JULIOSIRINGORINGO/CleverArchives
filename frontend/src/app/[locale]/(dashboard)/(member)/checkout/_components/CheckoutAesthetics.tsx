"use client";
import { memo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertCard } from "@/components/ui/AlertCard";
import { BookListCard } from "@/components/books/BookListCard";
import { IconWrapper } from "@/components/ui/IconWrapper";

/**
 * Checkout List Item - Standardized with IconWrapper
 */
export const CheckoutListItem = memo(({ 
  title, 
  barcode, 
  status, 
  isLoading, 
  onAction, 
  actionIcon, 
  actionVariant, 
  t 
}: any) => (
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
          <IconWrapper icon="loader" shouldSpin size="xs" isGhost />
        ) : actionIcon ? (
          <IconWrapper icon={actionIcon} size="xs" isGhost color="white" />
        ) : (
          <Inline spacing="xs" align="center">
            {t("submit_btn_simple")}
            <IconWrapper 
              icon="arrow-right" 
              size="xs" 
              isGhost 
              color="white" 
              opacity="40"
              className="group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all"
            />
          </Inline>
        )}
      </Button>
    }
  />
));

/**
 * Animation Wrapper
 */
const MotionItem = memo(({ children, index }: { children: ReactNode; index: number }) => (
  <Box width="full">
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 5 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      transition={{ delay: index * 0.05 }}
    >
      {children}
    </motion.div>
  </Box>
));

/**
 * List Renderer for Checkout Sections - Uses standard EmptyState container
 */
export const CheckoutListRenderer = ({ 
  items, 
  renderItem, 
  emptyIcon, 
  emptyTitle 
}: any) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <Stack spacing="sm" width="full">
      {items.length > 0 ? (
        items.map((item: any, i: number) => (
          <MotionItem key={item.barcode || item.id} index={i}>
            {renderItem(item)}
          </MotionItem>
        ))
      ) : (
        <EmptyState 
          icon={emptyIcon} 
          title={emptyTitle} 
          description="" 
          className="bg-muted/10 border-dashed"
        />
      )}
    </Stack>
  </AnimatePresence>
);

/**
 * Animated Alert Card Wrapper
 */
export const CheckoutAnimatedAlert = memo(({ 
  isVisible, 
  onDismiss,
  title,
  description
}: { 
  isVisible: boolean; 
  onDismiss: () => void;
  title: string;
  description: string;
}) => (
  <AnimatePresence>
    {isVisible && (
      <Box width="full">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
        >
          <AlertCard 
            variant="primary" 
            title={title} 
            description={description} 
            dismissible 
            onDismiss={onDismiss} 
          />
        </motion.div>
      </Box>
    )}
  </AnimatePresence>
));

CheckoutListItem.displayName = "CheckoutListItem";
CheckoutListRenderer.displayName = "CheckoutListRenderer";
CheckoutAnimatedAlert.displayName = "CheckoutAnimatedAlert";
