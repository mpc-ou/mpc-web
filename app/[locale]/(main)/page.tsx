import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import type { locale } from "@/types/global";
import { generatePageSeo } from "@/utils/seo";
import { BenefitsSection } from "./benefits-section";
import { FaqSection } from "./faq-section";
import { GallerySection } from "./gallery-section";
import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { ManagementSection } from "./management-section";
import { RecentEventsSection } from "./recent-events";
import { StatsSection } from "./stats-section";

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

export default async function Page({ params }: PageType) {
  const { locale } = await params;
  setRequestLocale(locale as locale);

  return (
    <div className='flex flex-col'>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <HeroSection />

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
