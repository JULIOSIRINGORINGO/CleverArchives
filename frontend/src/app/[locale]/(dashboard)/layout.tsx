"use client";

import StandardLayout from '@/components/layout/StandardLayout';

export default function AuthenticatedDashboardLayout({ children }: { children: React.ReactNode }) {
  return <StandardLayout>{children}</StandardLayout>;
}
