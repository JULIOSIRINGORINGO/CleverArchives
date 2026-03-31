"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertOctagon, Info, Check, Loader2, LucideIcon } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertOctagon,
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    btnVariant: "danger" as const
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    btnVariant: "primary" as const
  },
  info: {
    icon: Info,
    iconColor: "text-[--color-primary]",
    bgColor: "bg-blue-50",
    btnVariant: "primary" as const
  }
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Ya, Lakukan",
  cancelLabel = "Batal",
  variant = "info",
  isLoading = false
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-md"
      closeOnOutsideClick={variant !== "danger"}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-border bg-gray-50/50">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border",
            config.bgColor,
            config.iconColor
          )}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-6 py-8">
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-gray-50/50">
          <Button
            variant="ghost"
            className="px-4 rounded-xl h-10 font-bold"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.btnVariant}
            className="px-6 rounded-xl h-10 font-bold shadow-sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
