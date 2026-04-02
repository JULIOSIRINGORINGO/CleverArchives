"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface WelcomeHeaderProps {
  name?: string | null;
  className?: string;
}

/**
 * WelcomeHeader — Premium cursive welcome greeting for dashboard headers.
 * Encapsulates responsive sizing, font-family, and complex layout for the greeting.
 */
export function WelcomeHeader({ name = "Member", className }: WelcomeHeaderProps) {
  const t = useTranslations("Dashboard");
  
  // Format welcome text: e.g. "Selamat Datang Kembali,"
  const welcomeBaseText = t("welcome", { name: "" }).replace('!', '').trim();

  return (
    <span className={cn("flex items-center gap-3 select-none", className)}>
      <span className="font-cursive text-4xl text-primary drop-shadow-sm lowercase flex items-center pr-1">
        {welcomeBaseText}
      </span>
      <span className="font-cursive text-4xl text-slate-800 drop-shadow-sm">
        {name || "Member"}!
      </span>
    </span>
  );
}
