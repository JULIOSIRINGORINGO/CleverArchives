"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Text } from "@/components/ui/Text";
import { PillGroup, PillItem } from "@/components/features/messaging/_components/MessagingAesthetics";

interface SystemNavigationProps {
  layoutMode: 'list' | 'compose';
  setLayoutMode: (mode: 'list' | 'compose') => void;
  translations: any;
}

/**
 * SystemNavigation (Level 3 Component)
 * Delegated navigation control for the System Hub.
 * Part of SOP v5.6.0 compliance - Decoupled from orchestrator.
 */
export function SystemNavigation({
  layoutMode,
  setLayoutMode,
  translations: t
}: SystemNavigationProps) {
  return (
    <Box width="full" padding="none">
      <PillGroup>
        <PillItem 
          active={layoutMode === 'list'} 
          onClick={() => setLayoutMode('list')}
        >
          <IconWrapper 
            icon="message" 
            size="sm" 
            isGhost 
            color={layoutMode === 'list' ? "white" : undefined}
          />
          <Text 
            variant="subheading" 
            color={layoutMode === 'list' ? "white" : "black"}
          >
            {t("message_list")}
          </Text>
        </PillItem>
        <PillItem 
          active={layoutMode === 'compose'} 
          onClick={() => setLayoutMode('compose')}
        >
          <IconWrapper 
            icon="plus" 
            size="sm" 
            isGhost 
            color={layoutMode === 'compose' ? "white" : undefined}
          />
          <Text 
            variant="subheading" 
            color={layoutMode === 'compose' ? "white" : "black"}
          >
            {t("compose_tab")}
          </Text>
        </PillItem>
      </PillGroup>
    </Box>
  );
}
