import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getFaqItems } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { ABOUT_CLUB } from "@/configs/data/about";
import { generatePageSeo } from "@/utils/seo";
import { JoinCtaSection } from "../_components/join-cta-section";
import { FaqBrowser, type FaqEntry } from "./client";

type Props = { params: Promise<{ locale: string }> };

const TARGET_ORDER = ["GENERAL", "ABOUT", "ACTIVITIES", "TRAINING", "PROJECTS", "SPONSOR", "WEBDESIGN"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({ page: "faq", locale, pathname: "/faq" });
}

export default async function FaqPage({ params }: Props): Promise<React.ReactNode> {
  const { locale } = await params;
  const [t, { data }] = await Promise.all([getTranslations({ locale, namespace: "faqPage" }), getFaqItems(locale)]);
  const items = ((data?.payload ?? []) as FaqEntry[]).sort(
    (a, b) => TARGET_ORDER.indexOf(a.target) - TARGET_ORDER.indexOf(b.target) || a.order - b.order
  );
  const targetLabels = t.raw("targets") as Record<string, string>;
  const targets = TARGET_ORDER.filter((target) => items.some((i) => i.target === target)).map((target) => ({
    value: target,
    label: targetLabels[target] ?? target,
    count: items.filter((i) => i.target === target).length
  }));

  return (
    <div className='min-h-screen bg-background'>
      <FaqJsonLd items={items} />
      <PageHero badge={t("badge")} description={t("description")} imageUrl='/images/bg/about.jpg' title={t("title")} />

      <section className='container mx-auto px-4 py-16 sm:py-20'>
        <FaqBrowser
          items={items}
          labels={{
            all: t("all"),
            empty: t("empty"),
            search: t("searchPlaceholder"),
            count: t("count", { count: "{count}" })
          }}
          targets={targets}
        />
      </section>

      <JoinCtaSection
        description={t("ctaDesc")}
        eyebrow={t("ctaEyebrow")}
        locale={locale}
        primary={{ label: t("ctaActivities"), href: `/${locale}/activities` }}
        secondary={{ label: t("ctaAsk"), href: ABOUT_CLUB.contact.facebook }}
        title={t("ctaTitle")}
      />
    </div>
  );
}
