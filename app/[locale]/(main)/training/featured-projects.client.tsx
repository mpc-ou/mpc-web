"use client";

import { ArrowRight, Code2, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import type { ProjectSummary } from "@/types/common";

export function FeaturedProjectsClient({ projects }: { projects: ProjectSummary[] }) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className='mt-24'>
      <div className='mb-12 flex flex-col items-center justify-between gap-4 md:flex-row'>
        <div>
          <h2 className='font-bold text-3xl sm:text-4xl'>Dự án nổi bật</h2>
          <p className='mt-2 text-muted-foreground'>
            Sản phẩm thực tế do chính các thành viên Câu lạc bộ nghiên cứu và phát triển
          </p>
        </div>
        <Button asChild className='shrink-0 rounded-full' variant='outline'>
          <Link href='/projects'>
            Xem tất cả dự án <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project) => {
          const techs = Array.isArray(project.technologies) ? project.technologies : [];

          return (
            <Link
              className='group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md'
              href={`/projects/${project.slug}`}
              key={project.id}
            >
              <div className='relative aspect-video w-full overflow-hidden bg-muted/30'>
                {project.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={project.title}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    src={project.thumbnail}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center font-bold text-4xl text-muted-foreground/30'>
                    <Code2 className='h-12 w-12 opacity-50' />
                  </div>
                )}
              </div>
              <div className='flex flex-1 flex-col p-5'>
                <h3 className='mb-2 font-bold text-foreground text-xl leading-tight transition-colors group-hover:text-primary'>
                  {project.title}
                </h3>
                <p className='mb-4 line-clamp-2 flex-1 text-muted-foreground text-sm'>
                  {project.description || "Chưa có mô tả."}
                </p>
                {techs.length > 0 && (
                  <div className='flex flex-wrap gap-1.5'>
                    {techs.slice(0, 3).map((t: string) => (
                      <Badge className='flexfont-normal px-1.5 text-[10px]' key={t} variant='secondary'>
                        {t}
                      </Badge>
                    ))}
                    {techs.length > 3 && (
                      <Badge className='px-1.5 font-normal text-[10px]' variant='secondary'>
                        +{techs.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
