"use client";

import { useTranslations } from "next-intl";
import { 
  WelcomeContainer, 
  GreetingText, 
  UserNameText 
} from "./_components/WelcomeHeaderAesthetics";

interface WelcomeHeaderProps {
  name?: string | null;
}

/**
 * WelcomeHeader — Premium cursive welcome greeting for dashboard headers.
 * Strictly follows SOP v5.6.0 with isolated aesthetics and Zero ClassName.
 */
export function WelcomeHeader({ name = "Member" }: WelcomeHeaderProps) {
  const t = useTranslations("Dashboard");
  
  // Format welcome text: e.g. "Selamat Datang Kembali,"
  const welcomeBaseText = t("welcome", { name: "" }).replace('!', '').trim();

  return (
    <WelcomeContainer>
      <GreetingText>
        {welcomeBaseText}
      </GreetingText>
      <UserNameText>
        {name || "Member"}!
      </UserNameText>
    </WelcomeContainer>
  );
}
