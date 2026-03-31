"use client";

import StandardLayout from '@/components/layout/StandardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TenantOwnerSkeleton from '@/components/skeletons/TenantOwnerSkeleton';

export default function TenantOwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && user.role.name === 'tenant_owner') {
        setIsReady(true);
      } else if (user) {
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [user, loading, router, locale]);

  if (!isReady) return <TenantOwnerSkeleton />;

  return <>{children}</>;
}
