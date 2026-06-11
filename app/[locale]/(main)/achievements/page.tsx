import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { getAchievementsPageData } from "@/app/_actions/main";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { generatePageSeo } from "@/utils/seo";
import { GoldBoard } from "./_components/gold-board.client";
import { LeadershipCarouselClient } from "./_components/leadership-carousel.client";
import { AchievementsClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "achievements",
    locale,
    pathname: "/achievements",
  });
}

import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/custom/page-hero.client";

export default async function AchievementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const take = 6;
  const t = await getTranslations("achievements");

  const { data } = await getAchievementsPageData(validPage, take, locale);
  const payload = data?.payload as
    | {
        achievements: any[];
        totalPages: number;
        leaders: any[];
        goldBoard: any[];
      }
    | undefined;

  const achievements = payload?.achievements ?? [];
  const totalPages = payload?.totalPages ?? 0;
  const leaders = payload?.leaders ?? [];
  const goldBoard = payload?.goldBoard ?? [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHero
        badge="HONORS & AWARDS"
        description={t("description")}
        imageUrl="/images/bg/achievements.jpg"
        title={t("title")}
      />

      <div className="container mx-auto mt-16 px-4">
        {leaders.length > 0 && (
          <div className="mb-16">
            <div className="mb-6 text-center">
              <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
                {t("hallOfFameTitle")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("hallOfFameDesc")}
              </p>
            </div>
            <GoldBoard locale={locale} members={goldBoard} />
          </div>
        )}
      </div>

      <div className="w-full">
        <LeadershipCarouselClient leaders={leaders} />
      </div>

      <div className="container mx-auto mt-20 max-w-6xl px-4">
        {/* 2. Bài viết thành tích */}
        <div className="mb-8 text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            {t("articlesTitle")}
          </h2>
        </div>

        <AchievementsClient
          achievements={achievements}
          currentPage={validPage}
          locale={locale}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
