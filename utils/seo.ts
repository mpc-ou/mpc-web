import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/constants/seo";

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

/**
 * Generate consistent, SEO-complete metadata for any page.
 * Uses next-intl translations from the "seo" namespace.
 * Includes title, description, openGraph, twitter, canonical, and hreflang alternates.
 */
export async function generatePageSeo({
  page,
  locale,
  pathname,
  title: titleOverride,
  description: descOverride,
  image,
  type = "website",
  keywords,
}: PageSeoOptions): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });

  const title = titleOverride || t(`${page}.title`);
  const description = descOverride || t(`${page}.description`);

  const url = `${SITE_URL}/${locale}${pathname}`;
  const ogImage = image || OG_IMAGE;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    openGraph: {
      type,
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        vi: `${SITE_URL}/vi${pathname}`,
        en: `${SITE_URL}/en${pathname}`,
      },
    },
  };
}
