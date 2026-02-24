import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Suspense } from "react";
import { getAboutPageData } from "@/app/[locale]/actions";
import { LoadingComponent } from "@/components/custom/Loading";
import departmentsData from "@/configs/data/departments.json";
import type { locale } from "@/types/global";

import { BenefitsSection } from "../benefits-section";
import { FaqSection } from "../faq-section";
import { RecentEventsSection } from "../recent-events";
import { StatsSection } from "../stats-section";
import { AboutClient } from "./client";

type PageType = {
  params: Promise<{ locale: locale }>;
};

export async function generateMetadata({ params }: PageType): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: `Về chúng tôi | ${t("metadata.siteName")}`,
    description: "Câu lạc bộ Lập trình trên thiết bị di động (MPC)"
  };
}

export default async function AboutPage({ params }: PageType) {
  const { locale } = await params;

  const { data } = await getAboutPageData();
  const payload = data?.payload as { topMembers: any[] } | undefined;
  const serializedTopMembers = payload?.topMembers ?? [];

  const localizedDepartments = departmentsData.map((dept: any) => {
    const localeData = dept[locale as keyof typeof dept] || dept.vi;
    return {
      id: dept.id,
      icon: dept.icon,
      bgImage: dept.bgImage,
      link: dept.link,
      name: localeData.name,
      description: localeData.description,
      missions: localeData.missions,
      linkLabel: localeData.linkLabel
    };
  });

  return (
    <AboutClient
      benefitsSection={<BenefitsSection locale={locale as any} />}
      faqSection={
        <div className='border-border border-t'>
          <FaqSection locale={locale as any} />
        </div>
      }
      locale={locale}
      localizedDepartments={localizedDepartments}
      recentEventsSection={
        <Suspense fallback={<LoadingComponent />}>
          <RecentEventsSection />
        </Suspense>
      }
      serializedTopMembers={serializedTopMembers}
      statsSection={
        <div className='border-border border-t bg-muted/30'>
          <Suspense fallback={<LoadingComponent />}>
            <StatsSection locale={locale as any} />
          </Suspense>
        </div>
      }
    />
  );
}
