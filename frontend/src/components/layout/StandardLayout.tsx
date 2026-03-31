"use client";

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { MaintenanceBanner } from '@/components/MaintenanceBanner';

export default function StandardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[--color-background] text-[--color-text] overflow-hidden fixed inset-0">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 overflow-hidden",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          <MaintenanceBanner />
          <Navbar />
          <main className="flex-1 px-4 md:px-6 pt-0 pb-0 overflow-hidden">
            <div className="w-full h-full flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
