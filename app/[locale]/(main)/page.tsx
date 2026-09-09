import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { getTerminalStats } from "@/app/_actions/main";
import { LoadingComponent } from "@/components/custom/loading";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import type { locale } from "@/types/global";
import { generatePageSeo } from "@/utils/seo";
import { BenefitsSection } from "./_components/benefits-section";
import { FaqSection } from "./_components/faq-section";
import { GallerySection } from "./_components/gallery-section";
import { HeroSection } from "./_components/hero-section";
import { IntroSection } from "./_components/intro-section";
import { ManagementSection } from "./_components/management-section";
import { RecentEventsSection } from "./_components/recent-events";
import { StatsSection } from "./_components/stats-section";

type PageType = {
  params: Promise<{ locale: locale }>;
};

export async function generateMetadata({ params }: PageType): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "home",
    locale,
    pathname: ""
  });
}

export default async function Page({ params }: PageType): Promise<React.ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale as locale);

  const statsRes = await getTerminalStats();
  const stats =
    (statsRes.data?.payload as
      | {
          members: number;
          posts: number;
          projects: number;
          events: number;
          achievements: number;
          currentYear: number;
          github: string;
          fanpage: string;
        }
      | undefined) ?? null;

  return (
    <div className='flex flex-col'>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <HeroSection stats={stats} />

      <IntroSection locale={locale} />

      <Suspense fallback={<LoadingComponent />}>
        <StatsSection locale={locale} />
      </Suspense>

      <BenefitsSection locale={locale} />

      <Suspense fallback={<LoadingComponent />}>
        <ManagementSection locale={locale} />
      </Suspense>

      <GallerySection locale={locale} />

      <Suspense fallback={<LoadingComponent />}>
        <RecentEventsSection />
      </Suspense>

      <FaqSection locale={locale} />
    </div>
  );
}
