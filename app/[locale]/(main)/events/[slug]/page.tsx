import { CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getEventBySlug } from "@/app/[locale]/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import { EventContentClient } from "./client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getEventBySlug(slug);
  const event = (data?.payload as any)?.event;

  if (!event) {
    return { title: "Không tìm thấy sự kiện" };
  }

  return {
    title: `${event.title} | Sự kiện MPC`,
    description: event.description || "Sự kiện của câu lạc bộ MPC"
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data } = await getEventBySlug(slug);
  const event = (data?.payload as any)?.event;

  if (!event) {
    notFound();
  }

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    UPCOMING: { label: "Sắp diễn ra", variant: "default" },
    ONGOING: { label: "Đang diễn ra", variant: "secondary" },
    COMPLETED: { label: "Đã diễn ra", variant: "outline" }
  };

  const statusInfo = statusMap[event.status] || {
    label: event.status,
    variant: "outline"
  };

  return (
    <div className='min-h-screen bg-background pt-10 pb-20 sm:pt-20'>
      <div className='container mx-auto max-w-4xl px-4'>
        {/* Back Link */}
        <Button asChild className='mb-6 -ml-4 text-muted-foreground' variant='ghost'>
          <Link href='/events'>
            <ChevronLeft className='mr-2 h-4 w-4' /> Trở lại danh sách sự kiện
          </Link>
        </Button>

        {/* Header */}
        <div className='mb-10'>
          <div className='mb-6 flex flex-wrap items-center gap-4'>
            <h1 className='flex-1 font-bold text-3xl sm:text-4xl md:text-5xl'>{event.title}</h1>
          </div>

          <div className='mb-6 flex flex-wrap items-center gap-2'>
            <Badge className='px-3 py-1 text-sm' variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>

          <p className='text-lg text-muted-foreground leading-relaxed md:text-xl'>{event.description}</p>

          <div className='mt-8 flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/30 p-4 text-muted-foreground sm:flex-row sm:items-center'>
            {event.startAt && (
              <div className='flex items-center gap-2'>
                <CalendarDays className='h-5 w-5 text-primary/70' />
                <span className='font-medium'>
                  {new Date(event.startAt).toLocaleDateString("vi-VN")}
                  {event.endAt && ` - ${new Date(event.endAt).toLocaleDateString("vi-VN")}`}
                </span>
              </div>
            )}

            {event.location && (
              <>
                <div className='hidden h-6 w-px bg-border sm:block' />
                <div className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5 text-primary/70' />
                  <span className='font-medium'>{event.location}</span>
                </div>
              </>
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className='mt-6 flex flex-wrap gap-2'>
              {event.tags.map((t: any) => (
                <Badge className='px-3 py-1 text-xs' key={t.tag.id} variant='secondary'>
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Hero */}
        {event.thumbnail && (
          <div className='mb-12 overflow-hidden rounded-2xl border border-border shadow-lg'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={event.title} className='h-[400px] w-full object-cover' src={event.thumbnail} />
          </div>
        )}

        {/* Main Content */}
        <div className='md:col-span-2'>
          {event.gallery && event.gallery.length > 0 && <EventContentClient gallery={event.gallery} />}
        </div>
      </div>
    </div>
  );
}
