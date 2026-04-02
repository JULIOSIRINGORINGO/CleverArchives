import { 
  Clock, CheckCircle2, RotateCcw, AlertCircle, 
  Shield, MessageSquare, Mail, Bell, HelpCircle, LucideIcon 
} from "lucide-react";

export type StatusKey = 
  | 'request' | 'returning' | 'borrowed' | 'overdue' | 'returned' 
  | 'pending' | 'completed' | 'cancelled' | 'rejected'
  | 'new' | 'in_progress' | 'staff_reply' | 'user_reply' | 'closed';

export interface StatusConfig {
  labelKey: string;
  colorClass: string;
  icon: LucideIcon;
  bgClass: string;
  borderClass: string;
}

export const STATUS_REGISTRY: Record<string, StatusConfig> = {
  // Borrowing Statuses
  request: {
    labelKey: "status_request",
    colorClass: "text-white",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-600/20",
    icon: Clock
  },
  returning: {
    labelKey: "status_returning",
    colorClass: "text-white",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-600/20",
    icon: RotateCcw
  },
  return_pending: {
    labelKey: "status_returning",
    colorClass: "text-white",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-600/20",
    icon: RotateCcw
  },
  processing_return: {
    labelKey: "status_returning",
    colorClass: "text-white",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-600/20",
    icon: RotateCcw
  },
  borrowed: {
    labelKey: "status_borrowed",
    colorClass: "text-white",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-600/20",
    icon: CheckCircle2
  },
  active: {
    labelKey: "status_borrowed",
    colorClass: "text-white",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-600/20",
    icon: CheckCircle2
  },
  overdue: {
    labelKey: "status_overdue",
    colorClass: "text-white",
    bgClass: "bg-rose-500",
    borderClass: "border-rose-600/20",
    icon: AlertCircle
  },
  returned: {
    labelKey: "status_returned",
    colorClass: "text-white",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-600/20",
    icon: CheckCircle2
  },
  completed: {
    labelKey: "status_completed",
    colorClass: "text-white",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-600/20",
    icon: CheckCircle2
  },
  cancelled: {
    labelKey: "status_cancelled",
    colorClass: "text-white",
    bgClass: "bg-zinc-950",
    borderClass: "border-black",
    icon: RotateCcw
  },
  canceled: {
    labelKey: "status_cancelled",
    colorClass: "text-white",
    bgClass: "bg-zinc-950",
    borderClass: "border-black",
    icon: RotateCcw
  },
  cancel: {
    labelKey: "status_cancelled",
    colorClass: "text-white",
    bgClass: "bg-zinc-950",
    borderClass: "border-black",
    icon: RotateCcw
  },
  dibatalkan: {
    labelKey: "status_cancelled",
    colorClass: "text-white",
    bgClass: "bg-zinc-950",
    borderClass: "border-black",
    icon: RotateCcw
  },
  batal: {
    labelKey: "status_cancelled",
    colorClass: "text-white",
    bgClass: "bg-zinc-950",
    borderClass: "border-black",
    icon: RotateCcw
  },
  "sedang_dipinjam": {
    labelKey: "status_borrowed",
    colorClass: "text-white",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-600/20",
    icon: CheckCircle2
  },
  "menunggu_kembali": {
    labelKey: "status_returning",
    colorClass: "text-white",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-600/20",
    icon: RotateCcw
  },
  "terlambat": {
    labelKey: "status_overdue",
    colorClass: "text-white",
    bgClass: "bg-rose-500",
    borderClass: "border-rose-600/20",
    icon: AlertCircle
  },
  "sudah_kembali": {
    labelKey: "status_returned",
    colorClass: "text-white",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-600/20",
    icon: CheckCircle2
  },
  "ditolak": {
    labelKey: "status_rejected",
    colorClass: "text-white",
    bgClass: "bg-rose-600",
    borderClass: "border-rose-700/20",
    icon: AlertCircle
  },
  unknown: {
    labelKey: "status_unknown",
    colorClass: "text-white",
    bgClass: "bg-slate-500",
    borderClass: "border-slate-600/20",
    icon: HelpCircle
  },
  pending: {
    labelKey: "status_pending",
    colorClass: "text-white",
    bgClass: "bg-amber-600",
    borderClass: "border-amber-700/20",
    icon: Clock
  },
  pending_approval: {
    labelKey: "status_pending",
    colorClass: "text-white",
    bgClass: "bg-amber-600",
    borderClass: "border-amber-700/20",
    icon: Clock
  },
  menunggu_persetujuan: {
    labelKey: "status_pending",
    colorClass: "text-white",
    bgClass: "bg-amber-600",
    borderClass: "border-amber-700/20",
    icon: Clock
  },
  menunggu_konfirmasi: {
    labelKey: "status_pending",
    colorClass: "text-white",
    bgClass: "bg-amber-600",
    borderClass: "border-amber-700/20",
    icon: Clock
  },
  
  // Ticket / Message Statuses
  new: {
    labelKey: "status_new",
    colorClass: "text-white",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-600/20",
    icon: Mail
  },
  in_progress: {
    labelKey: "status_in_progress",
    colorClass: "text-white",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-600/20",
    icon: Clock
  },
  staff_reply: {
    labelKey: "status_staff_reply",
    colorClass: "text-white",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-600/20",
    icon: MessageSquare
  },
  closed: {
    labelKey: "status_closed",
    colorClass: "text-white",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-600/20",
    icon: CheckCircle2
  }
};
