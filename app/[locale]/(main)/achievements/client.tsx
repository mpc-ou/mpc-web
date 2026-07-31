"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { PostCardData } from "@/components/post-card";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";

type AchievementMember = {
  role: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
};

type Achievement = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  date: string | null;
  type: string;
  isHighlight: boolean;
  relatedUrl: string | null;
  members: AchievementMember[];
};

export type { Achievement };

export function AchievementsClient({
  achievements,
  currentPage,
  totalPages,
  locale: _locale
}: {
  achievements: Achievement[];
  currentPage: number;
  totalPages: number;
  locale: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("achievements");

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const cards: PostCardData[] = achievements.map((item) => ({
    id: item.id,
    slug: item.slug,
    variant: "achievement",
    titleVi: item.title,
    summaryVi: item.summary,
    thumbnail: item.thumbnail,
    date: item.date,
    isHighlight: item.isHighlight,
    achievementType: item.type as PostCardData["achievementType"],
    members: item.members?.map((m) => ({
      id: m.member.id,
      firstName: m.member.firstName,
      lastName: m.member.lastName,
      avatar: m.member.avatar
    }))
  }));

  return (
    <>
      <div className='mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {cards.map((card) => (
          <PostCard data={card} key={card.id} />
        ))}
        {achievements.length === 0 && (
          <div className='col-span-full py-20 text-center text-muted-foreground'>{t("emptyData")}</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            size='icon'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='min-w-16 text-center font-medium text-sm'>
            {currentPage} / {totalPages}
          </span>
          <Button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            size='icon'
            variant='outline'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </>
  );
}
