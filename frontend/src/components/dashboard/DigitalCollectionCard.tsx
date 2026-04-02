"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Clock } from "lucide-react";
import { HighlightCard } from "@/components/ui/HighlightCard";

/**
 * DigitalCollectionCard — Encapsulates the UI formatting and logic for the digital library teaser.
 * Removes <br/> and title splitting logic from the main dashboard page.
 */
export function DigitalCollectionCard() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  const title = t("digitalCollection").split(' ').map((word, index) => (
    <React.Fragment key={index}>
      {word}{index === 0 && <br/>}
    </React.Fragment>
  ));

  return (
    <HighlightCard 
      title={title}
      description={t("digitalAccess")}
      icon={Clock}
      action={{
        label: t("goToEbooks"),
        href: `/${locale}/ebooks`
      }}
      variant="primary"
    />
  );
}
