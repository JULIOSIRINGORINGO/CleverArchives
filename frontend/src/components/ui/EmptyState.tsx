"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
      "flex flex-col items-center justify-center py-32 px-6 text-center gap-6 animate-in zoom-in duration-500 bg-card/20 rounded-[3rem] border border-dashed border-border/40 shadow-inner group w-full",
      className
    )}>
      <div className="w-24 h-24 rounded-[2.5rem] bg-muted/10 flex items-center justify-center shadow-inner group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700">
        <Icon size={48} strokeWidth={1} className="text-muted-foreground/30" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-xs font-medium text-muted-foreground/40 italic max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <div className="mt-2">
          {action.href ? (
            <Link href={action.href}>
              <Button className="rounded-2xl h-12 px-8 font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              className="rounded-2xl h-12 px-8 font-bold text-xs border-border/40 hover:bg-muted/30 transition-all active:scale-95"
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
