import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/app/_actions/main";
import { BASE_KEYWORDS, OG_IMAGE, parseKeywords, SEO_SETTING_KEYS, SITE_NAME, SITE_URL } from "@/constants/seo";

type PageSeoOptions = {
  /** Translation key under "seo" namespace, e.g. "home", "events", "about" */
  page: string;
  /** Current locale ("vi" | "en") */
  locale: string;
  /** The pathname WITHOUT locale prefix, e.g. "/events" or "/events/some-slug" */
  pathname: string;
  /** Optional overrides for title (useful for dynamic pages like event detail) */
  title?: string;
  /** Optional overrides for description */
  description?: string;
  /** Optional OG image URL (absolute). Falls back to default site OG image. */
  image?: string;
  /** Optional OG type. Defaults to "website". Use "article" for detail pages. */
  type?: "website" | "article";
  /** Optional keywords specific to this page */
  keywords?: string[];
};

const absoluteUrl = (url: string) =>
  url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

export async function generatePageSeo({
  page,
  locale,
  pathname,
  title: titleOverride,
  description: descOverride,
  image,
  type = "website",
  keywords
}: PageSeoOptions): Promise<Metadata> {
  const [t, { data: settingsRes }] = await Promise.all([
    getTranslations({ locale, namespace: "seo" }),
    getSiteSettings(Object.values(SEO_SETTING_KEYS))
  ]);
  const settings = (settingsRes?.payload ?? {}) as Record<string, string>;
  const isEn = locale === "en";

  const homeDescription = settings[isEn ? SEO_SETTING_KEYS.descriptionEn : SEO_SETTING_KEYS.descriptionVi];
  const title = titleOverride || t(`${page}.title`);
  const description = descOverride || (page === "home" && homeDescription) || t(`${page}.description`);
  const ogImage = absoluteUrl(image || settings[SEO_SETTING_KEYS.ogImage] || OG_IMAGE);
  const allKeywords = [
    ...new Set([...(keywords ?? []), ...parseKeywords(settings[SEO_SETTING_KEYS.keywords]), ...BASE_KEYWORDS])
  ];

  const url = `${SITE_URL}/${locale}${pathname}`;
  const ogTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: title.includes(SITE_NAME) ? { absolute: title } : title,
    description,
    keywords: allKeywords,
    openGraph: {
      type,
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: isEn ? "en_US" : "vi_VN",
      alternateLocale: isEn ? "vi_VN" : "en_US",
      images: [{ url: ogImage, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage]
    },
    alternates: {
      canonical: url,
      languages: {
        vi: `${SITE_URL}/vi${pathname}`,
        en: `${SITE_URL}/en${pathname}`,
        "x-default": `${SITE_URL}/en${pathname}`
      }
    }
  };
}
