import { ArrowRight, CalendarDays, Image as ImageIcon } from "lucide-react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { getRecentEvents } from "@/app/[locale]/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";

export async function RecentEventsSection() {
  await connection(); // opt-out of static prerender
  const { data } = await getRecentEvents(3);
  const t = await getTranslations();
  // biome-ignore lint/suspicious/noExplicitAny: API response shape is untyped
  const events = (data?.payload as any)?.events || [];

  if (events.length === 0) {
    return null;
  }

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    UPCOMING: { label: "Sắp diễn ra", variant: "default" },
    ONGOING: { label: "Đang diễn ra", variant: "secondary" },
    COMPLETED: { label: "Đã diễn ra", variant: "outline" }
  };

  return (
    <section className='py-20 md:py-32' id='recent-events'>
      <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <ScrollReveal className='mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end'>
          <div className='max-w-2xl space-y-4 text-center md:text-left'>
            <h2 className='font-bold text-3xl text-foreground tracking-tight md:text-4xl'>Sự kiện mới nhất</h2>
            <div className='mx-auto h-1 w-20 rounded-full bg-primary/80 md:mx-0' />
            <p className='text-lg text-muted-foreground'>Cập nhật những hoạt động nổi bật của câu lạc bộ.</p>
          </div>

          <Button asChild className='hidden rounded-full md:flex' variant='outline'>
            <Link href='/events'>
              Xem tất cả sự kiện <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </ScrollReveal>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {events.map((event: any, idx: number) => {
            const statusInfo = statusMap[event.status] || {
              label: event.status,
              variant: "outline"
            };
            const dateStr = event.startAt ? new Date(event.startAt).toLocaleDateString("vi-VN") : "";

            return (
              <ScrollReveal delay={idx * 150} key={event.id} variant='fade-up'>
                <Link
                  className='group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg'
                  href={`/events/${event.slug}`}
                >
                  <div className='relative aspect-[4/3] w-full overflow-hidden bg-muted/30'>
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

                  <div className='flex grow flex-col p-6'>
                    <h3 className='mb-3 line-clamp-2 font-bold text-foreground text-xl leading-tight transition-colors group-hover:text-primary'>
                      {event.title}
                    </h3>

                    <div className='mb-4 flex items-center gap-2 font-medium text-muted-foreground text-xs'>
                      <CalendarDays className='h-3.5 w-3.5' />
                      <span>{dateStr}</span>
                    </div>

                    <p className='mb-6 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed'>
                      {event.description || "Chưa có mô tả ngắn về sự kiện này."}
                    </p>

                    <div className='mt-auto flex items-center border-border/10 border-t pt-4 font-semibold text-primary text-sm'>
                      Xem chi tiết
                      <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <div className='mt-10 flex justify-center md:hidden'>
          <Button asChild className='w-full max-w-sm rounded-full' variant='outline'>
            <Link href='/events'>
              Xem tất cả sự kiện <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
