import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEventsPageData } from "@/app/_actions/main";
import { generatePageSeo } from "@/utils/seo";
import { DynamicEventsClient } from "./client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "events",
    locale,
    pathname: "/events"
  });
}

import { PageHero } from "@/components/custom/page-hero.client";

export default async function EventsPage({ params, searchParams }: Props): Promise<React.ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const take = 9;
  const t = await getTranslations("events");

  const { data } = await getEventsPageData(validPage, take, locale);
  const payload = data?.payload as { events: any[]; totalPages: number } | undefined;

  const dbEvents = payload?.events ?? [];
  const totalPages = payload?.totalPages ?? 0;

  return (
    <div className='min-h-screen bg-background pb-20'>
      <PageHero
        badge='EVENTS & NETWORKING'
        codeTitle='events.ts'
        description={t("subtitle")}
        imageUrl='/images/bg/toc2025.jpg'
        title={t("title")}
      />
      <div className='container mx-auto mt-16 max-w-6xl px-4'>
        {/* Content */}
        <DynamicEventsClient currentPage={validPage} events={dbEvents} totalPages={totalPages} />
      </div>
    </div>
  );
}
