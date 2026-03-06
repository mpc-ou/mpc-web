"use client";

import { Calendar, ExternalLink, Github, Globe, Play, Users } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { sanitizeHtml } from "@/utils/sanitize-html";

export type ProjectDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  thumbnail: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  videoUrl: string | null;
  technologies: string[];
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  members?: Array<{
    member: { id: string; firstName: string; lastName: string };
    role: string | null;
  }>;
  /** Role of the viewer in this project (from ProjectMember join) */
  viewerRole?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectDetail | null;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) {
    return null;
  }
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/** Convert a YouTube URL to an embeddable URL */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    const videoId = u.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    /* not a valid URL */
  }
  return url;
}

export function ProjectDetailDialog({ open, onOpenChange, project }: Props) {
  if (!project) {
    return null;
  }

  const startFormatted = formatDate(project.startDate);
  const endFormatted = formatDate(project.endDate);
  const hasLinks = project.githubUrl || project.websiteUrl || project.videoUrl;
  const hasMembers = project.members && project.members.length > 0;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        {project.thumbnail && (
          <div className='relative -mx-6 -mt-6 mb-5 h-48 w-full shrink-0 overflow-hidden rounded-t-lg border-b sm:h-64'>
            <Image
              alt={project.title}
              className='object-cover'
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              src={project.thumbnail}
            />
          </div>
        )}

        <DialogHeader>
          <div className='flex items-center gap-2'>
            <DialogTitle className='text-xl'>{project.title}</DialogTitle>
            <Badge variant={project.isActive ? "default" : "outline"}>
              {project.isActive ? "Hoạt động" : "Kết thúc"}
            </Badge>
          </div>
          {project.description && (
            <p className='mt-1 whitespace-pre-wrap text-muted-foreground text-sm'>{project.description}</p>
          )}
        </DialogHeader>

        {/* Date & role info */}
        {(startFormatted || project.viewerRole) && (
          <div className='flex flex-wrap gap-4 text-muted-foreground text-sm'>
            {startFormatted && (
              <span className='inline-flex items-center gap-1.5'>
                <Calendar className='h-4 w-4' />
                {startFormatted}
                {endFormatted ? ` → ${endFormatted}` : " → Hiện tại"}
              </span>
            )}
            {project.viewerRole && (
              <span className='inline-flex items-center gap-1.5'>
                <Users className='h-4 w-4' />
                Vai trò: {project.viewerRole}
              </span>
            )}
          </div>
        )}

        {/* Technologies */}
        {project.technologies.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {project.technologies.map((tech) => (
              <Badge className='text-xs' key={tech} variant='secondary'>
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {/* Links */}
        {hasLinks && (
          <>
            <Separator />
            <div className='flex flex-wrap gap-3'>
              {project.githubUrl && (
                <a
                  className='inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted'
                  href={project.githubUrl}
                  rel='noopener'
                  target='_blank'
                >
                  <Github className='h-4 w-4' />
                  GitHub
                  <ExternalLink className='h-3 w-3 opacity-50' />
                </a>
              )}
              {project.websiteUrl && (
                <a
                  className='inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted'
                  href={project.websiteUrl}
                  rel='noopener'
                  target='_blank'
                >
                  <Globe className='h-4 w-4' />
                  Website
                  <ExternalLink className='h-3 w-3 opacity-50' />
                </a>
              )}
              {project.videoUrl && (
                <a
                  className='inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted'
                  href={project.videoUrl}
                  rel='noopener'
                  target='_blank'
                >
                  <Play className='h-4 w-4' />
                  Video
                  <ExternalLink className='h-3 w-3 opacity-50' />
                </a>
              )}
            </div>
          </>
        )}

        {/* Video embed */}
        {project.videoUrl && (
          <div className='aspect-video overflow-hidden rounded-lg border'>
            <iframe
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              className='h-full w-full'
              src={toEmbedUrl(project.videoUrl)}
              title={`${project.title} video`}
            />
          </div>
        )}

        {/* Markdown content */}
        {project.content && (
          <>
            <Separator />
            <div
              className='prose prose-sm dark:prose-invert prose-iframe:aspect-video prose-iframe:w-full w-full max-w-none prose-iframe:max-w-full overflow-hidden whitespace-pre-wrap break-words prose-iframe:rounded-lg'
              // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(project.content)
              }}
            />
          </>
        )}

        {/* Members */}
        {hasMembers && (
          <>
            <Separator />
            <div>
              <h4 className='mb-3 flex items-center gap-1.5 font-semibold text-sm'>
                <Users className='h-4 w-4' />
                Thành viên dự án ({project.members?.length})
              </h4>
              <div className='flex flex-wrap gap-2'>
                {project.members?.map(({ member, role }) => (
                  <div
                    className='inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-sm'
                    key={member.id}
                  >
                    <span className='font-medium'>
                      {member.firstName} {member.lastName}
                    </span>
                    {role && (
                      <Badge className='text-[10px]' variant='outline'>
                        {role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
