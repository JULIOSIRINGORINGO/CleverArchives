import React from "react";
import { Box, BoxProps } from "@/components/ui/Box";
import { cn } from "@/lib/utils";

/**
 * MessagingAesthetics.tsx
 * Level 2: Feature UI for Messaging Module
 * SOP v5.6.0 compliance - Isolated feature-specific styles from core Box primitive.
 */

interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  asChild?: boolean;
}

export function AvatarIcon({ children, className, ...props }: BoxProps) {
  return (
    <Box 
      variant="none" 
      shrink="0"
      display="flex"
      align="center"
      justify="center"
      background="primary-soft"
      color="primary"
      rounded="2xl"
      className={cn("font-bold w-11 h-11 transition-all hover:scale-105", className)}
      {...props}
    >
      {children}
    </Box>
  );
}

export function StatusDot({ className, ...props }: BoxProps) {
  return (
    <Box 
      variant="none"
      position="absolute"
      className={cn(
        "bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full transition-transform hover:scale-110",
        className
      )}
      {...props}
    />
  );
}

export function ListRow({ children, active, className, ...props }: BoxProps & { active?: boolean }) {
  return (
    <Box 
      variant="none"
      padding="sm"
      rounded="xl"
      cursor="pointer"
      transition="all"
      className={cn(
        "duration-200 border-none outline-none bg-white shadow-sm",
        active 
          ? "bg-primary/20 ring-1 ring-primary/30 shadow-md" 
          : "hover:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
}

export function PillGroup({ children, className, ...props }: BoxProps) {
  return (
    <Box 
      display="grid"
      gridCols="2"
      gap="xs"
      width="full"
      padding="xs"
      background="white"
      border="subtle"
      rounded="full"
      shadow="sm"
      className={className}
      {...props}
    >
      {children}
    </Box>
);
}

export function PillItem({ children, active, className, ...props }: BoxProps & { active?: boolean }) {
  return (
    <Box 
      variant="none"
      flex="1"
      display="flex"
      align="center"
      justify="center"
      gap="sm"
      paddingX="lg"
      paddingY="sm"
      rounded="full"
      transition="all"
      className={cn(
        "font-medium text-sm whitespace-nowrap transition-all",
        active 
          ? "bg-primary text-white shadow-sm" 
          : "text-muted-foreground hover:bg-white/50",
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
}

export function SearchResultsOverlay({ children, className, ...props }: BoxProps) {
  return (
    <Box 
      variant="none"
      position="absolute"
      width="full"
      flex="1"
      display="flex"
      direction="col"
      minHeight="0"
      marginTop="xs"
      background="white"
      border="subtle"
      shadow="sm"
      rounded="3xl"
      overflow="hidden"
      className={cn("z-50 bg-white/80 backdrop-blur-md max-h-52 overflow-y-auto custom-scrollbar", className)}
      {...props}
    >
      <Box 
        display="grid" 
        gridCols="1" 
        gap="none" 
        align="stretch" 
        width="full"
        flex="1" 
        minHeight="0"
      >
        {children}
      </Box>
    </Box>
  );
}

export function UploadDropzone({ children, ...props }: BoxProps) {
  return (
    <Box 
      variant="none"
      padding="xl"
      border="dashed"
      rounded="2xl"
      display="flex"
      direction="col"
      align="center"
      justify="center"
      cursor="pointer"
      transition="all"
      hoverEffect="scale"
      className="hover:border-primary/40 hover:bg-primary/[0.01]"
      {...props}
    >
      {children}
    </Box>
  );
}

export function BubbleContainer({ children, isMe, ...props }: BoxProps & { isMe: boolean }) {
  return (
    <Box
      display="flex"
      width="full"
      justify={isMe ? "end" : "start"}
      marginBottom="xs"
      scrollMarginTop="20"
      {...props}
    >
      {children}
    </Box>
  );
}

export function BubblePaper({ children, isMe, isOptimistic, ...props }: BoxProps & { isMe: boolean, isOptimistic?: boolean }) {
  return (
    <Box
      maxWidth="bubble-md"
      background={isMe ? "primary" : "white"}
      color={isMe ? "white" : "black"}
      border={isMe ? "none" : "subtle"}
      shadow="sm"
      opacity={isOptimistic ? "60" : "100"}
      marginLeft={isMe ? "xl" : "none"}
      marginRight={isMe ? "none" : "xl"}
      paddingTop="xs"
      paddingBottom="xs"
      paddingX="md"
      className={cn(
        "transition-all duration-200",
        isMe 
          ? "rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] shadow-primary/10" 
          : "rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px] border-border/50"
      )}
      {...props}
    >
      {children}
    </Box>
  );
}

export function SearchInputBox({ children, ...props }: BoxProps) {
  return (
    <Box position="relative" width="full" {...props}>
      <Box 
        position="absolute"
        display="flex"
        align="center"
        justify="center"
        height="full"
        width="10"
        opacity="40"
        className="left-0 top-0 z-10"
      >
        {children}
      </Box>
    </Box>
  );
}

export function SendButton({ children, loading, ...props }: any) {
  return (
    <Box 
      as="button"
      variant="none"
      rounded="full"
      background="primary"
      width="16"
      height="16"
      display="flex"
      align="center"
      justify="center"
      flexShrink="0"
      shadow="lg"
      transition="all"
      className={cn(
        "p-0 border-none transition-all active:scale-95 group",
        loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
      )}
      {...props}
    >
      {children}
    </Box>
  );
}
