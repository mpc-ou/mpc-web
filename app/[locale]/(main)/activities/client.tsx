"use client";

import { ArrowRight, ArrowUpRight, Calendar, ChevronLeft, ChevronRight, FileImage, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SectionHeading } from "@/components/custom/section-heading";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";
import { cn } from "@/lib/utils";

type EventItem = {
  id: string;
  title: string;
  description: string;
  frequency: string;
  thumbnail: string | null;
  images: string[];
  href?: string;
};

export type EventsClientTranslations = {
  internalTitle: string;
  internalDesc: string;
  externalTitle: string;
  externalDesc: string;
  learnMore: string;
  countLabel: string;
  photosLabel: string;
  viewPhotos: string;
};

const STACK_POSE = [
  "-rotate-[4deg] -translate-x-[6%] translate-y-[3%] group-hover:-translate-x-[46%] group-hover:-rotate-[9deg] group-hover:translate-y-[6%]",
  "rotate-[4deg] translate-x-[6%] translate-y-[3%] group-hover:translate-x-[46%] group-hover:rotate-[9deg] group-hover:translate-y-[6%]",
  "z-10 group-hover:-translate-y-[4%] group-hover:scale-[1.04]"
] as const;

function stackImages(event: EventItem): (string | null)[] {
  const pool = [...new Set([event.thumbnail, ...event.images].filter((x): x is string => Boolean(x)))];
  const center = pool[0] ?? null;
  return [pool[1] ?? center, pool[2] ?? pool[1] ?? center, center];
}

