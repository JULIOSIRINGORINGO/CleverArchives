"use client";

import React from "react";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text as UIText } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { WorkspacePanel } from "@/components/ui/WorkspacePanel";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Level 2: Aesthetic Wrappers for System Communication Page.
 * Standardizes the 3:2 layout and panel containers.
 */

export function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box 
      display="flex" 
      direction="row"
      spacing="md" 
      flex="1" 
      minHeight="0"
      height="full"
      background="surface-soft"
      padding="sm"
    >
      {children}
    </Box>
  );
}

export function SystemMainPanel({ children }: { children: React.ReactNode }) {
  return (
    <Box flex="1" display="flex" direction="col" minHeight="0">
      <WorkspacePanel fullHeight border="subtle" background="surface" className="group/col">
        {children}
      </WorkspacePanel>
    </Box>
  );
}

export function SystemSidePanel({ children }: { children: React.ReactNode }) {
  return (
    <Box 
      width="full"
      mdWidth="80"
      display="flex" 
      direction="col" 
      gap="md" 
      shrink="0"
      overflow="hidden" 
      paddingRight="xs"
      height="full"
      minHeight="0"
    >
      {children}
    </Box>
  );
}

export function SystemSectionHeader({ 
  iconKey, 
  title, 
  badge,
  action
}: { 
  iconKey: any; 
  title: string; 
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Inline justify="between" align="center" width="full">
      <Inline spacing="md" align="center">
        <SystemAvatarIcon background="primary" color="white">
          <IconWrapper icon={iconKey} size="sm" isGhost color="white" />
        </SystemAvatarIcon>
        <Heading level="h3" size="lg" weight="bold" className="tracking-tight">
          {title}
        </Heading>
      </Inline>
      <Inline spacing="xs" align="center">
        {badge}
        {action}
      </Inline>
    </Inline>
  );
}

export function SystemEmptyState({ icon: Icon, message }: { icon: any, message: string }) {
  return (
    <Box 
      height="full" 
      display="flex" 
      direction="col" 
      align="center" 
      justify="center" 
      gap="md" 
      paddingY="xl" 
      opacity="50"
    >
      <Box 
        width="16" 
        height="16" 
        background="muted-soft" 
        rounded="full" 
        display="flex" 
        align="center" 
        justify="center"
      >
        <Icon size={24} className="text-muted-foreground" />
      </Box>
      <UIText variant="label-xs" color="muted">
        {message}
      </UIText>
    </Box>
  );
}

export function SystemUnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Box 
      background="primary" 
      color="white" 
      rounded="full" 
      paddingX="xs" 
      display="flex"
      align="center"
      justify="center"
      height="6"
      className="min-w-[1.25rem] text-[10px] font-bold"
    >
      {count}
    </Box>
  );
}

export function SystemListLoading({ message }: { message: string }) {
  return (
    <Box padding="xl" display="flex" align="center" justify="center" gap="sm">
      <Loader2 size={16} className="animate-spin text-muted-foreground" />
      <UIText opacity="40" variant="label-xs">{message}</UIText>
    </Box>
  );
}

export function SystemListEmpty({ message }: { message: string }) {
  return (
    <Box padding="xl" display="flex" align="center" justify="center" opacity="40">
      <UIText variant="subheading">{message}</UIText>
    </Box>
  );
}

/**
 * Common Metadata Badge for System Hub.
 */
export function SystemBadge({ children, variant = "muted" }: { children: React.ReactNode, variant?: "muted" | "primary" }) {
  return (
    <Box 
      paddingX="sm" 
      background={variant === "primary" ? "primary-soft" : "muted-soft"} 
      rounded="lg" 
      border={variant === "primary" ? "none" : "subtle"}
      className={cn(
        "text-[9px] font-bold h-5 flex items-center shadow-sm uppercase tracking-wider",
        variant === "primary" ? "text-primary bg-primary/5" : "text-muted-foreground"
      )}
    >
      {children}
    </Box>
  );
}

/**
 * Specialized Unread Stripe for list items.
 */
export function SystemUnreadStripe() {
  return (
    <Box 
      position="absolute" 
      background="primary" 
      className="top-4 left-0 w-0.5 h-10 rounded-r-full"
    />
  );
}

/**
 * Standard Success Toast.
 */
export function SystemSuccessToast({ children }: { children: React.ReactNode }) {
  return (
    <Box 
      padding="md" 
      background="muted-soft" 
      rounded="xl" 
      border="subtle"
      className="bg-emerald-50 border-emerald-100 text-emerald-600 animate-in fade-in slide-in-from-top-1"
    >
      <Inline spacing="sm" align="center">
        <CheckCircle2 size={16} />
        <UIText variant="label-xs">
          {children}
        </UIText>
      </Inline>
    </Box>
  );
}

/**
 * Specialized Form Field Wrapper.
 */
export function SystemFieldWrapper({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <Stack spacing="xs">
      <UIText variant="subheading">
        {label}
      </UIText>
      {children}
    </Stack>
  );
}

/**
 * Premium Avatar-style Icon Wrapper for Headers.
 */
export function SystemAvatarIcon({ children, background = "primary", color = "white" }: { children: React.ReactNode, background?: any, color?: any }) {
  return (
    <Box 
      shrink="0"
      display="flex"
      align="center"
      justify="center"
      background={background}
      color={color}
      rounded="2xl"
      className="font-bold w-11 h-11 transition-all hover:scale-105"
    >
      {children}
    </Box>
  );
}

/**
 * Shared Upload Dropzone for System Hub.
 */
export function SystemUploadDropzone({ children, ...props }: any) {
  return (
    <Box 
      padding="lg"
      border="dashed"
      rounded="2xl"
      display="flex"
      direction="col"
      align="center"
      justify="center"
      cursor="pointer"
      transition="all"
      className="hover:border-primary/40 hover:bg-primary/[0.01]"
      {...props}
    >
      {children}
    </Box>
  );
}
