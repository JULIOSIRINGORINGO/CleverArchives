"use client";

import React from "react";
import { useCartDomain } from "@/hooks/useCartDomain";
import CartMainView from "./_components/CartMainView";

import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";

export default function CartPage() {
  const {
    searchProps,
    confirmationProps,
    alertProps
  } = useCartDomain();

  return (
    <DashboardPage hideHeader hideScroll>
      <DashboardSection layout="full" spaced>
        <CartMainView
          searchProps={searchProps}
          confirmationProps={confirmationProps}
          alertProps={alertProps}
        />
      </DashboardSection>
    </DashboardPage>
  );
}
