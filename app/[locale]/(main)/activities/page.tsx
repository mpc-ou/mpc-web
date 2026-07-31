import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActivitiesPageData, getProjectsPageData } from "@/app/_actions/main";
import type { PostCardData } from "@/components/post-card";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";
import type { ProjectSummary } from "@/types/common";
import { generatePageSeo } from "@/utils/seo";
import { EventsHeroClient } from "./_components/activities-hero.client";
import { EventsClient } from "./client";

type Props = {
  params: Promise<{ locale: string }>;
};

type DbActivity = {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  frequencyVi: string | null;
  frequencyEn: string | null;
  hyperlink: string | null;
  thumbnail: string | null;
  images: string[];
  isInternal: boolean;
};

type ProjectSummaryWithEn = ProjectSummary & {
  titleEn?: string;
  descriptionEn?: string | null;
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

  const [res, projectsRes] = await Promise.all([getActivitiesPageData(), getProjectsPageData(1, 6)]);
  const activities = (res.data?.payload as { activities: DbActivity[] } | undefined)?.activities ?? [];

  const projectsPayload = projectsRes.data?.payload as { projects: ProjectSummaryWithEn[] } | undefined;
  const featuredProjects: PostCardData[] = (projectsPayload?.projects ?? []).map((p) => ({
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
        avatar: m.member.avatar
      })) ?? []
  }));

  const internalEvents = activities
    .filter((a) => a.isInternal)
    .map((a) => ({
      id: a.slug,
      title: (locale === "en" ? a.titleEn : a.titleVi) || a.titleVi,
      description: (locale === "en" ? a.descriptionEn : a.descriptionVi) || a.descriptionVi,
      frequency: (locale === "en" ? a.frequencyEn : a.frequencyVi) || a.frequencyVi || "",
      thumbnail: a.thumbnail || "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
      images: a.images || [],
      href: a.hyperlink || undefined
    }));

  const externalEvents = activities
    .filter((a) => !a.isInternal)
    .map((a) => ({
      id: a.slug,
      title: (locale === "en" ? a.titleEn : a.titleVi) || a.titleVi,
      description: (locale === "en" ? a.descriptionEn : a.descriptionVi) || a.descriptionVi,
      frequency: (locale === "en" ? a.frequencyEn : a.frequencyVi) || a.frequencyVi || "",
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

      {featuredProjects.length > 0 && (
        <div className='container mx-auto mt-4 max-w-6xl px-4'>
          <ScrollReveal className='mb-10 flex flex-col items-center justify-between gap-4 border-border border-t pt-16 text-center md:flex-row md:text-left'>
            <div>
              <h2 className='font-bold text-3xl text-foreground sm:text-4xl'>{ta("projectsTitle")}</h2>
              <p className='mt-2 text-muted-foreground'>{ta("projectsDesc")}</p>
            </div>
            <Button asChild className='shrink-0 rounded-full' variant='outline'>
              <Link href='/projects'>
                {ta("viewAllProjects")}
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </ScrollReveal>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {featuredProjects.map((project, idx) => (
              <ScrollReveal delay={idx * 80} key={project.id} variant='fade-up'>
                <PostCard data={project} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
