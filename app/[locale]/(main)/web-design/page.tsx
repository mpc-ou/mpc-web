import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getGalleryImages, getSiteSettings } from "@/app/_actions/main";
import { EventJsonLd } from "@/components/seo/json-ld";
import wdData from "@/configs/data/wd.json";
import { SITE_URL } from "@/constants/seo";
import {
  parseWebDesignConfig,
  parseWebDesignExhibitions,
  WEBDESIGN_CONFIG_KEY,
  WEBDESIGN_EXHIBITIONS_KEY
} from "@/types/webdesign";
import { generatePageSeo } from "@/utils/seo";
import { getWebDesignSeoInfo } from "@/utils/webdesign-seo";
import { FaqSection } from "../_components/faq-section";
import { WD_SECTION_IDS, WdSection } from "./_components/wd-primitives";
import { WebDesignCriteria } from "./_components/webdesign-criteria";
import { WebDesignCta } from "./_components/webdesign-cta";
import { WebDesignExhibitionClient } from "./_components/webdesign-exhibition.client";
import { WebDesignGallery } from "./_components/webdesign-gallery";
import { WebDesignHeroClient } from "./_components/webdesign-hero.client";
import { WebDesignIntro } from "./_components/webdesign-intro";
import { WebDesignPrizes } from "./_components/webdesign-prizes";
import { WebDesignRegulations } from "./_components/webdesign-regulations";
import { WebDesignRules } from "./_components/webdesign-rules";
import { WebDesignSponsor } from "./_components/webdesign-sponsor";
import { WebDesignTimelineClient } from "./_components/webdesign-timeline.client";

type Props = {
  params: Promise<{ locale: string }>;
};

const PATHNAME = "/web-design";

const SEO_KEYWORDS = {
  vi: ["cuộc thi Web Design", "cuộc thi thiết kế website", "cuộc thi lập trình web", "thiết kế UI/UX", "Frontend"],
  en: ["Web Design contest", "website design competition", "web development contest", "UI/UX design", "Frontend"]
} as const;

const WEB_DESIGN_OG_IMAGE = `${SITE_URL}/images/og/web-design.jpg`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, { data: settingsRes }] = await Promise.all([
    getTranslations({ locale, namespace: "seo.webdesign" }),
    getSiteSettings([WEBDESIGN_CONFIG_KEY])
  ]);
  const settingsMap = (settingsRes?.payload ?? {}) as Record<string, string>;
  const info = getWebDesignSeoInfo(parseWebDesignConfig(settingsMap[WEBDESIGN_CONFIG_KEY]), locale);
  const year = info.year ?? "";
  const { contestDateLabel } = info;

  const description = [t("description", { year }), contestDateLabel && t("dateSentence", { date: contestDateLabel })]
    .filter(Boolean)
    .join(" ");

  const seo = await generatePageSeo({
    page: "webdesign",
    locale,
    pathname: PATHNAME,
    title: t("title", { year }).trim(),
    description,
    image: WEB_DESIGN_OG_IMAGE,
    keywords: [...SEO_KEYWORDS[locale === "en" ? "en" : "vi"], `Web Design ${year}`.trim(), "MPClub", "HCMOU"]
  });
  const ogImage = { url: WEB_DESIGN_OG_IMAGE, width: 1200, height: 630, alt: t("ogAlt", { year }) };
  return { ...seo, openGraph: { ...seo.openGraph, images: [ogImage] } };
}

type ProposalListItem = {
  id: string;
  name: string;
  organization?: string;
  path: string;
  lastModified: string;
};

const PROPOSAL_LIST_URL = "https://business.mpclub.dev/proposal-list.json";
const PROPOSAL_BASE_URL = "https://business.mpclub.dev/";
const PROPOSAL_KEYWORD = "webdesign";

