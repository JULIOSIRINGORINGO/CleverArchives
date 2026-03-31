"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function MasterDataRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  useEffect(() => {
    router.replace(`/${locale}/master-data/fields`);
  }, [router, locale]);

  return null;
}
