"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import type { PostCardData } from "@/components/post-card";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import type { ProjectSummary } from "@/types/common";

// getProjectsPageData (app/_actions/main/projects.ts) selects titleEn/descriptionEn as
// well, which the shared ProjectSummary type doesn't declare.
export type ProjectSummaryWithI18n = ProjectSummary & {
  titleEn?: string | null;
  descriptionEn?: string | null;
};

export function ProjectsClient({
  projects,
  currentPage,
  totalPages
}: {
  projects: ProjectSummaryWithI18n[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("projects");

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const cards: PostCardData[] = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    variant: "project",
    titleVi: p.title,
    titleEn: p.titleEn,
    summaryVi: p.description,
    summaryEn: p.descriptionEn,
    thumbnail: p.thumbnail ?? undefined,
    technologies: Array.isArray(p.technologies) ? p.technologies : [],
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
    contributors:
      p.members?.map((m) => ({
        id: m.member.id,
        firstName: m.member.firstName,
        lastName: m.member.lastName,
        avatar: m.member.avatar,
        slug: m.member.slug
      })) ?? []
  }));

  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      {projects.length === 0 ? (
        <div className='py-20 text-center text-muted-foreground'>{t("emptyData")}</div>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {cards.map((card) => (
            <PostCard data={card} key={card.id} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className='mt-12 flex items-center justify-center gap-2'>
          <Button
            className='h-8 w-8 p-0'
            disabled={currentPage <= 1 || isPending}
            onClick={() => handlePageChange(currentPage - 1)}
            size='sm'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-1'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                return (
                  <Button
                    className='h-8 w-8 p-0'
                    disabled={isPending || currentPage === p}
                    key={p}
                    onClick={() => handlePageChange(p)}
                    size='sm'
                    variant={currentPage === p ? "default" : "outline"}
                  >
                    {p}
                  </Button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) {
                return (
                  <span className='flex h-8 w-8 items-center justify-center text-muted-foreground text-sm' key={p}>
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          <Button
            className='h-8 w-8 p-0'
            disabled={currentPage >= totalPages || isPending}
            onClick={() => handlePageChange(currentPage + 1)}
            size='sm'
            variant='outline'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
