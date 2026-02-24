import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAchievementsPageData } from "@/app/[locale]/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementsClient } from "./client";
import { LeadershipCarouselClient } from "./leadership-carousel.client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: `Thành tựu | ${t("metadata.siteName")}`,
    description: "Những thành tựu, giải thưởng và cột mốc đáng tự hào của câu lạc bộ"
  };
}

export default async function AchievementsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const take = 6;

  const { data } = await getAchievementsPageData(validPage, take);
  const payload = data?.payload as { achievements: any[]; totalPages: number; leaders: any[] } | undefined;

  const achievements = payload?.achievements ?? [];
  const totalPages = payload?.totalPages ?? 0;
  const leaders = payload?.leaders ?? [];

  return (
    <div className='min-h-screen bg-background pt-10 pb-20 sm:pt-20'>
      <div className='container mx-auto max-w-6xl px-4'>
        {/* Header */}
        <div className='mb-16 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <Trophy className='h-8 w-8' />
          </div>
          <h1 className='mb-4 font-black text-4xl tracking-tight sm:text-5xl'>Thành tựu</h1>
          <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
            Những thành tựu, giải thưởng và cột mốc đáng tự hào trong suốt chặng đường phát triển của câu lạc bộ.
          </p>
        </div>

        {/* Content Tabs */}
        <Tabs className='space-y-12' defaultValue='achievements'>
          <div className='flex justify-center'>
            <TabsList className='grid w-full max-w-md grid-cols-2'>
              <TabsTrigger value='achievements'>Bảng vàng thành tích</TabsTrigger>
              <TabsTrigger value='leadership'>Bảng vàng điều hành</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent className='fade-in-50 mt-0 animate-in space-y-8 duration-500' value='achievements'>
            <AchievementsClient achievements={achievements} currentPage={validPage} totalPages={totalPages} />
          </TabsContent>

          <TabsContent className='fade-in-50 mt-0 animate-in duration-500' value='leadership'>
            <LeadershipCarouselClient leaders={leaders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
