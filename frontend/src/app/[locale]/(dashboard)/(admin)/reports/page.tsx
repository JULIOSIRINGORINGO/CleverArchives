"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ReportsRedirect() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    router.replace(`/${params?.locale || 'en'}/reports/loans`);
  }, [router, params]);
  
  return null;
}
