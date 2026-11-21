import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getSiteSettings } from "@/app/_actions/main";
import wdData from "@/configs/data/wd.json";
import { SITE_URL } from "@/constants/seo";
import { mapBundledExhibitionTeams, parseWebDesignExhibitions, WEBDESIGN_EXHIBITIONS_KEY } from "@/types/webdesign";
import { generatePageSeo } from "@/utils/seo";
import { WebDesignExhibitionArchiveClient } from "./client";

type Props = {
  params: Promise<{ locale: string }>;
};

const PATHNAME = "/web-design/exhibitions";
const WEB_DESIGN_OG_IMAGE = `${SITE_URL}/images/og/web-design.jpg`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "webdesignExhibition",
    locale,
    pathname: PATHNAME,
    image: WEB_DESIGN_OG_IMAGE,
    keywords: [
      "Web Design Exhibition",
      "Triển lãm Web Design",
      "MPClub",
      "HCMOU",
      "dự án sinh viên CNTT",
      "Frontend showcase"
    ]
  });
}

export default async function WebDesignExhibitionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data: settingsRes } = await getSiteSettings([WEBDESIGN_EXHIBITIONS_KEY]);
  const settingsMap = (settingsRes?.payload ?? {}) as Record<string, string>;
  const dbExhibitions = parseWebDesignExhibitions(settingsMap[WEBDESIGN_EXHIBITIONS_KEY]);
  const exhibitions = dbExhibitions.length > 0 ? dbExhibitions : mapBundledExhibitionTeams(wdData.teams);

  return <WebDesignExhibitionArchiveClient teams={exhibitions} />;
}
