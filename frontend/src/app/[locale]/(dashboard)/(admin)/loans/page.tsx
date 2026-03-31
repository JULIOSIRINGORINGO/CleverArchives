import { redirect } from "next/navigation";

export default function LoansRootPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}/loans/active`);
}
