"use client";

import { useAuth } from "@/contexts/AuthContext";
import MemberDashboard from "@/components/dashboard/MemberDashboard";
import SystemOwnerDashboard from "@/components/dashboard/SystemOwnerDashboard";
import TenantOwnerDashboard from "@/components/dashboard/TenantOwnerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import MemberDashboardSkeleton from "@/components/skeletons/MemberDashboardSkeleton";
import AdminDashboardSkeleton from "@/components/skeletons/AdminDashboardSkeleton";

export default function DashboardDispatcher() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a generic skeleton while auth state is restoring
    return <MemberDashboardSkeleton />;
  }

  const role = user?.role?.name;

  if (role === "system_owner") {
    return <SystemOwnerDashboard />;
  }

  if (role === "tenant_owner") {
    return <TenantOwnerDashboard />;
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }

  // Default for member
  return <MemberDashboard />;
}

