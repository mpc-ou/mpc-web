import { CalendarDays, ChevronLeft, Github, Globe2, Play, UserCircle, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getGoldBoardMembers, getOtherProjects, getProjectDetail } from "@/app/_actions/main";
import { MarkdownContent } from "@/components/markdown-content";
import type { PostCardData } from "@/components/post-card";
import { PostCard } from "@/components/post-card";
import { PostGalleryPanel } from "@/components/post-gallery-panel.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { Prisma } from "@/configs/prisma/generated/prisma/client";
import { getFullName, pickLang } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";
import { generatePageSeo } from "@/utils/seo";
import type { ProjectSummaryWithI18n } from "../client";

// Mirrors the `include` used in getProjectDetail (app/_actions/main/projects.ts)
type ProjectDetail = Prisma.ProjectGetPayload<{
  include: {
    members: {
      include: {
        member: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
            middleName: true;
            avatar: true;
            slug: true;
          };
        };
      };
    };
  };
}> & { images?: string[] };

// Mirrors the `select` used in getOtherProjects
type OtherProject = ProjectSummaryWithI18n;

// Mirrors the `select` used in getGoldBoardMembers
type GoldBoardMember = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  avatar: string | null;
  slug: string;
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const { data } = await getProjectDetail(slug);
  const project = (data?.payload as { project: ProjectDetail | null } | undefined)?.project;

  if (!project) {
    const tSeo = await getTranslations({ locale, namespace: "seo.notFound" });
    return { title: tSeo("project") };
  }

  return generatePageSeo({
    page: "projectDetail",
    title: project.title,
    description: project.description?.slice(0, 160) || undefined,
    locale: locale || "vi",
    pathname: `/projects/${slug}`,
    image: project.thumbnail || undefined,
    type: "article"
  });
}

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<React.ReactNode> {
  const { slug, locale } = await params;
  const lang = locale as "en" | "vi";
  const [{ data }, { data: otherData }, { data: goldData }, t] = await Promise.all([
    getProjectDetail(slug),
    getOtherProjects(slug),
    getGoldBoardMembers(),
    getTranslations({ locale, namespace: "projects" })
  ]);
  const project = (data?.payload as { project: ProjectDetail | null } | undefined)?.project;

  if (!project?.isActive) {
    notFound();
  }

  const otherProjects = (otherData?.payload as { projects: OtherProject[] } | undefined)?.projects ?? [];
  const goldMembers = (goldData?.payload as { members: GoldBoardMember[] } | undefined)?.members ?? [];

  const techs = Array.isArray(project.technologies) ? (project.technologies as string[]) : [];

  // Build gallery: thumbnail + content images + project images
  const thumbnail = project.thumbnail ? [project.thumbnail] : [];
  const contentImages: string[] = [];
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  imgRegex.lastIndex = 0;
  let match = imgRegex.exec(project.content || "");
  while (match !== null) {
    if (match[1]) {
      contentImages.push(match[1]);
    }
    match = imgRegex.exec(project.content || "");
  }
  const projectImages = Array.isArray(project.images) ? project.images : [];
  const allImages = Array.from(new Set([...thumbnail, ...contentImages, ...projectImages])).filter(Boolean);
  const hasGallery = allImages.length > 0;
  const hasSidebar = hasGallery || (project.members && project.members.length > 0);

  const startDateLabel = project.startDate ? formatLocalDate(project.startDate, locale, "MMMM yyyy") : null;
  const endDateLabel = project.endDate ? formatLocalDate(project.endDate, locale, "MMMM yyyy") : t("present");

  const otherProjectCards: PostCardData[] = otherProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    variant: "project" as const,
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
    <div className='min-h-screen bg-background'>
      {/* ── HERO IMAGE ─────────────────────────────────────────────── */}
      {project.thumbnail ? (
        <div className='relative h-[30vh] min-h-56 w-full overflow-hidden'>
          <Image alt={project.title} className='object-cover' fill priority sizes='100vw' src={project.thumbnail} />
          <div className='absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent' />
        </div>
      ) : (
        <div className='h-24 sm:h-32' />
      )}

      {/* ── ARTICLE ────────────────────────────────────────────────── */}
      <div className='container mx-auto max-w-7xl px-4 pb-24'>
        {/* Back link */}
        <div className='py-5'>
          <Button asChild className='-ml-3 text-muted-foreground' size='sm' variant='ghost'>
            <Link href='/projects'>
              <ChevronLeft className='mr-1 h-4 w-4' />
              {t("backToList")}
            </Link>
          </Button>
        </div>

        {/* Tags */}
        <ScrollReveal>
          {techs.length > 0 && (
            <div className='mb-4 flex flex-wrap items-center gap-2'>
              {techs.map((tech) => (
                <Badge className='px-3 py-1' key={tech} variant='secondary'>
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className='mb-5 font-bold text-3xl leading-tight tracking-tight sm:text-4xl'>
            {pickLang(lang, project.title, project.titleEn)}
          </h1>

          {/* Short Description */}
          {(project.description || project.descriptionEn) && (
            <p className='mb-6 text-lg text-muted-foreground md:text-xl'>
              {pickLang(lang, project.description, project.descriptionEn) || project.description}
            </p>
          )}

          {/* Byline — date & action links */}
          <div className='mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-foreground text-sm'>
            {startDateLabel && (
              <span className='flex items-center gap-1.5 font-medium'>
                <CalendarDays className='h-4 w-4 shrink-0 text-primary/80' />
                {startDateLabel} — {endDateLabel}
              </span>
            )}
          </div>

          <div className='mb-6 flex flex-wrap gap-3'>
            {project.githubUrl && (
              <Button asChild size='sm' variant='outline'>
                <a href={project.githubUrl} rel='noopener noreferrer' target='_blank'>
                  <Github className='mr-2 h-4 w-4' /> {t("sourceCode")}
                </a>
              </Button>
            )}
            {project.websiteUrl && (
              <Button asChild size='sm'>
                <a href={project.websiteUrl} rel='noopener noreferrer' target='_blank'>
                  <Globe2 className='mr-2 h-4 w-4' /> {t("viewWebsite")}
                </a>
              </Button>
            )}
            {project.videoUrl && (
              <Button asChild size='sm' variant='secondary'>
                <a href={project.videoUrl} rel='noopener noreferrer' target='_blank'>
                  <Play className='mr-2 h-4 w-4' /> {t("viewVideo")}
                </a>
              </Button>
            )}
          </div>
        </ScrollReveal>

        <Separator className='mb-10' />

        {/* ── BODY + SIDEBAR ── */}
        <div className={`flex flex-col gap-10 ${hasSidebar ? "lg:flex-row lg:gap-12" : ""}`}>
          <div className={`min-w-0 ${hasSidebar ? "flex-1" : "w-full"}`}>
            {/* Markdown content */}
            {project.content || project.contentEn ? (
              <ScrollReveal delay={100} variant='fade-up'>
                <MarkdownContent
                  content={pickLang(lang, project.content, project.contentEn) || project.content || ""}
                />
              </ScrollReveal>
            ) : (
              <p className='mb-14 text-muted-foreground italic'>{t("noDetail")}</p>
            )}
          </div>

          {/* Sidebar: Gallery + Members */}
          {hasSidebar && (
            <aside className='sticky top-6 w-full shrink-0 space-y-8 lg:w-[30%] xl:w-72'>
              {hasGallery && (
                <PostGalleryPanel images={allImages} title={`${t("galleryTitle")} (${allImages.length})`} />
              )}

              {project.members && project.members.length > 0 && (
                <section>
                  <h2 className='mb-5 flex items-center gap-2 border-border border-b pb-2 font-bold text-xl'>
                    <Users className='h-5 w-5 text-primary' /> {t("teamTitle")}
                  </h2>
                  <div className='flex flex-col gap-3'>
                    {project.members.map((m) => (
                      <div className='flex items-center gap-3' key={m.member.id}>
                        {m.member.avatar ? (
                          <Image
                            alt={getFullName(m.member.firstName, m.member.middleName, m.member.lastName, locale)}
                            className='shrink-0 rounded-full object-cover ring-2 ring-border'
                            height={40}
                            src={m.member.avatar}
                            width={40}
                          />
                        ) : (
                          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted'>
                            <UserCircle className='h-6 w-6 text-muted-foreground' />
                          </div>
                        )}
                        <div className='min-w-0'>
                          <Link
                            className='block truncate font-medium text-sm hover:text-primary hover:underline'
                            href={`/members/${m.member.slug || m.member.id}`}
                          >
                            {getFullName(m.member.firstName, m.member.middleName, m.member.lastName, locale)}
                          </Link>
                          {m.role && <p className='truncate text-muted-foreground text-xs'>{m.role}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* ── OTHER PROJECTS ── */}
      {otherProjects.length > 0 && (
        <section className='w-full bg-background py-20'>
          <div className='container mx-auto px-4'>
            <div className='mb-12 text-center'>
              <span className='inline-flex rounded-full bg-primary/10 px-3 py-1 font-medium font-mono text-primary text-sm'>
                &gt; {t("otherProjects.badge")}
              </span>
              <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>
                {t("otherProjects.title")}
              </h2>
              <p className='mx-auto mt-3 max-w-2xl text-muted-foreground'>{t("otherProjects.subtitle")}</p>
            </div>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {otherProjectCards.map((card) => (
                <ScrollReveal key={card.id} variant='fade-up'>
                  <PostCard data={card} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
