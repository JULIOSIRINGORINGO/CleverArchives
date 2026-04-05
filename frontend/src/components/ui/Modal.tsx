"use client";

import { useEffect, useCallback, ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
  variant?: 'xl' | 'lg' | 'md' | 'sm' | 'flush' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'max-w-2xl';
  overflow?: 'hidden' | 'auto' | 'visible';
}

const variantStyles: Record<string, string> = {
  xl: "max-w-4xl rounded-[2.5rem] p-0 border border-border/20 bg-gradient-to-b from-white to-slate-50/30",
  lg: "max-w-2xl rounded-[2rem]",
  md: "max-w-lg rounded-3xl",
  sm: "max-w-md rounded-2xl",
  flush: "p-0 rounded-none border-none",
  none: "",
};

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  className,
  closeOnOutsideClick = true,
  variant = 'md',
  padding,
  maxWidth,
  overflow = 'hidden'
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOutsideClick ? onClose : undefined}
            className="fixed inset-0 bg-black/60"
          />


          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={cn(
              "relative z-10 w-full bg-white outline-none",
              variantStyles[variant],
              padding === 'none' && "p-0",
              padding === 'sm' && "p-4",
              padding === 'md' && "p-6",
              padding === 'lg' && "p-8",
              maxWidth === 'sm' && "max-w-sm",
              maxWidth === "md" && "max-w-md",
              maxWidth === "lg" && "max-w-lg",
              maxWidth === "xl" && "max-w-xl",
              maxWidth === "2xl" && "max-w-2xl",
              maxWidth === "3xl" && "max-w-3xl",
              maxWidth === "4xl" && "max-w-4xl",
              overflow === 'hidden' && "overflow-hidden",
              overflow === 'auto' && "overflow-auto",
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
