"use client";

import { useTranslations } from "next-intl";
import { PageHero } from "@/components/custom/page-hero.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

export function MembersHeroClient() {
  const t = useTranslations("membersPage.hero");
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });

  return (
    <PageHero
      badge={t("badge")}
      codeTitle='member.ts'
      description={t("description")}
      imageUrl='/images/bg/members.jpg'
      title={t("title")}
    />
  );
}
