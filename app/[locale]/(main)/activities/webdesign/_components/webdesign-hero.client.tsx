"use client";

import { PageHero } from "@/components/custom/page-hero.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

export function WebDesignHeroClient({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff",
  });

  return (
    <PageHero
      badge="FRONTEND CHALLENGE"
      description={subtitle}
      imageUrl="/images/bg/about.png"
      title={title}
    />
  );
}
