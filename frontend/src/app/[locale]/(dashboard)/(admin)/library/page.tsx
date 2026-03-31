"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function LibraryRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  
  useEffect(() => {
    router.replace(`/${locale}/book-catalog`);
  }, [router, locale]);
  
  return null;
}
