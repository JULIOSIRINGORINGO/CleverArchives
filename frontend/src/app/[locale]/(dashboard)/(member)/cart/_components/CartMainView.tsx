"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { WorkspacePanel } from "@/components/ui/WorkspacePanel";
import { AlertCard } from "@/components/ui/AlertCard";

import { SearchAesthetics, ConfirmationAesthetics } from "./CartAesthetics";

interface CartMainViewProps {
  searchProps: any;
  confirmationProps: any;
  alertProps: {
    showWarning: boolean;
    closeWarning: () => void;
    t: any;
  };
}

export const CartMainView = ({ searchProps, confirmationProps, alertProps }: CartMainViewProps) => {
  return (
    <Box padding="none" className="h-full">
      <Inline spacing="lg" align="stretch" maxWidth="full" className="h-full">
        {/* PANEL 1: Pencarian Eksemplar */}
        <Box flex="1" className="h-full">
          <WorkspacePanel fullHeight>
            <SearchAesthetics {...searchProps} />
          </WorkspacePanel>
        </Box>

        {/* PANEL 2: Konfirmasi Pinjam */}
        <Box flex="1.5" className="h-full">
          <Stack spacing="lg" flex="1" className="h-full">
            <WorkspacePanel fullHeight>
              <ConfirmationAesthetics {...confirmationProps} />
            </WorkspacePanel>

            <AnimatePresence>
              {alertProps.showWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                >
                  <AlertCard
                    variant="primary"
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
