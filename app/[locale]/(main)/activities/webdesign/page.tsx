import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFaqItems, getGalleryImages } from "@/app/_actions/main";
import { FaqAccordion } from "@/components/custom/faq-accordion.client";
import { generatePageSeo } from "@/utils/seo";
import { WebDesignCriteriaClient } from "./_components/webdesign-criteria.client";
import { WebDesignCtaClient } from "./_components/webdesign-cta.client";
import { WebDesignExhibitionClient } from "./_components/webdesign-exhibition.client";
import { WebDesignGalleryClient } from "./_components/webdesign-gallery.client";
import { WebDesignHeroClient } from "./_components/webdesign-hero.client";
import { WebDesignIntroClient } from "./_components/webdesign-intro.client";
import { WebDesignPrizesClient } from "./_components/webdesign-prizes.client";
import { WebDesignRulesClient } from "./_components/webdesign-rules.client";
import { WebDesignSponsorClient } from "./_components/webdesign-sponsor.client";
import { WebDesignTimelineClient } from "./_components/webdesign-timeline.client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "activities",
    locale,
    pathname: "/activities/webdesign"
  });
}

export default async function WebDesignPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("webdesign");

  // Fetch gallery images and FAQs from DB for 'webdesign'
  const [{ data: galleryRes }, { data: faqRes }] = await Promise.all([
    getGalleryImages("webdesign"),
    getFaqItems(locale, "WEBDESIGN")
  ]);

  const dbImages = (galleryRes?.payload ?? []) as Array<{
    id: string;
    url: string;
    caption: string | null;
    order: number;
  }>;

  const dbFaq = (faqRes?.payload ?? []) as Array<{
    id: string;
    question: string;
    answer: string;
  }>;

  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 pb-20 text-slate-100'>
      {/* Blueprint Dot Grid overlay */}
      <div
        className='pointer-events-none absolute inset-0 z-0 opacity-30'
        style={{
          backgroundImage:
            "radial-gradient(rgba(249, 115, 22, 0.15) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px, 16px 16px"
        }}
      />
      {/* Background glow effects */}
      <div className='pointer-events-none absolute top-1/4 left-[10%] z-0 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[120px]' />
      <div className='pointer-events-none absolute top-1/2 right-[10%] z-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[140px]' />
      <div className='pointer-events-none absolute bottom-1/4 left-1/3 z-0 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[100px]' />

      {/* Hero */}
      <WebDesignHeroClient subtitle={t("subtitle")} title={t("title")} />

      <div className='container relative z-10 mx-auto mt-16 max-w-6xl space-y-28 px-4 sm:mt-24'>
        {/* Intro */}
        <WebDesignIntroClient />

        {/* Rules */}
        <WebDesignRulesClient />

        {/* Timeline */}
        <WebDesignTimelineClient />

        {/* Criteria */}
        <WebDesignCriteriaClient />

        {/* Exhibition */}
        <WebDesignExhibitionClient />

        {/* Gallery */}
        <WebDesignGalleryClient images={dbImages} />

        {/* Prizes */}
        <WebDesignPrizesClient />

        {/* Sponsor */}
        <WebDesignSponsorClient />

        {/* CTA */}
        <WebDesignCtaClient />

        {/* FAQ Section using reusable FaqAccordion */}
        <section className='relative z-10 mb-20'>
          <FaqAccordion badge='faq' items={dbFaq} title={t("faqSectionTitle")} />
        </section>
      </div>
    </div>
  );
}
