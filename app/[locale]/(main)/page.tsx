import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import type { locale } from "@/types/global";
import { BenefitsSection } from "./benefits-section";
import { FaqSection } from "./faq-section";
import { GallerySection } from "./gallery-section";
import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { ManagementSection } from "./management-section";
import { StatsSection } from "./stats-section";

type PageType = {
  params: Promise<{ locale: locale }>;
};

export async function generateMetadata({ params }: PageType): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("title")
  };
}

export default async function Page({ params }: PageType) {
  const { locale } = await params;
  setRequestLocale(locale as locale);

  return (
    <div className='flex flex-col'>
      {/* Hero Section */}
      <HeroSection locale={locale} />

      {/* Stats Banner */}
      <Suspense fallback={<LoadingComponent />}>
        <StatsSection locale={locale} />
      </Suspense>

      {/* Introduction */}
      <IntroSection locale={locale} />

      {/* Benefits */}
      <BenefitsSection locale={locale} />

      {/* Management / Leadership */}
      <Suspense fallback={<LoadingComponent />}>
        <ManagementSection locale={locale} />
      </Suspense>

      {/* Gallery */}
      <GallerySection locale={locale} />

      {/* FAQ */}
      <FaqSection locale={locale} />
    </div>
  );
}
