"use client";

import { ArrowRight, ArrowUpRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SectionHeading } from "@/components/custom/section-heading";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { MarkdownContent } from "@/components/markdown-content";
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

const EXTERNAL_URL_RE = /^https?:\/\//;

const albumOf = (event: EventItem) => [
  ...new Set([event.thumbnail, ...event.images].filter((x): x is string => Boolean(x)))
];

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
  const hasPhotos = albumOf(event).length > 0;
  const hasLink = Boolean(event.href && event.href !== "#");
  const external = hasLink && EXTERNAL_URL_RE.test(event.href ?? "");

  return (
    <div className='group relative grid w-full grid-cols-1 items-center gap-6 rounded-3xl border border-transparent px-4 py-8 transition-colors duration-300 hover:border-border hover:bg-card sm:px-6 md:grid-cols-2 md:gap-10 md:py-10'>
      {hasPhotos && (
        <button
          aria-label={`${t.viewPhotos}: ${event.title}`}
          className='absolute inset-0 z-0 cursor-zoom-in rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring'
          onClick={onOpen}
          type='button'
        />
      )}
      <div className='pointer-events-none relative flex gap-5 sm:gap-8'>
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
          {hasLink ? (
            <a
              className='pointer-events-auto relative z-10 mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90'
              href={event.href}
              {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
            >
              {t.learnMore}
              {external ? <ArrowUpRight className='h-4 w-4' /> : <ArrowRight className='h-4 w-4' />}
            </a>
          ) : (
            hasPhotos && (
              <span className='mt-1 inline-flex -translate-x-1 items-center gap-1.5 font-mono text-primary text-xs opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
                {t.viewPhotos}
                <ArrowRight className='h-3.5 w-3.5' />
              </span>
            )
          )}
        </div>
      </div>
      <div className='pointer-events-none relative'>
        <PhotoStack event={event} />
      </div>
    </div>
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

  useTransparentHeader({
    hideActions: false,
    textColor: "#ffffff"
  });

  const open = (event: EventItem) => setSelectedEvent(event);

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

      <ImageLightbox
        images={selectedEvent ? albumOf(selectedEvent) : []}
        onClose={() => setSelectedEvent(null)}
        open={selectedEvent !== null}
        title={selectedEvent?.title}
      />
    </div>
  );
}
