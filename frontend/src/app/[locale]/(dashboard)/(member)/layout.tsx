"use client";

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import AuthGuard from '@/components/auth/AuthGuard';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
