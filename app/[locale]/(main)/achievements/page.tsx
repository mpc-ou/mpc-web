import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { getAchievementsPageData } from "@/app/[locale]/actions";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { generatePageSeo } from "@/utils/seo";
import { AchievementsClient } from "./client";
import { LeadershipCarouselClient } from "./leadership-carousel.client";

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

export default async function AchievementsPage({
  searchParams,
  locale,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  locale: string;
}) {
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const take = 6;

  const { data } = await getAchievementsPageData(validPage, take);
  const payload = data?.payload as
    | { achievements: any[]; totalPages: number; leaders: any[] }
    | undefined;

  const achievements = payload?.achievements ?? [];
  const totalPages = payload?.totalPages ?? 0;
  const leaders = payload?.leaders ?? [];

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 sm:pt-20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <ScrollReveal className="mb-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="mb-4 font-black text-4xl tracking-tight sm:text-5xl">
            Thành tựu
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Những thành tựu, giải thưởng và cột mốc đáng tự hào trong suốt chặng
            đường phát triển của câu lạc bộ.
          </p>
        </ScrollReveal>

        {/* 1. Bảng vàng điều hành */}
      </div>

      <div className="w-full">
        <LeadershipCarouselClient leaders={leaders} />
      </div>

      <div className="container mx-auto mt-20 max-w-6xl px-4">
        {/* 2. Bảng vàng thành tích */}
        <div className="mb-8 text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Bảng vàng thành tích
          </h2>
        </div>

        <AchievementsClient
          achievements={achievements}
          currentPage={validPage}
          totalPages={totalPages}
          locale={locale}
        />
      </div>
    </div>
  );
}
