"use client";

import React from "react";
import { DashboardSection } from "@/components/layout/DashboardSection";

/**
 * EbookMainSection - Level 2 Aesthetic Wrapper.
 * Encapsulates feature-specific spacing to ensure 
 * the main orchestrator remains Zero ClassName.
 */
export const EbookMainSection = ({ children }: { children: React.ReactNode }) => (
  <DashboardSection>
    {children}
  </DashboardSection>
);

/**
 * EbookGrid - Standardized grid for ebooks.
 */
export const EbookGrid = ({ children }: { children: React.ReactNode }) => (
  <DashboardSection layout="book-grid">
    {children}
  </DashboardSection>
);
