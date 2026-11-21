import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/app/_actions/main";
import {
  BASE_KEYWORDS,
  OG_IMAGE,
  OG_IMAGE_SIZE,
  parseKeywords,
  SEO_SETTING_KEYS,
  SITE_NAME,
  SITE_URL
} from "@/constants/seo";

const MAX_META_DESCRIPTION_LENGTH = 160;
const WHITESPACE_COLLAPSE_RE = /\s+/g;
const TRAILING_PUNCTUATION_RE = /[,.;:–—\-\s]+$/;

export function truncateMetaDescription(raw: string, maxLength = MAX_META_DESCRIPTION_LENGTH): string {
  const clean = raw.replace(WHITESPACE_COLLAPSE_RE, " ").trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const boundary = lastSpace > maxLength * 0.7 ? sliced.slice(0, lastSpace) : sliced;
  return `${boundary.replace(TRAILING_PUNCTUATION_RE, "")}…`;
}

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
  type?: "website" | "article" | "profile";
  /** Optional keywords specific to this page */
  keywords?: string[];
  /** Optional article / profile metadata for rich Open Graph previews */
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
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
  keywords,
  publishedTime,
  modifiedTime,
  authors,
  tags,
  noIndex = false
}: PageSeoOptions): Promise<Metadata> {
  const [t, { data: settingsRes }] = await Promise.all([
    getTranslations({ locale, namespace: "seo" }),
    getSiteSettings(Object.values(SEO_SETTING_KEYS))
  ]);
  const settings = (settingsRes?.payload ?? {}) as Record<string, string>;
  const isEn = locale === "en";

  const homeDescription = settings[isEn ? SEO_SETTING_KEYS.descriptionEn : SEO_SETTING_KEYS.descriptionVi];
  const title = titleOverride || t(`${page}.title`);
  const rawDescription = descOverride || (page === "home" && homeDescription) || t(`${page}.description`);
  const description = truncateMetaDescription(rawDescription);
  const ogImage = absoluteUrl(image || settings[SEO_SETTING_KEYS.ogImage] || OG_IMAGE);
  const allKeywords = [
    ...new Set([
      ...(keywords ?? []),
      ...(tags ?? []),
      ...parseKeywords(settings[SEO_SETTING_KEYS.keywords]),
      ...BASE_KEYWORDS
    ])
  ];

  const url = `${SITE_URL}/${locale}${pathname}`;
  const ogTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: title.includes(SITE_NAME) ? { absolute: title } : title,
    description,
    keywords: allKeywords,
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false }
          }
        }
      : {}),
    openGraph: {
      type,
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: isEn ? "en_US" : "vi_VN",
      alternateLocale: isEn ? "vi_VN" : "en_US",
      images: [{ url: ogImage, ...OG_IMAGE_SIZE, alt: title }],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors,
            tags
          }
        : {})
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [{ url: ogImage, alt: title }]
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