function PhotoStack({ event }: { event: EventItem }) {
  const [left, right, center] = stackImages(event);
  return (
    <div className='relative mx-auto aspect-[16/10] w-full max-w-xl'>
      {[left, right, center].map((src, i) => (
        <div
          className={cn(
            "absolute inset-x-[14%] inset-y-[6%] overflow-hidden rounded-2xl border border-border bg-muted shadow-lg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            i < 2 && "brightness-[0.7] group-hover:brightness-100",
            i === 2 && "group-hover:border-primary/60 group-hover:shadow-2xl group-hover:shadow-primary/20",
            STACK_POSE[i]
          )}
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed three-slot stack
          key={i}
        >
          {src ? (
            <Image alt='' className='object-cover' fill sizes='(min-width: 768px) 32vw, 80vw' src={src} />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-muted-foreground/50'>
              <ImageIcon className='h-8 w-8' />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ActivityRow({
  event,
  index,
  t,
  onOpen
}: {
  event: EventItem;
  index: number;
  t: EventsClientTranslations;
  onOpen: () => void;
}) {
  return (
    <button
      className='group grid w-full grid-cols-1 items-center gap-6 rounded-3xl border border-transparent px-4 py-8 text-left outline-none transition-colors duration-300 hover:border-border hover:bg-card focus-visible:ring-2 focus-visible:ring-ring sm:px-6 md:grid-cols-2 md:gap-10 md:py-10'
      onClick={onOpen}
      type='button'
    >
      <div className='flex gap-5 sm:gap-8'>
        <span className='pt-2 font-mono text-muted-foreground/60 text-sm transition-colors group-hover:text-primary'>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className='flex min-w-0 flex-col gap-3'>
          <h3 className='text-balance font-extrabold text-2xl text-foreground leading-tight tracking-tight sm:text-3xl'>
            {event.title}
          </h3>
          <div className='flex flex-wrap gap-1.5 font-mono text-[10px] uppercase'>
            {event.frequency && (
              <span className='rounded-md border border-primary/40 px-2 py-0.5 text-primary'>{event.frequency}</span>
            )}
            {event.images.length > 0 && (
              <span className='rounded-md border border-border px-2 py-0.5 text-muted-foreground'>
                {event.images.length} {t.photosLabel}
              </span>
            )}
          </div>
          <div className='line-clamp-3 max-w-md text-muted-foreground text-sm leading-relaxed [&_p]:m-0'>
            <MarkdownContent content={event.description} />
          </div>
          <span className='mt-1 inline-flex -translate-x-1 items-center gap-1.5 font-mono text-primary text-xs opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
            {t.viewPhotos}
            <ArrowRight className='h-3.5 w-3.5' />
          </span>
        </div>
      </div>
      <PhotoStack event={event} />
    </button>
  );
}

function ActivitySection({
  tag,
  title,
  description,
  events,
  t,
  onOpen
}: {
  tag: string;
  title: string;
  description: string;
  events: EventItem[];
  t: EventsClientTranslations;
  onOpen: (event: EventItem) => void;
}) {
  if (events.length === 0) {
    return null;
  }
  return (
    <section>
      <ScrollReveal>
        <SectionHeading
          aside={
            <span className='font-mono text-muted-foreground text-xs'>
              {String(events.length).padStart(2, "0")} {t.countLabel}
            </span>
          }
          description={description}
          descriptionBelow
          tag={tag}
          title={title}
        />
      </ScrollReveal>
      <div className='flex flex-col divide-y divide-border/60'>
        {events.map((event, idx) => (
          <ScrollReveal delay={Math.min(idx, 4) * 80} key={event.id} variant='fade-up'>
            <ActivityRow event={event} index={idx} onOpen={() => onOpen(event)} t={t} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export function EventsClient({
  internalEvents,
  externalEvents,
  t
}: {
  internalEvents: EventItem[];
  externalEvents: EventItem[];
  t: EventsClientTranslations;
}) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useTransparentHeader({
    hideActions: false,
    textColor: "#ffffff"
  });

  const open = (event: EventItem) => {
    setSelectedEvent(event);
    setCurrentImageIdx(0);
  };

  const nextImage = () => {
    if (!selectedEvent) {
      return;
    }
    setCurrentImageIdx((prev) => (prev + 1) % selectedEvent.images.length);
  };

  const prevImage = () => {
    if (!selectedEvent) {
      return;
    }
    setCurrentImageIdx((prev) => (prev === 0 ? selectedEvent.images.length - 1 : prev - 1));
  };

  return (
    <div className='container mx-auto mt-20 space-y-24 px-4'>
      <ActivitySection
        description={t.internalDesc}
        events={internalEvents}
        onOpen={open}
        t={t}
        tag='internal_activities'
        title={t.internalTitle}
      />
      <ActivitySection
        description={t.externalDesc}
        events={externalEvents}
        onOpen={open}
        t={t}
        tag='external_activities'
        title={t.externalTitle}
      />

      {/* ── DETAIL & PHOTO GALLERY MODAL ────────────────────────── */}
      <Dialog onOpenChange={(open) => !open && setSelectedEvent(null)} open={!!selectedEvent}>
        <DialogContent className='data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 h-[92vh] max-w-[94vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-0 text-white shadow-2xl backdrop-blur-md duration-300 data-[state=open]:animate-in md:h-[90vh] md:max-w-5xl lg:max-w-6xl'>
          <DialogTitle className='sr-only'>{selectedEvent?.title}</DialogTitle>
          {selectedEvent && (
            <div className='flex h-full flex-col overflow-hidden'>
              {/* TOP: Image Slideshow - takes remaining flex-1 height */}
              <div className='group relative flex min-h-0 flex-1 items-center justify-center overflow-hidden border-white/5 border-b bg-black/70'>
                {/* Close modal */}
                <Button
                  className='absolute top-3 right-3 z-20 rounded-full border border-white/10 bg-black/50 text-white/80 backdrop-blur-xs transition-colors hover:bg-black/80 hover:text-white'
                  onClick={() => setSelectedEvent(null)}
                  size='icon'
                  variant='ghost'
                >
                  <X className='h-4 w-4' />
                </Button>

                {selectedEvent.images && selectedEvent.images.length > 0 ? (
                  <>
                    <div className='fade-in relative h-full w-full animate-in p-2 transition-all duration-500'>
                      <Image
                        alt={`${selectedEvent.title} - ảnh ${currentImageIdx + 1}`}
                        className='select-none rounded-lg object-contain'
                        fill
                        key={currentImageIdx}
                        sizes='94vw'
                        src={selectedEvent.images[currentImageIdx]}
                      />
                    </div>

                    {/* Prev / Next controls */}
                    {selectedEvent.images.length > 1 && (
                      <>
                        <Button
                          className='absolute top-1/2 left-3 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 text-white opacity-0 backdrop-blur-xs transition-all hover:bg-black/80 group-hover:opacity-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          size='icon'
                          variant='ghost'
                        >
                          <ChevronLeft className='h-6 w-6' />
                        </Button>
                        <Button
                          className='absolute top-1/2 right-3 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 text-white opacity-0 backdrop-blur-xs transition-all hover:bg-black/80 group-hover:opacity-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          size='icon'
                          variant='ghost'
                        >
                          <ChevronRight className='h-6 w-6' />
                        </Button>

                        {/* Image Counter */}
                        <div className='absolute right-3 bottom-3 z-10 rounded-md border border-white/5 bg-black/60 px-2 py-1 font-mono text-[10px] text-white'>
                          {currentImageIdx + 1} / {selectedEvent.images.length}
                        </div>

                        {/* Thin Thumbnail strip overlay on bottom */}
                        <div className='scrollbar-none absolute right-auto bottom-3 left-3 z-10 hidden max-w-[70%] gap-1.5 overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-1.5 sm:flex'>
                          {selectedEvent.images.map((img, idx) => (
                            <button
                              className={`relative h-8 w-11 shrink-0 overflow-hidden rounded-md border transition-all ${
                                idx === currentImageIdx
                                  ? "scale-102 border-primary"
                                  : "border-transparent opacity-50 hover:opacity-100"
                              }`}
                              key={img}
                              onClick={() => setCurrentImageIdx(idx)}
                              type='button'
                            >
                              <Image alt='' className='object-cover' fill sizes='44px' src={img} />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className='flex flex-col items-center gap-3 p-6 text-center text-white/40'>
                    <FileImage className='h-12 w-12 text-slate-500' />
                    <p className='text-sm'>Không tìm thấy hình ảnh nào của sự kiện này.</p>
                  </div>
                )}
              </div>

              {/* BOTTOM: Fixed height information block to prevent content overflow */}
              <div className='flex h-[280px] shrink-0 flex-col justify-between overflow-hidden border-white/5 border-t bg-slate-950 p-6 sm:p-8 md:h-[240px]'>
                <div className='flex flex-1 flex-col justify-center space-y-3 overflow-hidden'>
                  <div className='flex shrink-0 flex-wrap items-baseline justify-between gap-4'>
                    <h2 className='truncate font-black text-primary text-xl leading-tight tracking-tight sm:text-2xl'>
                      {selectedEvent.title}
                    </h2>

                    {selectedEvent.frequency && (
                      <span className='inline-flex items-center gap-1 font-bold font-mono text-primary text-xs uppercase tracking-wider sm:text-sm'>
                        <Calendar className='h-4 w-4' />
                        Tần suất: {selectedEvent.frequency}
                      </span>
                    )}
                  </div>

                  <div className='mt-1 max-h-[110px] min-h-0 flex-1 overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed sm:text-base md:max-h-[90px] [&_*]:text-slate-300'>
                    <MarkdownContent content={selectedEvent.description} />
                  </div>
                </div>

                {/* Optional CTA Link Button */}
                {selectedEvent.href && selectedEvent.href !== "#" && (
                  <div className='mt-2 flex shrink-0 items-center justify-end border-white/5 border-t pt-3'>
                    <Button
                      asChild
                      className='h-11 w-full rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] sm:w-auto'
                    >
                      <a className='flex items-center justify-center gap-1.5 text-sm' href={selectedEvent.href}>
                        Xem chi tiết cuộc thi
                        <ArrowUpRight className='h-4 w-4' />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
