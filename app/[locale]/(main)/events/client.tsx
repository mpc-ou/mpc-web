"use client";

import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

export function DynamicEventsClient({
  events,
  currentPage,
  totalPages
}: {
  events: any[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations();

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    UPCOMING: { label: "Sắp diễn ra", variant: "default" },
    ONGOING: { label: "Đang diễn ra", variant: "secondary" },
    COMPLETED: { label: "Đã diễn ra", variant: "outline" }
  };

  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      {events.length === 0 ? (
        <div className='py-20 text-center text-muted-foreground'>Chưa có sự kiện nào được đăng tải.</div>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {events.map((event) => {
            const statusInfo = statusMap[event.status] || {
              label: event.status,
              variant: "outline"
            };
            const dateStr = event.startAt ? new Date(event.startAt).toLocaleDateString("vi-VN") : "";

            return (
              <Link
                className='group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md'
                href={`/events/${event.slug}`}
                key={event.id}
              >
                <div className='relative aspect-video w-full overflow-hidden bg-muted/30'>
                  {event.thumbnail ? (
                    <img
                      alt={event.title}
                      className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      src={event.thumbnail}
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center font-bold text-4xl text-muted-foreground/30'>
                      <ImageIcon className='h-12 w-12 opacity-50' />
                    </div>
                  )}
                  <div className='absolute top-3 left-3 flex flex-wrap gap-2 pr-3'>
                    <Badge className='bg-background/80 shadow-xs backdrop-blur-md' variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                    {event.type && event.type !== "OTHER" && (
                      <Badge
                        className='bg-background/80 text-foreground shadow-xs backdrop-blur-md hover:bg-background/90'
                        variant='secondary'
                      >
                        {t(`events.types.${event.type}` as any) || event.type}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className='flex grow flex-col p-5'>
                  <h3 className='mb-2 font-bold text-foreground text-xl leading-tight transition-colors group-hover:text-primary'>
                    {event.title}
                  </h3>

                  <div className='mb-3 flex items-center gap-2 font-medium text-muted-foreground text-xs'>
                    <CalendarDays className='h-3.5 w-3.5' />
                    <span>{dateStr}</span>
                  </div>

                  <p className='mb-4 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed'>
                    {event.description || "Chưa có mô tả ngắn về sự kiện này."}
                  </p>

                  <div className='mt-auto flex items-center border-border/10 border-t pt-4 font-semibold text-primary text-sm'>
                    Xem chi tiết
                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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
