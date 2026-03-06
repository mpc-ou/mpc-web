"use client";

import { ChevronLeft, ChevronRight, Code2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import type { ProjectSummary } from "@/types/common";

export function ProjectsClient({
  projects,
  currentPage,
  totalPages
}: {
  projects: ProjectSummary[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      {projects.length === 0 ? (
        <div className='py-20 text-center text-muted-foreground'>Chưa có dự án nào được đăng tải.</div>
      ) : (
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
                        <Badge className='px-1.5 font-normal text-[10px]' key={t} variant='secondary'>
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
      )}

      {/* Pagination Container */}
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
