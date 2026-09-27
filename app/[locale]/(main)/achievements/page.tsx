import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAchievementsPageData } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { generatePageSeo } from "@/utils/seo";
import { AchievementPosts } from "./_components/achievement-posts.client";
import { HonorBoard } from "./_components/honor-board.client";
import { HonoreeProvider } from "./_components/honoree-dialog.client";
import { LeadershipTerms } from "./_components/leadership-terms.client";
import { type AchievementsPagePayload, POSTS_PER_PAGE } from "./_components/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "achievements",
    locale,
    pathname: "/achievements"
  });
}

export default async function AchievementsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const t = await getTranslations("achievements");
  const { data } = await getAchievementsPageData(validPage, POSTS_PER_PAGE, locale);
  const payload = data?.payload as AchievementsPagePayload | undefined;

  return (
    <div className='min-h-screen bg-background'>
      <PageHero
        badge='HONORS & AWARDS'
        description={t("description")}
        imageUrl='/images/bg/achievements.jpg'
        title={t("title")}
      />

      <div className='container mx-auto flex max-w-6xl flex-col gap-24 px-4 pt-12 pb-24'>
        <HonoreeProvider
          goldBoard={payload?.goldBoard ?? []}
          people={payload?.people ?? {}}
          terms={payload?.terms ?? []}
        >
          <HonorBoard />
          <LeadershipTerms />
        </HonoreeProvider>

        <AchievementPosts
          currentPage={validPage}
          posts={payload?.achievements ?? []}
          total={payload?.total ?? 0}
          totalPages={payload?.totalPages ?? 0}
        />
      </div>
    </div>
  );
}
