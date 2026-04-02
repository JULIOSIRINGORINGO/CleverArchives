"use client";

import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  onClose: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    className: "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20",
    iconClassName: "text-white",
  },
  error: {
    icon: AlertCircle,
    className: "bg-rose-500 text-white border-rose-600 shadow-rose-500/20",
    iconClassName: "text-white",
  },
  info: {
    icon: Info,
    className: "bg-primary text-white border-primary-dark shadow-primary/20",
    iconClassName: "text-white",
  },
};

const Toast = ({ id, message, variant = "info", onClose }: ToastProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border shadow-lg min-w-[300px] max-w-md pointer-events-auto",
        config.className
      )}
    >
      <div className={cn("shrink-0", config.iconClassName)}>
        <Icon size={20} />
      </div>
      <p className="flex-1 text-sm font-bold">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<{ id: string; message: string; variant?: ToastVariant }[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
