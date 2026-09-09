import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { generatePageSeo } from "@/utils/seo";
import { SearchClient } from "./client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "search",
    locale,
    pathname: "/search"
  });
}

export default async function SearchPage({ params, searchParams }: Props): Promise<React.ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q } = await searchParams;

  return <SearchClient initialQuery={q ?? ""} locale={locale} />;
}
