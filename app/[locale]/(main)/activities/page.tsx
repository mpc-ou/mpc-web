import fs from "fs";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import path from "path";
import eventsData from "@/configs/data/events.json";
import { generatePageSeo } from "@/utils/seo";
import { EventsClient } from "./client";
import { EventsHeroClient } from "./hero.client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "activities",
    locale,
    pathname: "/activities",
  });
}

export default async function ActivitiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");

  // Format data from eventsData using locale
  const getLocalizedData = (events: any[]) => {
    return events.map((e) => {
      let images: string[] = [];
      let thumbnail =
        "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image";

      if (e.imageFolder) {
        try {
          const dirPath = path.join(process.cwd(), "public", e.imageFolder);
          if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            const imageFiles = files.filter((file) =>
              /\.(jpg|jpeg|png|webp|gif)$/i.test(file),
            );

            // Sort Z-A
            imageFiles.sort((a, b) => b.localeCompare(a));

            images = imageFiles.map((file) => `${e.imageFolder}/${file}`);
            if (images.length > 0) {
              thumbnail = images[0];
            }
          }
        } catch (error) {
          console.error(`Error reading image folder ${e.imageFolder}:`, error);
        }
      }

      return {
        id: e.id,
        title: e[locale]?.title || e.vi?.title,
        description: e[locale]?.description || e.vi?.description,
        thumbnail,
        images,
        href: e.href,
      };
    });
  };

  const internalEvents = getLocalizedData(eventsData.internalEvents);
  const externalEvents = getLocalizedData(eventsData.externalEvents);

  const clientTranslations = {
    internalTitle: t("internal.title"),
    internalDesc: t("internal.desc"),
    externalTitle: t("external.title"),
    externalDesc: t("external.desc"),
    learnMore: t("learnMore"),
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <EventsHeroClient subtitle={t("subtitle")} title={t("title")} />
      <EventsClient
        externalEvents={externalEvents}
        internalEvents={internalEvents}
        t={clientTranslations}
      />
    </div>
  );
}
