"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AnimatePresence } from "framer-motion";

interface MessagingModalsProps {
  selectedBroadcast: any;
  setSelectedBroadcast: (val: any) => void;
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (val: boolean) => void;
  confirmDeleteMessage: () => void;
  clearConfirmOpen: boolean;
  setClearConfirmOpen: (val: boolean) => void;
  confirmClearAllMessages: () => void;
  translations: any;
}

export function MessagingModals({
  selectedBroadcast,
  setSelectedBroadcast,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  confirmDeleteMessage,
  clearConfirmOpen,
  setClearConfirmOpen,
  confirmClearAllMessages,
  translations: t
}: MessagingModalsProps) {
  return (
    <>
      <AnimatePresence>
        <Modal 
          isOpen={!!selectedBroadcast} 
          onClose={() => setSelectedBroadcast(null)} 
          className="max-w-2xl w-full p-0 overflow-hidden"
        >
          {selectedBroadcast && (
            <Box display="flex" direction="col" background="surface">
              <Box padding="xl" border="subtle" background="muted-soft" position="relative" overflow="hidden">
                <Box position="absolute" className="top-0 right-0" padding="md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    rounded="xl" 
                    onClick={() => setSelectedBroadcast(null)}
                  >
                    <IconWrapper icon="close" size="sm" isGhost />
                  </Button>
                </Box>
                <Box display="inline-flex" align="center" paddingX="md" paddingY="xs" rounded="full" background="primary-soft" border="primary" marginBottom="md">
                  <Text variant="label-strong" color="primary">
                    {t("broadcast_alert")}
                  </Text>
                </Box>
                <Box marginBottom="md">
                  <Text variant="heading" weight="bold" color="black" className="leading-tight">
                    {selectedBroadcast.title}
                  </Text>
                </Box>
                <Inline spacing="lg" align="center">
                  <Inline spacing="md" align="center">
                    <Box variant="avatar-icon" width="10" height="10" display="flex" align="center" justify="center">
                      <Text variant="label-strong">{selectedBroadcast.sender_name?.[0]}</Text>
                    </Box>
                    <Text variant="label-strong" color="muted">{selectedBroadcast.sender_name}</Text>
                  </Inline>
                  <Text variant="caption-muted" opacity="40">•</Text>
                  <Inline spacing="xs" align="center">
                    <IconWrapper icon="calendar" size="xs" color="primary" isGhost />
                    <Text variant="caption-muted">{new Date(selectedBroadcast.created_at).toLocaleDateString()}</Text>
                  </Inline>
                </Inline>
              </Box>
              
              <Box padding="xl" overflow="auto" className="max-h-[50vh] custom-scrollbar">
                <Text variant="body" color="black" className="whitespace-pre-wrap leading-relaxed">
                  {selectedBroadcast.body}
                </Text>
                
                {selectedBroadcast.attachments && selectedBroadcast.attachments.length > 0 && (
                  <Box marginTop="xl" paddingTop="xl" border="top" spacing="lg" display="flex" direction="col">
                    <Text variant="label-strong" color="muted">{t("attachment")}</Text>
                    <Stack spacing="md">
                      {selectedBroadcast.attachments.map((att: any, i: number) => (
                        <Box 
                          asChild
                          key={i} 
                          variant="list-row"
                          padding="md"
                          rounded="2xl"
                          cursor="pointer"
                        >
                          <Box 
                            as="a"
                            href={`${process.env.NEXT_PUBLIC_API_URL}${att.url}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            width="full"
                          >
                            <Inline justify="between" align="center" width="full">
                             <Inline spacing="lg" align="center">
                               <Box variant="avatar-icon" width="10" height="10" display="flex" align="center" justify="center">
                                  <IconWrapper icon="file-text" size="sm" isGhost />
                               </Box>
                               <Text variant="label-strong" color="black" className="truncate max-w-[240px]">{att.filename}</Text>
                             </Inline>
                             <IconWrapper icon="download" size="sm" isGhost />
                            </Inline>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
              
              <Box padding="md" background="muted-soft" border="top" display="flex" justify="end">
                <Button onClick={() => setSelectedBroadcast(null)} variant="outline" rounded="xl" className="px-6">
                   {t("done")}
                </Button>
              </Box>
            </Box>
          )}
        </Modal>
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteMessage}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={confirmClearAllMessages}
        title={t("clear_confirm_title")}
        description={t("clear_confirm_desc")}
        confirmLabel={t("clear_confirm_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
      />
    </>
  );
}
