import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { 
  HighlightCardRoot, 
  HighlightIconBox, 
  HighlightTitle, 
  HighlightDescription, 
  HighlightActionBtn 
} from "./_components/HighlightCardAesthetics";

interface HighlightCardProps {
  title: string | React.ReactNode;
  description: string;
  icon: LucideIcon;
  action: {
    label: string;
    href: string;
  };
  variant?: "primary" | "secondary" | "success" | "warning";
}

/**
 * HighlightCard — A high-impact CTA card for the dashboard.
 * Strictly follows SOP v5.6.0 with isolated aesthetics and Zero ClassName.
 */
export function HighlightCard({
  title,
  description,
  icon: Icon,
  action,
  variant = "primary",
}: HighlightCardProps) {
  return (
    <HighlightCardRoot variant={variant}>
      <HighlightIconBox>
        <Icon size={20} />
      </HighlightIconBox>
      
      <HighlightTitle>
        {title}
      </HighlightTitle>
      
      <HighlightDescription>
        {description}
      </HighlightDescription>
      
      <Link href={action.href}>
        <HighlightActionBtn label={action.label} />
      </Link>
    </HighlightCardRoot>
  );
}
