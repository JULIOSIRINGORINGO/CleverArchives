"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useCartDomain } from "@/hooks/useCartDomain";
import CartMainView from "./_components/CartMainView";

import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";

export default function CartPage() {
  const tCommon = useTranslations("Navigation");
  const {
    searchProps,
    confirmationProps,
    alertProps
  } = useCartDomain();

  return (
    <DashboardPage hideHeader={true} hideScroll>
      <DashboardSection layout="full" fullHeight>
        <CartMainView
          searchProps={searchProps}
          confirmationProps={confirmationProps}
          alertProps={alertProps}
        />
      </DashboardSection>
    </DashboardPage>
  );
}
