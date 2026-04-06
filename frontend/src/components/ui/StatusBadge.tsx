"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  Clock, CheckCircle2, RotateCcw, AlertCircle, 
  HelpCircle, Mail, MessageSquare, FileText, LucideIcon 
} from "lucide-react";
import { Text } from "./Text";

/**
 * Robust Status Config - Defined locally to prevent import/purge issues.
 */
const CONFIGS: Record<string, { label: string, bg: string, text: string, icon: LucideIcon }> = {
  // Borrowing
  request: { label: "status_request", bg: "bg-amber-500", text: "text-white", icon: Clock },
  pending: { label: "status_pending", bg: "bg-amber-600", text: "text-white", icon: Clock },
  pending_approval: { label: "status_pending", bg: "bg-amber-600", text: "text-white", icon: Clock },
  menunggu_persetujuan: { label: "status_pending", bg: "bg-amber-600", text: "text-white", icon: Clock },
  
  available: { label: "status_available", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
  tersebab: { label: "status_available", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
  unavailable: { label: "status_borrowed", bg: "bg-rose-500", text: "text-white", icon: AlertCircle },
  
  borrowed: { label: "status_borrowed", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
  active: { label: "status_borrowed", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
  sedang_dipinjam: { label: "status_borrowed", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
  
  returning: { label: "status_returning", bg: "bg-indigo-500", text: "text-white", icon: RotateCcw },
  return_pending: { label: "status_returning", bg: "bg-indigo-500", text: "text-white", icon: RotateCcw },
  menunggu_kembali: { label: "status_returning", bg: "bg-indigo-500", text: "text-white", icon: RotateCcw },
  
  overdue: { label: "status_overdue", bg: "bg-rose-500", text: "text-white", icon: AlertCircle },
  terlambat: { label: "status_overdue", bg: "bg-rose-500", text: "text-white", icon: AlertCircle },
  
  returned: { label: "status_returned", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
  completed: { label: "status_completed", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
  
  cancelled: { label: "status_cancelled", bg: "bg-zinc-950", text: "text-white", icon: RotateCcw },
  canceled: { label: "status_cancelled", bg: "bg-zinc-950", text: "text-white", icon: RotateCcw },
  dibatalkan: { label: "status_cancelled", bg: "bg-zinc-950", text: "text-white", icon: RotateCcw },
  batal: { label: "status_cancelled", bg: "bg-zinc-950", text: "text-white", icon: RotateCcw },
  
  rejected: { label: "status_rejected", bg: "bg-rose-600", text: "text-white", icon: AlertCircle },
  ditolak: { label: "status_rejected", bg: "bg-rose-600", text: "text-white", icon: AlertCircle },

  // Ebooks & Metadata
  pdf: { label: "PDF", bg: "bg-indigo-600", text: "text-white", icon: FileText },
  epub: { label: "EPUB", bg: "bg-blue-600", text: "text-white", icon: FileText },
  filesize: { label: "filesize", bg: "bg-slate-100", text: "text-slate-600", icon: Clock },

  // Messages
  new: { label: "status_new", bg: "bg-amber-500", text: "text-white", icon: Mail },
  in_progress: { label: "status_in_progress", bg: "bg-blue-500", text: "text-white", icon: Clock },
  staff_reply: { label: "status_staff_reply", bg: "bg-indigo-500", text: "text-white", icon: MessageSquare },
  closed: { label: "status_closed", bg: "bg-emerald-500", text: "text-white", icon: CheckCircle2 },
};

export function StatusBadge({ 
  status, 
  label, 
  className, 
  showIcon = true
}: { 
  status: string, 
  label?: string, 
  className?: string, 
  showIcon?: boolean
}) {
  const t = useTranslations("Common");
  const key = (status || "unknown").toLowerCase().replace(/\s+/g, '_');
  const config = CONFIGS[key];

  if (!config) {
    return (
      <div className={cn(
        "inline-flex items-center justify-center gap-1.5 px-4 h-7 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap bg-slate-500 text-white",
        className
      )}>
        {showIcon && <HelpCircle size={12} strokeWidth={3} />}
        <span className="leading-none">{label || status || "???"}</span>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center justify-center gap-1.5 px-3 h-7 rounded-full shadow-sm transition-all border border-black/5 whitespace-nowrap shrink-0",
      config.bg, 
      config.text,
      className
    )}>
      {showIcon && <Icon size={11} strokeWidth={3} />}
      <Text 
        variant="label-xs" 
        className="leading-none text-current"
      >
        {label || t(config.label) || key.replace(/_/g, ' ')}
      </Text>
    </div>
  );
}
