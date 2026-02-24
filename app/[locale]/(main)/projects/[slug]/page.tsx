import { marked } from "marked";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  Github,
  Globe2,
  Play,
  UserCircle,
  Users,
} from "lucide-react";
import { getProjectDetail } from "@/app/[locale]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { sanitizeHtml } from "@/utils/sanitize-html";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProjectDetail(slug);
  const project = (data?.payload as any)?.project;

  if (!project) {
    return { title: "Không tìm thấy dự án" };
  }

  return {
    title: `${project.title} | Dự án MPC`,
    description:
      project.description?.slice(0, 160) || "Dự án của câu lạc bộ MPC",
    openGraph: {
      images: project.thumbnail ? [project.thumbnail] : [],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getProjectDetail(slug);
  const project = (data?.payload as any)?.project;

  if (!project?.isActive) {
    notFound();
  }

  const techs = Array.isArray(project.technologies)
    ? (project.technologies as string[])
    : [];

  const rawHtml = project.content
    ? marked.parse(project.content, { gfm: true, breaks: true })
    : null;
  const contentHtml = rawHtml
    ? typeof rawHtml === "string"
      ? rawHtml
      : await rawHtml
    : null;

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
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-foreground">
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

        <Separator className="mb-10" />

        {/* ── ARTICLE BODY ── */}
        {contentHtml ? (
          <article
            className="prose prose-neutral dark:prose-invert max-w-none mb-14
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-base prose-p:my-4
              prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
              prose-a:text-primary prose-a:underline-offset-4
              prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground
              prose-li:my-1 prose-ul:my-4 prose-ol:my-4
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }}
          />
        ) : (
          <p className="mb-14 text-muted-foreground italic">
            Chưa có thông tin chi tiết về dự án này.
          </p>
        )}

        {/* ── MEMBERS ── */}
        {project.members && project.members.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 border-b border-border pb-2 font-bold text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Đội ngũ phát triển
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {project.members.map((m: any) => (
                <div className="flex items-center gap-3" key={m.member.id}>
                  {m.member.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={`${m.member.firstName} ${m.member.lastName}`}
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
                      href={`/members/${m.member.slug || m.member.id}`}
                      className="block truncate text-sm font-medium hover:text-primary hover:underline"
                    >
                      {m.member.firstName} {m.member.lastName}
                    </Link>
                    {m.role && (
                      <p className="truncate text-xs text-muted-foreground">
                        {m.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
