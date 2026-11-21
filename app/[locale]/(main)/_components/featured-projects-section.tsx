import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getFeaturedProjects } from "@/app/_actions/main";
import { SectionHeading } from "@/components/custom/section-heading";
import { PostCard, type PostCardData } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";
import type { ProjectSummaryWithI18n } from "../projects/client";

const FeaturedProjectsSection = async ({ locale }: { locale: string }) => {
  const [{ data }, t] = await Promise.all([
    getFeaturedProjects(4),
    getTranslations({ locale, namespace: "home.projects" })
  ]);
  const projects = (data?.payload as { projects: ProjectSummaryWithI18n[] } | undefined)?.projects ?? [];

  if (projects.length === 0) {
    return null;
  }

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

  const isSpotlight = cards.length <= 2;

  return (
    <section className='w-full bg-background pt-10 pb-16 sm:pt-12 sm:pb-20' id='projects'>
      <div className='container mx-auto px-4'>
        <ScrollReveal>
          <SectionHeading
            aside={
              <Button asChild className='rounded-full' variant='outline'>
                <Link href='/projects'>
                  {t("viewAll")} <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            }
            className='mb-6'
            description={t("description")}
            tag='featured_projects'
            title={t("title")}
          />
        </ScrollReveal>

        <div className={cn("grid gap-5", isSpotlight ? "lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
          {cards.map((card, idx) => (
            <ScrollReveal
              className={cn(isSpotlight && cards.length === 1 && "lg:col-span-2")}
              delay={idx * 80}
              key={card.id}
              variant='fade-up'
            >
              <PostCard data={isSpotlight ? { ...card, viewMode: "list" } : card} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeaturedProjectsSection };
