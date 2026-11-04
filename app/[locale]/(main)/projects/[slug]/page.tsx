import { CalendarDays, ChevronLeft, Github, Globe2, Pencil, Play, UserCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { checkUserIsAdmin, getOtherProjects, getProjectDetail } from "@/app/_actions/main";
import { MarkdownContent } from "@/components/markdown-content";
import { MarkdownInline } from "@/components/markdown-inline";
import type { PostCardData } from "@/components/post-card";
import { PostCard } from "@/components/post-card";
import { PostGalleryPanel } from "@/components/post-gallery-panel.client";
import { SoftwareSourceCodeJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/configs/i18n/routing";
import type { Prisma } from "@/configs/prisma/generated/prisma/client";
import { SITE_URL } from "@/constants/seo";
import { getFullName, pickLang } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";
import { resolvePostSummary, stripMarkdownToPlainText } from "@/utils/markdown-summary";
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

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const lang = locale as "en" | "vi";
  const { data } = await getProjectDetail(slug);
  const project = (data?.payload as { project: ProjectDetail | null } | undefined)?.project;

  if (!project?.isActive) {
    const tSeo = await getTranslations({ locale, namespace: "seo.notFound" });
    return {
      title: tSeo("project"),
      robots: { index: false, follow: false }
    };
  }

  const localizedTitle = pickLang(lang, project.title, project.titleEn) || project.title;
  const localizedDesc = pickLang(lang, project.description, project.descriptionEn) || project.description;
  const localizedContent = pickLang(lang, project.content, project.contentEn) || project.content;
  const plainDesc = stripMarkdownToPlainText(resolvePostSummary(localizedDesc, localizedContent));
  const techs = Array.isArray(project.technologies) ? (project.technologies as string[]) : [];

  return generatePageSeo({
    page: "projectDetail",
    title: localizedTitle,
    description: plainDesc || undefined,
    locale: locale || "vi",
    pathname: `/projects/${slug}`,
    image: project.thumbnail || undefined,
    type: "article",
    publishedTime: project.startDate ? new Date(project.startDate).toISOString() : undefined,
    tags: techs
  });
}

function extractProjectGalleryImages(project: ProjectDetail): string[] {
  const thumbnail = project.thumbnail ? [project.thumbnail] : [];
  const contentImages: string[] = [];
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  let match = imgRegex.exec(project.content || "");
  while (match !== null) {
    if (match[1]) {
      contentImages.push(match[1]);
    }
    match = imgRegex.exec(project.content || "");
  }
  const projectImages = Array.isArray(project.images) ? project.images : [];
  return Array.from(new Set([...thumbnail, ...contentImages, ...projectImages])).filter(Boolean);
}

function ProjectTeamAvatars({
  members,
  locale,
  teamLabel
}: {
  members?: ProjectDetail["members"];
  locale: string;
  teamLabel: string;
}) {
  if (!members || members.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={80}>
      <div className='flex flex-wrap items-center gap-3'>
        <span className='font-mono text-muted-foreground text-xs uppercase tracking-wider'>{teamLabel}:</span>
        <div className='flex flex-wrap items-center pl-2'>
          {members.map((m, idx) => {
            const fullName = getFullName(m.member.firstName, m.member.middleName, m.member.lastName, locale);
            return (
              <Tooltip key={m.member.id}>
                <TooltipTrigger asChild>
                  <span className={`inline-flex ${idx > 0 ? "-ml-2.5" : ""}`} style={{ zIndex: members.length - idx }}>
                    <Link
                      aria-label={m.role ? `${fullName} — ${m.role}` : fullName}
                      className='group relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted ring-1 ring-border transition-all duration-200 hover:z-20 hover:-translate-y-0.5 hover:scale-110 hover:ring-2 hover:ring-primary'
                      href={`/members/${m.member.slug || m.member.id}`}
                    >
                      {m.member.avatar ? (
                        <Image alt={fullName} className='object-cover' fill sizes='40px' src={m.member.avatar} />
                      ) : (
                        <UserCircle className='h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary' />
                      )}
                    </Link>
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  className='rounded-xl border border-border/80 bg-popover px-3.5 py-2 text-popover-foreground shadow-xl'
                  side='top'
                  sideOffset={8}
                >
                  <p className='font-semibold text-xs leading-tight'>{fullName}</p>
                  {m.role && <p className='mt-0.5 font-mono text-[11px] text-primary leading-tight'>{m.role}</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: project detail page layout
export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<React.ReactNode> {
  const { slug, locale } = await params;
  const lang = locale as "en" | "vi";
  const [{ data }, { data: otherData }, { data: isAdminData }, t] = await Promise.all([
    getProjectDetail(slug),
    getOtherProjects(slug),
    checkUserIsAdmin(),
    getTranslations({ locale, namespace: "projects" })
  ]);
  const canEdit = isAdminData?.payload ?? false;
  const project = (data?.payload as { project: ProjectDetail | null } | undefined)?.project;

  if (!project?.isActive) {
    notFound();
  }

  const otherProjects = (otherData?.payload as { projects: OtherProject[] } | undefined)?.projects ?? [];
  const techs = Array.isArray(project.technologies) ? (project.technologies as string[]) : [];

  const allImages = extractProjectGalleryImages(project);
  const hasGallery = allImages.length > 0;

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
      <SoftwareSourceCodeJsonLd
        codeRepository={project.githubUrl}
        dateCreated={project.startDate ? new Date(project.startDate).toISOString() : null}
        description={pickLang(lang, project.description, project.descriptionEn) || project.description || project.title}
        image={project.thumbnail}
        name={pickLang(lang, project.title, project.titleEn) || project.title}
        programmingLanguages={techs}
        url={`${SITE_URL}/${locale}/projects/${slug}`}
      />
      {project.thumbnail ? (
        <div className='relative h-[30vh] min-h-56 w-full overflow-hidden'>
          <Image alt={project.title} className='object-cover' fill priority sizes='100vw' src={project.thumbnail} />
          <div className='absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent' />
        </div>
      ) : (
        <div className='h-24 sm:h-32' />
      )}

      <div className='container mx-auto max-w-7xl px-4 pb-24'>
        <div className='flex items-center justify-between gap-3 py-5'>
          <Button asChild className='-ml-3 text-muted-foreground' size='sm' variant='ghost'>
            <Link href='/projects'>
              <ChevronLeft className='mr-1 h-4 w-4' />
              {t("backToList")}
            </Link>
          </Button>
          {canEdit && (
            <Button
              asChild
              className='h-8 gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/15'
              size='sm'
              title='Chỉnh sửa dự án trong Admin'
              variant='outline'
            >
              <NextLink href={`/admin/projects/${project.id}/edit`}>
                <Pencil className='h-3.5 w-3.5' />
                <span className='text-xs'>Chỉnh sửa</span>
              </NextLink>
            </Button>
          )}
        </div>

        <ScrollReveal>
          {techs.length > 0 && (
            <div className='mb-4 flex flex-wrap items-center gap-2'>
              {techs.map((tech) => (
                <Link href={`/search?q=${encodeURIComponent(tech)}` as "/"} key={tech}>
                  <Badge
                    className='cursor-pointer px-3 py-1 transition-colors hover:bg-secondary/80'
                    variant='secondary'
                  >
                    {tech}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <h1 className='mb-5 font-bold text-3xl leading-tight tracking-tight sm:text-4xl'>
            {pickLang(lang, project.title, project.titleEn)}
          </h1>

          {(project.description || project.descriptionEn) && (
            <div className='mb-6 text-lg text-muted-foreground md:text-xl'>
              <MarkdownInline
                content={pickLang(lang, project.description, project.descriptionEn) || project.description || ""}
              />
            </div>
          )}

          <div className='mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-foreground text-sm'>
            {startDateLabel && (
              <span className='flex items-center gap-1.5 font-medium'>
                <CalendarDays className='h-4 w-4 shrink-0 text-primary/80' />
                {startDateLabel} - {endDateLabel}
              </span>
            )}
          </div>

          <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
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

            <ProjectTeamAvatars locale={locale} members={project.members} teamLabel={t("teamTitle")} />
          </div>
        </ScrollReveal>

        <Separator className='mb-10' />

        {/* ── BODY: FULL WIDTH + BOTTOM COMPACT GALLERY ── */}
        <div className='w-full'>
          {project.content || project.contentEn ? (
            <ScrollReveal delay={100} variant='fade-up'>
              <MarkdownContent content={pickLang(lang, project.content, project.contentEn) || project.content || ""} />
            </ScrollReveal>
          ) : (
            <p className='mb-14 text-muted-foreground italic'>{t("noDetail")}</p>
          )}

          {hasGallery && (
            <div className='mt-12 border-border/60 border-t pt-8'>
              <PostGalleryPanel images={allImages} title={`${t("galleryTitle")} (${allImages.length})`} />
            </div>
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
            <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
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
