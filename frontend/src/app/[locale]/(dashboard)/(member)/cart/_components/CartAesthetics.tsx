"use client";

import React, { memo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UnifiedSearch } from "@/components/ui/UnifiedSearch";
import { BookListCard } from "@/components/books/BookListCard";
import { WorkspacePanelHeader, WorkspacePanelContent, WorkspacePanelFooter } from "@/components/ui/WorkspacePanel";
import { PanelSectionHeader } from "@/components/ui/PanelSectionHeader";

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
MotionItem.displayName = "MotionItem";

// --- PANEL 1: SEARCH AESTHETICS ---

export const SearchAesthetics = ({
  barcode, setBarcode, searching, handleSearch, searchResults, handleSelectItem, t
}: any) => (
  <Stack spacing="none" className="h-full">
    <WorkspacePanelHeader showDivider={false}>
      <Stack spacing="lg" maxWidth="full">
        <Inline spacing="md" align="center">
          <IconWrapper variant="primary-solid" icon="search" className="w-10 h-10" />
          <Heading level="h4" weight="bold">{t("search_title")}</Heading>
        </Inline>
        <form onSubmit={handleSearch}>
          <Inline spacing="sm" align="center" maxWidth="full">
            <Box flex="1">
              <UnifiedSearch
                value={barcode}
                onChange={setBarcode}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder={t("barcode_placeholder")}
                isLoading={searching}
                className="h-12"
                autoFocus
              />
            </Box>
            <Button
              variant="primary"
              size="lg"
              rounded="2xl"
              type="submit"
              disabled={searching}
              className="shadow-sm shadow-primary/20 active:scale-95 transition-all"
            >
              {t("search_button")}
            </Button>
          </Inline>
        </form>
      </Stack>
    </WorkspacePanelHeader>

    <WorkspacePanelContent>
      <AnimatePresence mode="popLayout" initial={false}>
        <Stack spacing="md" flex="1">
          {searchResults.length > 0 ? (
            searchResults.map((copy: any, i: number) => (
              <MotionItem key={copy.barcode || copy.id} index={i}>
                <BookListCard
                  isCompact
                  title={copy.barcode}
                  author={copy.book?.title}
                  status={copy.status}
                  metadata={[]}
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      rounded="xl"
                      onClick={() => handleSelectItem(copy)}
                      className="group/btn"
                    >
                      <Inline spacing="xs" align="center">
                        {t("select")}
                        <IconWrapper
                          icon="arrow-right"
                          size="xs"
                          color="white"
                          isGhost
                          opacity="40"
                          className="group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all"
                        />
                      </Inline>
                    </Button>
                  }
                />
              </MotionItem>
            ))
          ) : (
            <EmptyState
              icon="isbn"
              title={t("empty_search")}
              description=""
              className="bg-muted/10 border-dashed"
            />
          )}
        </Stack>
      </AnimatePresence>
    </WorkspacePanelContent>
  </Stack>
);

// --- PANEL 2: CONFIRMATION AESTHETICS ---

export const ConfirmationAesthetics = ({
  item, movingToCheckout, handleMoveToCheckout, clearCart, t
}: any) => (
  <Stack spacing="none" className="h-full">
    <WorkspacePanelHeader showDivider>
      <Inline spacing="sm" align="center">
        <IconWrapper variant="primary-solid" icon="isbn" size="sm" />
        <Text variant="subheading">{t("borrow_confirmation")}</Text>
      </Inline>
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
                className="w-40 md:w-48 xl:w-56 aspect-[3/4] overflow-hidden shrink-0 relative group"
              >
                <Box position="absolute" className="inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                {item.cover_url ? (
                  <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Box className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                    <IconWrapper icon="isbn" size="xl" opacity="20" />
                  </Box>
                )}
              </Box>

              <Stack flex="1" spacing="xl" align="center" className="lg:items-start text-center lg:text-left min-w-[240px]">
                <Stack spacing="md" align="center" className="lg:items-start">
                  <StatusBadge status="available" label={t("ready_to_checkout")} />
                  <Heading level="h2" weight="bold" className="text-2xl md:text-3xl xl:text-4xl leading-tight">
                    {item.title}
                  </Heading>
                  <Text variant="subheading" weight="medium" italic className="text-muted-foreground truncate">
                    {item.author}
                  </Text>
                </Stack>

                <Box
                  background="muted-soft"
                  border="subtle"
                  padding="md"
                  rounded="xl"
                  className="w-full backdrop-blur-sm"
                >
                  <Stack spacing="xs" align="center" className="lg:items-start">
                    <Text variant="label-xs" weight="bold" uppercase tracking="widest" className="text-muted-foreground/60">
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
        <EmptyState
          icon="shelf"
          title={t("empty_cart")}
          description=""
          className="bg-muted/10 border-dashed"
        />
      )}
    </WorkspacePanelContent>

    <WorkspacePanelFooter showDivider>
      <Inline spacing="md" maxWidth="full">
        <Button
          variant="danger"
          size="action"
          rounded="2xl"
          className="px-8 shadow-sm shadow-red-100"
          onClick={clearCart}
          disabled={!item}
        >
          <Inline spacing="sm" align="center">
            <IconWrapper icon="trash" size="xs" color="white" isGhost />
            {t("cancel")}
          </Inline>
        </Button>
        <Button
          variant="glow"
          size="action"
          rounded="2xl"
          fullWidth
          disabled={!item || movingToCheckout}
          onClick={handleMoveToCheckout}
        >
          <Inline spacing="sm" align="center">
            {movingToCheckout ? <Spinner size="sm" /> : <IconWrapper icon="check-all" size="xs" color="white" isGhost />}
            {t("process_checkout")}
          </Inline>
        </Button>
      </Inline>
    </WorkspacePanelFooter>
  </Stack>
);
