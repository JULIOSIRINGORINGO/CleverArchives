"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@/components/ui/Box";
import { Inline } from "@/components/ui/Inline";
import { Stack } from "@/components/ui/Stack";
import { AlertCard } from "@/components/ui/AlertCard";
import { 
  SearchAesthetics, 
  ConfirmationAesthetics 
} from "./CartAesthetics";

/**
 * LEVEL 2: THE CONTROLLER (Main Layout Orchestration)
 * Manages the split-panel layout, alerts, and height distribution.
 * All logic passed from page.tsx (Level 1).
 */
export default function CartMainView({
  searchProps,
  confirmationProps,
  alertProps
}: any) {
  return (
    <Box padding="none" className="h-full">
      <Inline spacing="lg" align="stretch" maxWidth="full" className="h-full">
        
        {/* PANEL 1: LEFT COLUMN (Search & Alerts) */}
        <Box flex="1" display="flex" direction="col" className="h-full min-w-[320px]">
          <Stack spacing="lg" flex="1" className="h-full">
            
            {/* Search results take available space */}
            <Box flex="1" minHeight="0">
              <SearchAesthetics {...searchProps} />
            </Box>

            {/* Alert pops up at the bottom of the left panel area */}
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

        {/* PANEL 2: RIGHT COLUMN (Confirmation & Actions) */}
        <Box flex="1.5" className="h-full min-w-[400px]">
          <ConfirmationAesthetics {...confirmationProps} />
        </Box>

      </Inline>
    </Box>
  );
}
