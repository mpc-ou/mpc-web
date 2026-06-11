import type { Metadata } from "next";
import { Suspense } from "react";
import { getAboutPageData, getDepartmentsPageData } from "@/app/_actions/main";
import { LoadingComponent } from "@/components/custom/loading";
import type { locale } from "@/types/global";
import { generatePageSeo } from "@/utils/seo";

import { BenefitsSection } from "../_components/benefits-section";
import { FaqSection } from "../_components/faq-section";
import { ManagementSection } from "../_components/management-section";
import { RecentEventsSection } from "../_components/recent-events";
import { StatsSection } from "../_components/stats-section";
import { AboutClient } from "./client";

type PageType = {
  params: Promise<{ locale: locale }>;
};

export async function generateMetadata({ params }: PageType): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "about",
    locale,
    pathname: "/about"
  });
}

export default async function AboutPage({ params }: PageType): Promise<React.ReactNode> {
  const { locale } = await params;

  const { data } = await getAboutPageData();
  const payload = data?.payload as { topMembers: any[] } | undefined;
  const serializedTopMembers = payload?.topMembers ?? [];

  const deptRes = await getDepartmentsPageData();
  const dbDepartments = (deptRes.data?.payload as { departments: any[] })?.departments ?? [];

  const localizedDepartments = dbDepartments.map((dept: any) => ({
    id: dept.slug,
    icon: dept.icon,
    bgImage: dept.bgImage,
    link: dept.hyperlink || undefined,
    name: locale === "en" ? dept.nameEn || dept.nameVi : dept.nameVi,
    description: locale === "en" ? dept.descriptionEn || dept.descriptionVi : dept.descriptionVi,
    missions: locale === "en" ? dept.missionsEn || dept.missionsVi : dept.missionsVi,
    linkLabel: locale === "en" ? dept.linkLabelEn || dept.linkLabelVi : dept.linkLabelVi
  }));

  return (
    <AboutClient
      benefitsSection={<BenefitsSection compact={true} locale={locale as any} />}
      faqSection={
        <div className='border-border border-t'>
          <FaqSection locale={locale as any} target='ABOUT' />
        </div>
      }
      locale={locale}
      localizedDepartments={localizedDepartments}
      managementSection={
        <Suspense fallback={<LoadingComponent />}>
          <ManagementSection locale={locale} />
        </Suspense>
      }
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