async function getLatestWebDesignProposalUrl(): Promise<string> {
  const fallback = `${PROPOSAL_BASE_URL}webdesign2026/`;
  try {
    const res = await fetch(PROPOSAL_LIST_URL, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return fallback;
    }
    const json = (await res.json()) as { proposals?: ProposalListItem[] };
    const matches = (json.proposals ?? []).filter(
      (p) => p.id?.toLowerCase().includes(PROPOSAL_KEYWORD) || p.name?.toLowerCase().includes(PROPOSAL_KEYWORD)
    );
    if (matches.length === 0) {
      return fallback;
    }
    const latest = matches.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];
    return latest?.path ? `${PROPOSAL_BASE_URL}${latest.path}` : fallback;
  } catch {
    return fallback;
  }
}

export default async function WebDesignPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("webdesign");

  const [{ data: galleryRes }, { data: settingsRes }, fallbackProposalUrl] = await Promise.all([
    getGalleryImages("webdesign"),
    getSiteSettings([WEBDESIGN_CONFIG_KEY, WEBDESIGN_EXHIBITIONS_KEY]),
    getLatestWebDesignProposalUrl()
  ]);

  const dbImages = (galleryRes?.payload ?? []) as Array<{
    id: string;
    url: string;
    caption: string | null;
    order: number;
  }>;

  const fallbackImages = (wdData.images ?? []).map((url: string, index: number) => ({
    id: `fallback-${index}`,
    url,
    caption: `WebDesign Contest Gallery ${index + 1}`,
    order: index + 1
  }));

  const galleryImages = dbImages.length > 0 ? dbImages : fallbackImages;

  const settingsMap = (settingsRes?.payload ?? {}) as Record<string, string>;
  const wdConfig = parseWebDesignConfig(settingsMap[WEBDESIGN_CONFIG_KEY]);
  const wdExhibitions = parseWebDesignExhibitions(settingsMap[WEBDESIGN_EXHIBITIONS_KEY]);
  const proposalUrl = wdConfig.proposalUrl || fallbackProposalUrl;

  const contestYear = new Date(wdConfig.contestDate).getFullYear();
  const seoInfo = getWebDesignSeoInfo(wdConfig, locale);

  return (
    <div className='relative min-h-screen overflow-x-clip bg-background text-foreground'>
      {seoInfo.startIso ? (
        <EventJsonLd
          description={t("subtitle")}
          endDate={seoInfo.endIso}
          image={WEB_DESIGN_OG_IMAGE}
          isAccessibleForFree
          location='Trường Đại học Mở TP.HCM'
          name={`Web Design ${seoInfo.year ?? ""}`.trim()}
          startDate={seoInfo.startIso}
          url={`${SITE_URL}/${locale}${PATHNAME}`}
        />
      ) : null}
      <WebDesignHeroClient
        contestDate={wdConfig.contestDate}
        milestones={wdConfig.milestones}
        registerUrl={wdConfig.registerUrl}
      />

      <main className='mx-auto max-w-310 px-4 sm:px-6'>
        <WebDesignIntro />
        <WebDesignRules />
        <WebDesignTimelineClient milestones={wdConfig.milestones} />
        <WebDesignCriteria />
        <WebDesignRegulations pdfUrl={wdConfig.rulesPdfUrl} regulations={wdConfig.regulations} />
        <WebDesignPrizes benefits={wdConfig.benefits} prizes={wdConfig.prizes} />
        <WebDesignExhibitionClient teams={wdExhibitions} />
        <WebDesignGallery images={galleryImages} />

        <WdSection id={WD_SECTION_IDS.register}>
          <WebDesignCta
            registerUrl={wdConfig.registerUrl}
            year={Number.isNaN(contestYear) ? new Date().getFullYear() : contestYear}
          />
          <WebDesignSponsor proposalUrl={proposalUrl} sponsorUrl={wdConfig.sponsorUrl} />
        </WdSection>

        <FaqSection
          className='bg-transparent pt-24 pb-30 lg:pt-30'
          containerClassName=''
          id={WD_SECTION_IDS.faq}
          index='09'
          locale={locale}
          subtitle={t("faqSubtitle")}
          target='WEBDESIGN'
          title={t("faqSectionTitle")}
        />
      </main>
    </div>
  );
}
