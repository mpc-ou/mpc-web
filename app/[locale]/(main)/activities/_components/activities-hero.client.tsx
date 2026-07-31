"use client";

import { PageHero } from "@/components/custom/page-hero.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

export function EventsHeroClient({ title, subtitle }: { title: string; subtitle: string }) {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });

  return <PageHero badge='ACTIVITIES & ENGAGEMENT' description={subtitle} imageUrl='/images/bg/cn.jpg' title={title} />;
}
