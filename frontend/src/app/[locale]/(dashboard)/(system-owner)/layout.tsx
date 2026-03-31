"use client";

import StandardLayout from '@/components/layout/StandardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SystemOwnerSkeleton from '@/components/skeletons/SystemOwnerSkeleton';

export default function SystemOwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && user.role.name === 'system_owner') {
        setIsReady(true);
      } else if (user) {
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [user, loading, router, locale]);

  if (!isReady) return <SystemOwnerSkeleton />;

  return <>{children}</>;
}
