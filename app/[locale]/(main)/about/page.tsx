import type { Metadata } from "next";
import { Suspense } from "react";
import { getAboutPageData, getActivitiesPageData, getDepartmentsPageData } from "@/app/_actions/main";
import { LoadingComponent } from "@/components/custom/loading";
import type { locale } from "@/types/global";
import { generatePageSeo } from "@/utils/seo";

import { BenefitsSection } from "../_components/benefits-section";
import { FaqSection } from "../_components/faq-section";
import { ManagementSection } from "../_components/management-section";
import { RecentEventsSection } from "../_components/recent-events";
import { StatsSection } from "../_components/stats-section";
import type { TopMember } from "./_components/top-members.client";
import { AboutClient } from "./client";

type DbDepartment = {
  slug: string;
  icon: string | null;
  bgImage: string | null;
  hyperlink: string | null;
  nameVi: string;
  nameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  missionsVi: string;
  missionsEn: string;
  linkLabelVi: string | null;
  linkLabelEn: string | null;
};

type DbActivity = {
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  frequencyVi: string | null;
  frequencyEn: string | null;
  thumbnail: string | null;
  hyperlink: string | null;
};

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
  const payload = data?.payload as { topMembers: TopMember[] } | undefined;
  const serializedTopMembers = payload?.topMembers ?? [];

  const [deptRes, activitiesRes] = await Promise.all([getDepartmentsPageData(), getActivitiesPageData()]);
  const dbDepartments = (deptRes.data?.payload as { departments: DbDepartment[] } | undefined)?.departments ?? [];

  const dbActivities = (activitiesRes.data?.payload as { activities: DbActivity[] } | undefined)?.activities ?? [];
  const localizedActivities = dbActivities.map((a) => ({
    id: a.slug,
    title: locale === "en" ? a.titleEn || a.titleVi : a.titleVi,
    description: (locale === "en" ? a.descriptionEn || a.descriptionVi : a.descriptionVi) ?? "",
    frequency: (locale === "en" ? a.frequencyEn || a.frequencyVi : a.frequencyVi) || undefined,
    thumbnail: a.thumbnail || null,
    href: a.hyperlink || undefined
  }));

  const localizedDepartments = dbDepartments.map((dept) => ({
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
      benefitsSection={<BenefitsSection compact={true} locale={locale} />}
      faqSection={
        <div className='border-border border-t'>
          <FaqSection locale={locale} target='ABOUT' />
        </div>
      }
      locale={locale}
      localizedActivities={localizedActivities}
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
            <StatsSection locale={locale} />
          </Suspense>
        </div>
      }
    />
  );
}
