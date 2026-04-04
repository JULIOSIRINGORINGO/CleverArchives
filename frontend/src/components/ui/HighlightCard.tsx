"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface HighlightCardProps {
  title: string | React.ReactNode;
  description: string;
  icon: LucideIcon;
  action: {
    label: string;
    href: string;
  };
  variant?: "primary" | "secondary" | "success" | "warning";
  className?: string;
  /** Custom background classes if none of the variants fit */
  backgroundClassName?: string;
}

const variantStyles: Record<string, string> = {
  primary: "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground",
  secondary: "bg-gradient-to-br from-slate-800 to-slate-900 text-white",
  success: "bg-gradient-to-br from-emerald-600 to-teal-500 text-white",
  warning: "bg-gradient-to-br from-amber-500 to-orange-400 text-white",
};

/**
 * HighlightCard — A high-impact CTA card for the dashboard.
 * Used for prominent features like 'Digital Collection', 'Premium Access', etc.
 */
export function HighlightCard({
  title,
  description,
  icon: Icon,
  action,
  variant = "primary",
  className,
  backgroundClassName,
}: HighlightCardProps) {
  return (
    <Card className={cn(
      "rounded-xl border border-border/40 p-6 relative overflow-hidden flex flex-col justify-end min-h-[300px]",
      backgroundClassName || variantStyles[variant],
      className
    )}>
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-white/10">
          <Icon size={20} className="text-white" />
        </div>
        
        <h3 className="text-xl font-bold leading-tight mb-2">
          {title}
        </h3>
        
        <p className="text-xs font-bold text-white/80 mb-5 max-w-[200px] leading-relaxed">
          {description}
        </p>
        
        <Link href={action.href}>
          <Button 
            size="sm" 
            variant="outline"
            className="w-full bg-white text-primary border-none hover:bg-white/90 rounded-lg h-9 font-bold shadow-sm transition-all"
          >
            {action.label}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
