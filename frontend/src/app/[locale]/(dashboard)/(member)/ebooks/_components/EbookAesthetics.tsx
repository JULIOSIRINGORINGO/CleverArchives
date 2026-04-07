"use client";

import React from "react";
import { DashboardSection } from "@/components/layout/DashboardSection";

/**
 * EbookMainSection - Level 2 Aesthetic Wrapper.
 * Encapsulates feature-specific spacing (pt-6) to ensure 
 * the main orchestrator remains Zero ClassName.
 */
export const EbookMainSection = ({ children }: { children: React.ReactNode }) => (
  <DashboardSection 
    layout="full" 
    spaced 
    className="pt-6" // Encapsulated here
  >
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
