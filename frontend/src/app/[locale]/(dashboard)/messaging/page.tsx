import { redirect } from "next/navigation";

export default function MessagingPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}/messaging/internal`);
}
