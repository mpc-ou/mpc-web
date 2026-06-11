import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActivitiesPageData } from "@/app/_actions/main";
import { generatePageSeo } from "@/utils/seo";
import { EventsHeroClient } from "./_components/activities-hero.client";
import { EventsClient } from "./client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "activities",
    locale,
    pathname: "/activities"
  });
}

export default async function ActivitiesPage({ params }: Props): Promise<React.ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const ta = await getTranslations("activities");

  const res = await getActivitiesPageData();
  const activities = (res.data?.payload as { activities: any[] })?.activities ?? [];

  const internalEvents = activities
    .filter((a: any) => a.isInternal)
    .map((a: any) => ({
      id: a.slug,
      title: a[`title${locale === "en" ? "En" : "Vi"}`] || a.titleVi,
      description: a[`description${locale === "en" ? "En" : "Vi"}`] || a.descriptionVi,
      frequency: a[`frequency${locale === "en" ? "En" : "Vi"}`] || a.frequencyVi || "",
      thumbnail: a.thumbnail || "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
      images: a.images || [],
      href: a.hyperlink || undefined
    }));

  const externalEvents = activities
    .filter((a: any) => !a.isInternal)
    .map((a: any) => ({
      id: a.slug,
      title: a[`title${locale === "en" ? "En" : "Vi"}`] || a.titleVi,
      description: a[`description${locale === "en" ? "En" : "Vi"}`] || a.descriptionVi,
      frequency: a[`frequency${locale === "en" ? "En" : "Vi"}`] || a.frequencyVi || "",
      thumbnail: a.thumbnail || "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
      images: a.images || [],
      href: a.hyperlink || undefined
    }));

  const clientTranslations = {
    internalTitle: t("internal.title"),
    internalDesc: t("internal.desc"),
    externalTitle: t("external.title"),
    externalDesc: t("external.desc"),
    learnMore: t("learnMore")
  };

  return (
    <div className='min-h-screen bg-background pb-20'>
      <EventsHeroClient subtitle={ta("subtitle")} title={ta("title")} />
      <EventsClient externalEvents={externalEvents} internalEvents={internalEvents} t={clientTranslations} />
    </div>
  );
}
