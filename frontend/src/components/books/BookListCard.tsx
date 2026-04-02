"use client";

import { LucideIcon, ArrowUpRight, BookOpen } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface BookListCardProps {
  coverUrl?: string;
  title: string;
  author: string;
  status: string;
  metadata: {
    label: string;
    value: string;
    icon: LucideIcon;
    iconColor?: string;
  }[];
  action?: React.ReactNode;
  className?: string;
  isCompact?: boolean;
  typeIcon?: LucideIcon;
  typeLabel?: string;
}

/**
 * BookListCard - A standardized horizontal card for book lists (History, Borrowed).
 * Ensures consistency across the dashboard and avoids "manual" design repeating.
 */
export function BookListCard({
  coverUrl,
  title,
  author,
  status,
  metadata,
  action,
  className,
  isCompact = false,
  typeIcon: TypeIcon,
  typeLabel
}: BookListCardProps) {
  if (isCompact) {
    return (
      <div className={cn(
        "group/card flex items-center gap-6 py-2.5 px-5 bg-white border border-border/10 rounded-xl transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow",
        className
      )}>
        {/* Compact Type Icon */}
        {TypeIcon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover/card:scale-110">
            <TypeIcon size={16} strokeWidth={2.5} />
          </div>
        )}

        {/* 1-Line Table Row */}
        <div className="flex-1 flex items-center justify-between gap-6 min-w-0">
          <div className="flex items-center gap-4 flex-[1.5] min-w-0">
             <div className="min-w-0 shrink-0">
               <h4 className="text-sm font-bold text-slate-800 leading-none whitespace-nowrap tracking-tight">{title}</h4>
               <p className="text-xs text-slate-500 font-medium italic mt-0.5 truncate opacity-90">{author}</p>
             </div>
          </div>

          <div className="flex items-center justify-end gap-10 shrink-0 flex-1">
            <div className="hidden lg:flex items-center gap-8">
              {metadata.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 text-indigo-600")}>
                    <item.icon size={12} strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-none whitespace-nowrap">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-6">
              <StatusBadge status={status} className="scale-90 origin-right transition-transform group-hover/card:scale-100" />
              {action && <div className="scale-90 origin-right -ml-2">{action}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard View (Ultra-Precise Spacing)
  return (
    <div className={cn(
      "group/card flex items-center gap-4 p-4 sm:p-5 bg-white border border-border/10 rounded-xl transition-all duration-300 relative overflow-hidden h-fit shadow-sm hover:shadow-xl",
      className
    )}>
      {/* Type Indicator + Book Cover Container */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Integrated Type Icon */}
        {TypeIcon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm border border-primary/5 transition-transform group-hover/card:scale-110">
            <TypeIcon size={20} strokeWidth={2.5} />
          </div>
        )}

        <div className="w-16 sm:w-18 aspect-[3.2/4] bg-muted/40 rounded-xl overflow-hidden shrink-0 border border-border/20 transition-transform duration-700 group-hover/card:scale-105">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <BookOpen size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Tight Content Section with Large Readability */}
      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="md:w-[40%]">
          <h4 className="text-base font-bold text-slate-900 leading-tight tracking-tight group-hover/card:text-primary transition-colors duration-300 line-clamp-1">
            {title}
          </h4>
          <p className="text-sm text-slate-500 font-medium italic truncate">
            {author}
          </p>
        </div>

        <div className="flex-1 flex flex-wrap items-center gap-x-8 gap-y-1">
          {metadata.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 leading-none tracking-tight mb-1">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <item.icon size={12} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={cn(
          "flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end pl-4 h-11",
          status && action && "border-l border-border/10"
        )}>
          {status && <StatusBadge status={status} className={cn("scale-100", action && "hidden sm:flex")} />}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * Static Skeleton for consistent loading states across pages.
 */
BookListCard.Skeleton = function BookListCardSkeleton({ count = 3, isCompact = false }: { count?: number; isCompact?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-4", !isCompact && "pt-6 pb-12")}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "bg-white animate-pulse border border-border/10 shadow-sm",
            isCompact ? "h-14 rounded-xl" : "h-32 rounded-[2.2rem]"
          )} 
        />
      ))}
    </div>
  );
};
