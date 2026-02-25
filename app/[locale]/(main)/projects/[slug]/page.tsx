import {
  CalendarDays,
  ChevronLeft,
  Github,
  Globe2,
  Play,
  UserCircle,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectDetail } from "@/app/[locale]/actions";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { generatePageSeo } from "@/utils/seo";
import { getFullName } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const { data } = await getProjectDetail(slug);
  const project = (data?.payload as any)?.project;

  if (!project) {
    return { title: "Không tìm thấy dự án" };
  }

  return generatePageSeo({
    page: "projectDetail",
    title: project.title,
    description: project.description?.slice(0, 160) || undefined,
    locale: locale || "vi",
    pathname: `/projects/${slug}`,
    image: project.thumbnail || undefined,
    type: "article",
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const { data } = await getProjectDetail(slug);
  const project = (data?.payload as any)?.project;

  if (!project?.isActive) {
    notFound();
  }

  const techs = Array.isArray(project.technologies)
    ? (project.technologies as string[])
    : [];

  const startDateLabel = project.startDate
    ? new Date(project.startDate).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
      })
    : null;
  const endDateLabel = project.endDate
    ? new Date(project.endDate).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
      })
    : "Hiện tại";

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO IMAGE ─────────────────────────────────────────────── */}
      {project.thumbnail ? (
        <div className="relative h-[55vh] min-h-90 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={project.title}
            className="h-full w-full object-cover"
            src={project.thumbnail}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-24 sm:h-32" />
      )}

      {/* ── ARTICLE ────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-3xl px-4 pb-24">
        {/* Back link */}
        <div className="py-5">
          <Button
            asChild
            className="-ml-3 text-muted-foreground"
            size="sm"
            variant="ghost"
          >
            <Link href="/projects">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Trở lại danh sách dự án
            </Link>
          </Button>
        </div>

        {/* Tags */}
        <ScrollReveal>
          {techs.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {techs.map((t) => (
                <Badge className="px-3 py-1" key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-5 font-bold text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {project.title}
          </h1>

          {/* Short Description */}
          {project.description && (
            <p className="mb-6 text-lg text-muted-foreground md:text-xl">
              {project.description}
            </p>
          )}

          {/* Byline — date & action links */}
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-foreground text-sm">
            {startDateLabel && (
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarDays className="h-4 w-4 shrink-0 text-primary/80" />
                {startDateLabel} — {endDateLabel}
              </span>
            )}
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {project.githubUrl && (
              <Button asChild size="sm" variant="outline">
                <a
                  href={project.githubUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="mr-2 h-4 w-4" /> Source Code
                </a>
              </Button>
            )}
            {project.websiteUrl && (
              <Button asChild size="sm">
                <a
                  href={project.websiteUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Globe2 className="mr-2 h-4 w-4" /> Xem Website
                </a>
              </Button>
            )}
            {project.videoUrl && (
              <Button asChild size="sm" variant="secondary">
                <a
                  href={project.videoUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Play className="mr-2 h-4 w-4" /> Xem Video
                </a>
              </Button>
            )}
          </div>
        </ScrollReveal>

        <Separator className="mb-10" />

        {/* ── ARTICLE BODY ── */}
        {project.content ? (
          <ScrollReveal delay={100} variant="fade-up">
            <MarkdownContent content={project.content} />
          </ScrollReveal>
        ) : (
          <p className="mb-14 text-muted-foreground italic">
            Chưa có thông tin chi tiết về dự án này.
          </p>
        )}

        {/* ── MEMBERS ── */}
        {project.members && project.members.length > 0 && (
          <ScrollReveal variant="fade-up">
            <section className="mt-8 mb-14">
              <h2 className="mb-5 flex items-center gap-2 border-border border-b pb-2 font-bold text-xl">
                <Users className="h-5 w-5 text-primary" /> Đội ngũ phát triển
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {project.members.map((m: any) => (
                  <div className="flex items-center gap-3" key={m.member.id}>
                    {m.member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={getFullName(
                          m.member.firstName,
                          m.member.lastName,
                          locale,
                        )}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-border"
                        src={m.member.avatar}
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        <UserCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link
                        className="block truncate font-medium text-sm hover:text-primary hover:underline"
                        href={`/members/${m.member.slug || m.member.id}`}
                      >
                        {getFullName(
                          m.member.firstName,
                          m.member.lastName,
                          locale,
                        )}
                      </Link>
                      {m.role && (
                        <p className="truncate text-muted-foreground text-xs">
                          {m.role}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
