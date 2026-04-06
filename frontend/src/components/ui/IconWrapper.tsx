import * as React from "react";
import { 
  Hash, Calendar, Building2, BookOpen, Clock, Check, AlertCircle, X, ChevronRight, ArrowUpRight, Search, Bookmark,
  Shield, Send, Paperclip, MessageSquare, FileText, Trash2, MoreVertical, ArrowLeft, ChevronLeft, Mail, Download, CheckCheck, Bell, Plus, Loader2, Layers, User, RotateCcw,
  History, CheckCircle2, ArrowRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Domain-specific icon names to decouple features from the icon library.
 */
export const ICON_REGISTRY = {
  shelf: Hash,
  year: Calendar,
  publisher: Building2,
  isbn: BookOpen,
  time: Clock,
  success: Check,
  error: AlertCircle,
  close: X,
  next: ChevronRight,
  details: ArrowUpRight,
  search: Search,
  bookmark: Bookmark,
  shield: Shield,
  send: Send,
  mail: Mail,
  attachment: Paperclip,
  paperclip: Paperclip,
  message: MessageSquare,
  "file-text": FileText,
  trash: Trash2,
  more: MoreVertical,
  "arrow-left": ArrowLeft,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  calendar: Calendar,
  download: Download,
  "check-all": CheckCheck,
  notification: Bell,
  plus: Plus,
  loader: Loader2,
  layers: Layers,
  user: User,
  rotate: RotateCcw,
  history: History,
  "check-circle": CheckCircle2,
  "arrow-right": ArrowRight,
  sparkles: Sparkles,
} as const;

export type AppIconName = keyof typeof ICON_REGISTRY;

type IconWrapperVariant = "primary" | "warning" | "danger" | "success" | "muted" | "white" | "primary-solid";
type IconWrapperSize = "sm" | "md" | "lg" | "xl" | "xs";
type IconPreset = "security-note" | "send-message" | "attachment-clip";

interface IconWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: IconWrapperVariant;
  size?: IconWrapperSize;
  icon?: AppIconName;
  preset?: IconPreset;
  isGhost?: boolean;
  opacity?: "20" | "40" | "50" | "60" | "100";
  color?: "emerald" | "amber" | "destructive" | "primary" | "white";
}

const variantStyles: Record<IconWrapperVariant, string> = {
  primary: "bg-[--color-primary]/10 text-[--color-primary]",
  "primary-solid": "bg-[--color-primary] text-white shadow-sm shadow-primary/20",
  warning: "bg-[--color-warning]/10 text-[--color-warning]",
  danger: "bg-[--color-danger]/10 text-[--color-danger]",
  success: "bg-[--color-success]/10 text-[--color-success]",
  muted: "bg-muted text-muted-foreground",
  white: "bg-white/10 text-white border border-white/10 shadow-sm backdrop-blur-sm",
};

const sizeStyles: Record<IconWrapperSize, string> = {
  xs: "w-7 h-7 rounded-lg",
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-2xl",
  lg: "w-14 h-14 rounded-3xl",
  xl: "w-20 h-20 rounded-full",
};

const ICON_PRESETS: Record<IconPreset, Partial<IconWrapperProps>> = {
  "security-note": { icon: "shield", color: "emerald", opacity: "40", isGhost: true },
  "send-message": { icon: "send", size: "xs", isGhost: true, color: "primary" },
  "attachment-clip": { icon: "paperclip", opacity: "40", isGhost: true },
};

const IconWrapper = React.forwardRef<HTMLDivElement, IconWrapperProps>(
  ({ variant = "primary", size = "md", className, children, icon, preset, isGhost, opacity, color, ...props }, ref) => {
    const presetProps = preset ? ICON_PRESETS[preset] : {};
    const finalIcon = (icon || presetProps.icon) as AppIconName;
    const finalSize = (presetProps.size || size) as IconWrapperSize;
    const finalVariant = (presetProps.variant || variant) as IconWrapperVariant;
    const finalIsGhost = presetProps.isGhost !== undefined ? presetProps.isGhost : isGhost;
    const finalOpacity = presetProps.opacity || opacity;
    const finalColor = presetProps.color || color;

    const Icon = finalIcon ? ICON_REGISTRY[finalIcon] : null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center shrink-0",
          finalColor === "white" && "text-white",
        !finalIsGhost && variantStyles[finalVariant],
          !finalIsGhost && sizeStyles[finalSize],
          finalOpacity === "20" && "opacity-20",
          finalOpacity === "40" && "opacity-40",
          finalOpacity === "50" && "opacity-50",
          finalOpacity === "60" && "opacity-60",
          finalColor === "emerald" && "text-[--color-success]",
          finalColor === "amber" && "text-[--color-warning]",
          finalColor === "destructive" && "text-[--color-danger]",
          finalColor === "primary" && "text-[--color-primary]",
          className
        )}
        {...props}
      >
        {Icon ? <Icon size={finalSize === 'xl' ? 40 : finalSize === 'lg' ? 24 : finalSize === 'sm' || finalSize === 'xs' ? 14 : 18} strokeWidth={finalSize === 'xl' ? 1 : 2.5} /> : children}
      </div>
    );
  }
);
IconWrapper.displayName = "IconWrapper";

export { IconWrapper };
export type { IconWrapperVariant, IconWrapperSize };
