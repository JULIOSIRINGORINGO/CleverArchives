"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DESIGN } from "@/config/design-system";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

/**
 * EmptyState - A premium, centered 'No Results' component.
 * Used consistently across the dashboard for search/filter empty states.
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  className,
  action 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-10 md:py-16 px-6 text-center gap-4 animate-in zoom-in duration-500 bg-card/5 rounded-[2rem] border border-dashed border-border/20 w-full",
      className
    )}>
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-muted/5 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-700">
        <Icon size={DESIGN.STYLING.EMPTY_ICON || 24} strokeWidth={1.5} className="text-muted-foreground/30" />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm md:text-base font-bold tracking-tight text-slate-600">{title}</h3>
        <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground/40 italic max-w-[200px] mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <div className="mt-1">
          {action.href ? (
            <Link href={action.href}>
              <Button className="rounded-2xl h-11 px-7 font-bold text-xs shadow-lg shadow-primary/10 transition-all active:scale-95">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              className="rounded-2xl h-11 px-7 font-bold text-xs border-border/30 hover:bg-muted/20 transition-all active:scale-95"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
