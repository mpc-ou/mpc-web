"use client";

import { ArrowUpRight, Calendar, Globe, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";

export type SponsorCardData = {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  startAt: string | null;
  endAt: string | null;
  images: string[];
};

type Labels = {
  active: string;
  present: string;
  website: string;
  email: string;
  gallery: string;
  viewDetail: string;
  year: string;
};

type Props = {
  groups: { year: number; items: SponsorCardData[] }[];
  labels: Labels;
  locale: string;
};

const isActive = (s: SponsorCardData) => !s.endAt || new Date(s.endAt) > new Date();

function SponsorLogo({ sponsor, className, sizes }: { sponsor: SponsorCardData; className?: string; sizes: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted/40", className)}>
      {sponsor.logo ? (
        <Image alt={sponsor.name} className='object-contain p-4' fill sizes={sizes} src={sponsor.logo} />
      ) : (
        <span className='flex h-full w-full items-center justify-center font-black text-3xl text-muted-foreground/40'>
          {sponsor.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function SponsorsClient({ groups, labels, locale }: Props) {
  const [selected, setSelected] = useState<SponsorCardData | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const period = (s: SponsorCardData) =>
    s.startAt
      ? `${formatLocalDate(s.startAt, locale, "MM/yyyy")} – ${s.endAt ? formatLocalDate(s.endAt, locale, "MM/yyyy") : labels.present}`
      : null;

  return (
    <>
      <div className='flex flex-col gap-14'>
        {groups.map(({ year, items }) => (
          <div className='flex flex-col gap-5' key={year}>
            <div className='flex items-center gap-4'>
              <span className='font-black text-2xl text-foreground tabular-nums'>
                {labels.year.replace("{year}", String(year))}
              </span>
              <span className='h-px flex-1 bg-border' />
              <span className='font-mono text-muted-foreground text-xs'>{String(items.length).padStart(2, "0")}</span>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {items.map((s, i) => (
                <ScrollReveal delay={Math.min(i, 5) * 70} key={s.id} variant='fade-up'>
                  <button
                    className='group relative flex h-full w-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_40px_-24px_hsl(var(--primary)/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    onClick={() => setSelected(s)}
                    type='button'
                  >
                    {isActive(s) && (
                      <span className='absolute top-4 right-4 z-10 rounded-full bg-primary/15 px-2.5 py-0.5 font-medium text-primary text-xs'>
                        {labels.active}
                      </span>
                    )}
                    <SponsorLogo
                      className='aspect-video w-full transition-transform duration-500 group-hover:scale-[1.02]'
                      sizes='(min-width: 1024px) 360px, 90vw'
                      sponsor={s}
                    />
                    <div className='flex flex-col gap-1'>
                      <h3 className='font-bold text-foreground text-lg transition-colors group-hover:text-primary'>
                        {s.name}
                      </h3>
                      {period(s) && (
                        <p className='flex items-center gap-1.5 font-mono text-muted-foreground text-xs'>
                          <Calendar className='h-3 w-3' />
                          {period(s)}
                        </p>
                      )}
                      {s.description && (
                        <p className='mt-1 line-clamp-2 text-muted-foreground text-sm leading-relaxed'>
                          {s.description}
                        </p>
                      )}
                    </div>
                    <span className='mt-auto inline-flex items-center gap-1 font-medium text-primary text-xs opacity-0 transition-opacity group-hover:opacity-100'>
                      {labels.viewDetail}
                      <ArrowUpRight className='h-3.5 w-3.5' />
                    </span>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog onOpenChange={(open) => !open && setSelected(null)} open={!!selected}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto p-0'>
          <DialogTitle className='sr-only'>{selected?.name}</DialogTitle>
          {selected && (
            <div className='flex flex-col'>
              <SponsorLogo className='aspect-21/9 w-full rounded-none rounded-t-lg' sizes='672px' sponsor={selected} />
              <div className='flex flex-col gap-5 p-6'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='flex flex-col gap-1'>
                    <h2 className='font-black text-2xl text-foreground'>{selected.name}</h2>
                    {period(selected) && (
                      <p className='flex items-center gap-1.5 font-mono text-muted-foreground text-xs'>
                        <Calendar className='h-3.5 w-3.5' />
                        {period(selected)}
                      </p>
                    )}
                  </div>
                  {isActive(selected) && (
                    <span className='rounded-full bg-primary/15 px-3 py-1 font-medium text-primary text-xs'>
                      {labels.active}
                    </span>
                  )}
                </div>

                <div className='flex flex-wrap gap-2'>
                  {selected.website && (
                    <a
                      className='inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90'
                      href={selected.website}
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      <Globe className='h-4 w-4' /> {labels.website}
                    </a>
                  )}
                  {selected.email && (
                    <a
                      className='inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-medium text-foreground text-sm transition-colors hover:bg-muted'
                      href={`mailto:${selected.email}`}
                    >
                      <Mail className='h-4 w-4' /> {selected.email}
                    </a>
                  )}
                  {selected.phone && (
                    <span className='inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-muted-foreground text-sm'>
                      <Phone className='h-4 w-4' /> {selected.phone}
                    </span>
                  )}
                </div>

                {selected.description && (
                  <p className='whitespace-pre-line text-muted-foreground text-sm leading-relaxed'>
                    {selected.description}
                  </p>
                )}

                {selected.images.length > 0 && (
                  <div className='flex flex-col gap-3'>
                    <h4 className='font-mono text-muted-foreground text-xs uppercase tracking-wider'>
                      {labels.gallery}
                    </h4>
                    <div className='grid grid-cols-3 gap-2'>
                      {selected.images.map((img, i) => (
                        <button
                          className='relative aspect-video cursor-zoom-in overflow-hidden rounded-lg bg-muted'
                          key={img}
                          onClick={() => setGalleryIndex(i)}
                          type='button'
                        >
                          <Image
                            alt=''
                            className='object-cover transition-transform duration-500 hover:scale-105'
                            fill
                            sizes='200px'
                            src={img}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ImageLightbox
        images={selected?.images ?? []}
        initialIndex={galleryIndex ?? 0}
        onClose={() => setGalleryIndex(null)}
        open={galleryIndex !== null}
        title={selected?.name}
      />
    </>
  );
}
