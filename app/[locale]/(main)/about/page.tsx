import type { Metadata } from "next";

import { Suspense } from "react";
import { getAboutPageData } from "@/app/[locale]/actions";
import { LoadingComponent } from "@/components/custom/Loading";
import departmentsData from "@/configs/data/departments.json";
import type { locale } from "@/types/global";
import { generatePageSeo } from "@/utils/seo";

import { BenefitsSection } from "../benefits-section";
import { FaqSection } from "../faq-section";
import { RecentEventsSection } from "../recent-events";
import { StatsSection } from "../stats-section";
import { AboutClient } from "./client";

type PageType = {
  params: Promise<{ locale: locale }>;
};

export async function generateMetadata({
  params,
}: PageType): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "about",
    locale,
    pathname: "/about",
  });
}

export default async function AboutPage({
  params,
}: PageType): Promise<React.ReactNode> {
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
      linkLabel: localeData.linkLabel,
    };
  });

  return (
    <AboutClient
      benefitsSection={<BenefitsSection locale={locale as any} />}
      faqSection={
        <div className="border-border border-t">
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
        <div className="border-border border-t bg-muted/30">
          <Suspense fallback={<LoadingComponent />}>
            <StatsSection locale={locale as any} />
          </Suspense>
        </div>
      }
    />
  );
}
