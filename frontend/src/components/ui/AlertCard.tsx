"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";
import { IconWrapper } from "@/components/ui/IconWrapper";

type AlertCardVariant = "warning" | "info" | "danger" | "primary";

interface AlertCardProps {
  variant?: AlertCardVariant;
  title: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<AlertCardVariant, {
  icon: React.ElementType;
  iconVariant: "warning" | "primary" | "danger" | "white" | "primary-solid";
  containerClass: string;
}> = {
  primary: {
    icon: Info,
    iconVariant: "primary-solid",
    containerClass: "bg-amber-100/30 border-amber-200/40 shadow-sm",
  },
  warning: {
    icon: AlertTriangle,
    iconVariant: "warning",
    containerClass: "bg-amber-50/50 border-amber-100/50",
  },
  info: {
    icon: Info,
    iconVariant: "primary",
    containerClass: "bg-muted/30 border-border/50",
  },
  danger: {
    icon: AlertCircle,
    iconVariant: "danger",
    containerClass: "bg-destructive/5 border-destructive/10",
  },
};

export function AlertCard({
  variant = "info",
  title,
  description,
  dismissible = false,
  onDismiss,
  className,
}: AlertCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-6 relative",
        config.containerClass,
        className
      )}
    >
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}

      <IconWrapper variant={config.iconVariant} size="md">
        <Icon size={20} />
      </IconWrapper>

      <div className="flex-1 min-w-0">
        <Text variant="subheading">{title}</Text>
        {description && (
          <Text variant="caption" className="mt-1">{description}</Text>
        )}
      </div>
    </motion.div>
  );
}
