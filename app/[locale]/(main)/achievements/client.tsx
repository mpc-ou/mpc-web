"use client";

import { Calendar, ChevronLeft, ChevronRight, User2, Users } from "lucide-react";
import { marked } from "marked";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

marked.setOptions({ gfm: true, breaks: true });

type AchievementMember = {
  role: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
};

type Achievement = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  date: Date;
  type: string;
  isHighlight: boolean;
  relatedUrl: string | null;
  members: AchievementMember[];
};

export function AchievementsClient({
  achievements,
  currentPage,
  totalPages
}: {
  achievements: Achievement[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Achievement | null>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const getHtml = (md: string) => {
    try {
      return typeof marked.parse(md) === "string" ? (marked.parse(md) as string) : "";
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* Grid */}
      <div className='mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {achievements.map((item) => (
          <div
            className='group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'
            key={item.id}
            onClick={() => setSelected(item)}
          >
            {/* Thumbnail */}
            <div className='relative aspect-video w-full overflow-hidden bg-muted/50'>
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={item.title}
                  className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  src={item.thumbnail}
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-muted-foreground/30'>
                  <TrophyPlaceholder />
                </div>
              )}
              {item.isHighlight && (
                <div className='absolute top-3 right-3'>
                  <Badge className='bg-yellow-500 text-black hover:bg-yellow-400'>⭐ Nổi bật</Badge>
                </div>
              )}
            </div>

            {/* Content Preview */}
            <div className='flex flex-1 flex-col p-5'>
              <div className='mb-3 flex items-center gap-2 text-muted-foreground text-xs'>
                <span className='flex items-center gap-1'>
                  <Calendar className='h-3.5 w-3.5' />
                  {new Date(item.date).toLocaleDateString("vi-VN")}
                </span>
                <span className='flex items-center gap-1 border-border border-l pl-2'>
                  {item.type === "INDIVIDUAL" ? <User2 className='h-3.5 w-3.5' /> : <Users className='h-3.5 w-3.5' />}
                  {item.type === "INDIVIDUAL" ? "Cá nhân" : item.type === "TEAM" ? "Nhóm" : "Tập thể"}
                </span>
              </div>

              <h3 className='mb-2 line-clamp-2 font-bold text-lg group-hover:text-primary'>{item.title}</h3>

              {item.summary && <p className='line-clamp-3 flex-1 text-muted-foreground text-sm'>{item.summary}</p>}
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className='col-span-full py-20 text-center text-muted-foreground'>
            Chưa có thành tựu nào được cập nhật.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            size='icon'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='min-w-16 text-center font-medium text-sm'>
            {currentPage} / {totalPages}
          </span>
          <Button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            size='icon'
            variant='outline'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog onOpenChange={(open) => !open && setSelected(null)} open={!!selected}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-xl sm:text-2xl'>{selected?.title}</DialogTitle>
            <div className='flex flex-wrap items-center gap-3 pt-2 text-muted-foreground text-sm'>
              {selected?.date && (
                <span className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  {new Date(selected.date).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>
          </DialogHeader>

          <div className='space-y-6 pt-4'>
            {/* Image */}
            {selected?.thumbnail && (
              <div className='overflow-hidden rounded-lg border'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt='Thumbnail' className='w-full object-cover' src={selected.thumbnail} />
              </div>
            )}

            {/* Markdown Content */}
            {selected?.content ? (
              <div
                className='prose prose-sm md:prose-base dark:prose-invert max-w-none'
                dangerouslySetInnerHTML={{ __html: getHtml(selected.content) }}
              />
            ) : selected?.summary ? (
              <p className='text-muted-foreground'>{selected.summary}</p>
            ) : null}

            {/* Related Link */}
            {selected?.relatedUrl && (
              <div className='pt-2'>
                <Button asChild variant='outline'>
                  <a href={selected.relatedUrl} rel='noopener noreferrer' target='_blank'>
                    Xem thêm thông tin
                  </a>
                </Button>
              </div>
            )}

            {/* Members Involved */}
            {selected?.members && selected.members.length > 0 && (
              <div className='rounded-xl border border-border bg-muted/30 p-4'>
                <h4 className='mb-3 font-semibold text-muted-foreground text-sm'>Thành viên tham gia</h4>
                <div className='flex flex-wrap gap-2'>
                  {selected.members.map((m) => (
                    <div
                      className='flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 shadow-xs'
                      key={m.member.id}
                    >
                      {m.member.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt='Avatar' className='h-6 w-6 rounded-full object-cover' src={m.member.avatar} />
                      ) : (
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-bold text-[10px] text-primary'>
                          {m.member.firstName[0]}
                        </div>
                      )}
                      <div className='flex flex-col'>
                        <span className='font-medium text-xs'>{`${m.member.firstName} ${m.member.lastName}`}</span>
                        {m.role && <span className='text-[10px] text-muted-foreground'>{m.role}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const TrophyPlaceholder = () => (
  <svg
    fill='none'
    height='48'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='1.5'
    viewBox='0 0 24 24'
    width='48'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
    <path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
    <path d='M4 22h16' />
    <path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' />
    <path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' />
    <path d='M18 2H6v7a6 6 0 0 0 12 0V2Z' />
  </svg>
);
