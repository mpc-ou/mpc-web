import { ChevronLeft, Code2, Github, Globe2, Play, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getProjectDetail } from "@/app/[locale]/actions";
import { ProjectContentClient } from "./client";

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
    description: project.description || "Dự án của câu lạc bộ MPC",
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

  if (!(project && project.isActive)) {
    notFound();
  }

  const techs = Array.isArray(project.technologies)
    ? (project.technologies as string[])
    : [];

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 sm:pt-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back Link */}
        <Button
          asChild
          className="mb-6 -ml-4 text-muted-foreground"
          variant="ghost"
        >
          <Link href="/projects">
            <ChevronLeft className="mr-2 h-4 w-4" /> Trở lại danh sách
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code2 className="h-6 w-6" />
            </div>
            <h1 className="flex-1 font-bold text-3xl sm:text-4xl md:text-5xl">
              {project.title}
            </h1>
          </div>

          <p className="text-lg text-muted-foreground md:text-xl">
            {project.description}
          </p>

          {techs.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {techs.map((t) => (
                <Badge
                  className="px-3 py-1 text-xs"
                  key={t}
                  variant="secondary"
                >
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Links */}
          <div className="mt-8 flex flex-wrap gap-4">
            {project.githubUrl && (
              <Button asChild variant="outline">
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
              <Button asChild>
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
              <Button asChild variant="secondary">
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
        </div>

        {/* Thumbnail Hero */}
        {project.thumbnail && (
          <div className="mb-12 overflow-hidden rounded-2xl border border-border shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={project.title}
              className="w-full object-cover"
              src={project.thumbnail}
            />
          </div>
        )}

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <h2 className="mb-6 border-border border-b pb-2 font-bold text-2xl">
              Nội dung chi tiết
            </h2>
            {project.content ? (
              <ProjectContentClient content={project.content} />
            ) : (
              <p className="text-muted-foreground italic">
                Chưa có thông tin chi tiết về dự án này.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Timeframe */}
            {(project.startDate || project.endDate) && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Thời gian phát triển</h3>
                <div className="text-muted-foreground text-sm">
                  {project.startDate &&
                    new Date(project.startDate).toLocaleDateString("vi-VN")}
                  {project.endDate && (
                    <>
                      <span className="mx-2">đến</span>
                      {new Date(project.endDate).toLocaleDateString("vi-VN")}
                    </>
                  )}
                  {!project.endDate && " - Hiện tại"}
                </div>
              </div>
            )}

            {/* Team Members */}
            {project.members && project.members.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Users className="h-5 w-5 text-primary" /> Đội ngũ phát triển
                </h3>
                <div className="space-y-4">
                  {project.members.map((m: any) => {
                    const initials = `${m.member.firstName[0]}${m.member.lastName[0]}`;
                    return (
                      <div
                        className="flex items-center gap-3"
                        key={m.member.id}
                      >
                        <Avatar className="h-10 w-10 border border-background shadow-xs">
                          {m.member.avatar && (
                            <AvatarImage src={m.member.avatar} />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <Link
                            className="font-medium text-sm hover:text-primary hover:underline"
                            href={`/members/${m.member.slug || m.member.id}`}
                          >
                            {m.member.firstName} {m.member.lastName}
                          </Link>
                          {m.role && (
                            <span className="text-muted-foreground text-xs">
                              {m.role}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
