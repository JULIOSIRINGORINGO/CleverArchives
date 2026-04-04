"use client";

import React from "react";
import { MoreVertical, LucideIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "./DropdownMenu";
import { Button } from "./Button";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

/**
 * ActionMenuItem - Struktur data untuk setiap baris di menu aksi.
 */
export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: LucideIcon;
  triggerVariant?: "ghost" | "secondary" | "outline";
  align?: "start" | "end" | "center";
  className?: string;
}

/**
 * ActionMenu - Komponen Primitive untuk 'Tiga Titik' (Meatball Menu).
 * Sentralisasi cara kita memanggil menu aksi di seluruh aplikasi.
 */
export function ActionMenu({ 
  items, 
  triggerIcon: TriggerIcon = MoreVertical,
  triggerVariant = "ghost",
  align = "end",
  className 
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={triggerVariant} 
          size="icon" 
          rounded="xl" 
          className={cn("shrink-0", className)}
        >
          <TriggerIcon size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[160px]">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isDanger = item.variant === "danger";

          return (
             <DropdownMenuItem 
              key={`${item.label}-${index}`}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                isDanger && "text-destructive focus:text-destructive focus:bg-destructive-foreground/5"
              )}
            >
              {Icon && (
                <Icon 
                  size={16} 
                  className={cn(
                    "mr-2",
                    isDanger ? "text-destructive" : "text-muted-foreground"
                  )} 
                />
              )}
              <Text 
                variant="body" 
                weight="medium"
                className={cn(isDanger && "text-destructive")}
              >
                {item.label}
              </Text>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
