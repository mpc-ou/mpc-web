import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getGalleryImages, getSiteSettings } from "@/app/_actions/main";
import wdData from "@/configs/data/wd.json";
import {
  parseWebDesignConfig,
  parseWebDesignExhibitions,
  WEBDESIGN_CONFIG_KEY,
  WEBDESIGN_EXHIBITIONS_KEY
} from "@/types/webdesign";
import { generatePageSeo } from "@/utils/seo";
import { FaqSection } from "../../_components/faq-section";
import { WebDesignBackground } from "./_components/webdesign-bg.client";
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

type ProposalListItem = {
  id: string;
  name: string;
  organization?: string;
  path: string;
  lastModified: string;
};

const PROPOSAL_LIST_URL = "https://proposal.mpclub.dev/proposal-list.json";
const PROPOSAL_BASE_URL = "https://proposal.mpclub.dev/";
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

  return (
    <div className='relative min-h-screen overflow-hidden bg-background pb-20 text-foreground transition-colors duration-300'>
      <WebDesignBackground />

      <WebDesignHeroClient contestDate={wdConfig.contestDate} subtitle={t("subtitle")} title={t("title")} />

      <div className='container relative z-10 mx-auto mt-16 max-w-6xl space-y-28 px-4 sm:mt-24'>
        <WebDesignIntroClient />

        <WebDesignRulesClient />

        <WebDesignTimelineClient />

        <WebDesignCriteriaClient />

        <WebDesignExhibitionClient teams={wdExhibitions} />

        <WebDesignGalleryClient images={galleryImages} />

        <WebDesignPrizesClient benefits={wdConfig.benefits} prizes={wdConfig.prizes} />

        <WebDesignSponsorClient proposalUrl={proposalUrl} sponsorUrl={wdConfig.sponsorUrl} />

        <WebDesignCtaClient registerUrl={wdConfig.registerUrl} />

        <FaqSection
          className='relative z-10 bg-transparent py-0'
          locale={locale}
          target='WEBDESIGN'
          title={t("faqSectionTitle")}
        />
      </div>
    </div>
  );
}
