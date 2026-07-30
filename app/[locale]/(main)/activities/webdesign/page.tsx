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

  const [{ data: galleryRes }, { data: faqRes }, proposalUrl] = await Promise.all([
    getGalleryImages("webdesign"),
    getFaqItems(locale, "WEBDESIGN"),
    getLatestWebDesignProposalUrl()
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
      <div
        className='pointer-events-none absolute inset-0 z-0 opacity-30'
        style={{
          backgroundImage:
            "radial-gradient(rgba(249, 115, 22, 0.15) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px, 16px 16px"
        }}
      />
      <div className='pointer-events-none absolute top-1/4 left-[10%] z-0 h-100 w-100 rounded-full bg-orange-500/10 blur-[120px]' />
      <div className='pointer-events-none absolute top-1/2 right-[10%] z-0 h-125 w-125 rounded-full bg-blue-500/10 blur-[140px]' />
      <div className='pointer-events-none absolute bottom-1/4 left-1/3 z-0 h-75 w-75 rounded-full bg-emerald-500/5 blur-[100px]' />

      <WebDesignHeroClient subtitle={t("subtitle")} title={t("title")} />

      <div className='container relative z-10 mx-auto mt-16 max-w-6xl space-y-28 px-4 sm:mt-24'>
        <WebDesignIntroClient />

        <WebDesignRulesClient />

        <WebDesignTimelineClient />

        <WebDesignCriteriaClient />

        <WebDesignExhibitionClient />

        <WebDesignGalleryClient images={dbImages} />

        <WebDesignPrizesClient />

        <WebDesignSponsorClient proposalUrl={proposalUrl} />

        <WebDesignCtaClient />

        <section className='relative z-10 mb-20'>
          <FaqAccordion badge='faq' items={dbFaq} title={t("faqSectionTitle")} />
        </section>
      </div>
    </div>
  );
}
