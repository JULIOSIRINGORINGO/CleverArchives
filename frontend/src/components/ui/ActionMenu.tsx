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
import { IconWrapper, AppIconName } from "./IconWrapper";
import { cn } from "@/lib/utils";

/**
 * ActionMenuItem - Struktur data untuk setiap baris di menu aksi.
 */
export interface ActionMenuItem {
  label: string;
  icon?: AppIconName;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: AppIconName | LucideIcon;
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
  triggerIcon,
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
          {typeof triggerIcon === 'string' ? (
            <IconWrapper icon={triggerIcon} size="xs" isGhost />
          ) : triggerIcon ? (
            React.createElement(triggerIcon as LucideIcon, { size: 18 })
          ) : (
            <IconWrapper icon="more" size="xs" isGhost />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} width="auto" className="min-w-[200px]">
        {items.map((item, index) => {
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
              {item.icon && (
                <IconWrapper 
                  icon={item.icon} 
                  size="xs" 
                  isGhost 
                  color={isDanger ? "destructive" : "primary"}
                  className="mr-2"
                />
              )}
              <Text 
                variant="subheading" 
                weight="medium"
                whiteSpace="nowrap"
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
