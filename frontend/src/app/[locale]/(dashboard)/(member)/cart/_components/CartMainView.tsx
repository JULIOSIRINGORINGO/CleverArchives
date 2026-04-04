"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DESIGN } from "@/config/design-system";

import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { WorkspacePanel } from "@/components/ui/WorkspacePanel";
import { AlertCard } from "@/components/ui/AlertCard";

import { SearchPanelContent } from "./SearchPanel";
import { ConfirmationPanelContent } from "./ConfirmationPanel";

interface CartMainViewProps {
  searchProps: any;
  confirmationProps: any;
  alertProps: {
    showWarning: boolean;
    closeWarning: () => void;
    t: any;
  };
}

/**
 * CartMainView - Menangani seluruh komposisi panel pada halaman Keranjang.
 * Membebaskan Page dari detail teknis layout dashboard.
 */
export const CartMainView = ({ searchProps, confirmationProps, alertProps }: CartMainViewProps) => {
  return (
    <Box padding="none" background="surface" className={cn("h-full", DESIGN.STYLING.PAGE_DASHBOARD)}>
      <Inline spacing="lg" align="stretch" maxWidth="full" className={cn("h-full", DESIGN.SPACE.PAGE_PAD)}>
        {/* PANEL 1: Pencarian Eksemplar */}
        <Box flex="1">
          <WorkspacePanel fullHeight>
            <SearchPanelContent {...searchProps} />
          </WorkspacePanel>
        </Box>

        {/* PANEL 2: Konfirmasi Pinjam */}
        <Box flex="1.5">
          <Stack spacing="lg" flex="1" className="h-full">
            <WorkspacePanel fullHeight>
              <ConfirmationPanelContent {...confirmationProps} />
            </WorkspacePanel>

            <AnimatePresence>
              {alertProps.showWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                >
                  <AlertCard
                    variant="info"
                    title={alertProps.t("alert_title")}
                    description={alertProps.t("alert_description")}
                    dismissible
                    onDismiss={alertProps.closeWarning}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Box>
      </Inline>
    </Box>
  );
};

CartMainView.displayName = "CartMainView";
