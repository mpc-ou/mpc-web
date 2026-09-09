"use client";

import { ArrowRight, ArrowUpRight, Calendar, Camera, ChevronLeft, ChevronRight, FileImage, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

type EventItem = {
  id: string;
  title: string;
  description: string;
  frequency: string;
  thumbnail: string;
  images: string[];
  href?: string;
};

export type EventsClientTranslations = {
  internalTitle: string;
  internalDesc: string;
  externalTitle: string;
  externalDesc: string;
  learnMore: string;
};

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

  // 3D Tilt Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6; // rotate max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6; // rotate max 6 deg

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div className='container mx-auto mt-20 max-w-6xl space-y-24 px-4 sm:px-6 lg:px-8'>
      {/* ── SECTION 1: INTERNAL ACTIVITIES ──────────────────────── */}
      <section>
        <div className='mb-12 text-center md:text-left'>
          <ScrollReveal>
            <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
              &gt; internal_activities
            </span>
            <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t.internalTitle}</h2>
            <p className='mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base'>
              {t.internalDesc}
            </p>
          </ScrollReveal>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {internalEvents.map((event, idx) => (
            <ScrollReveal className='h-full' delay={(idx % 2) * 100} duration={600} key={event.id} variant='fade-up'>
              <button
                className='group relative flex h-full w-full select-none flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-300 ease-out hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 focus:outline-none'
                onClick={() => {
                  setSelectedEvent(event);
                  setCurrentImageIdx(0);
                }}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "perspective(1000px)"
                }}
                type='button'
              >
                {/* Hover Glow Accent */}
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                {/* Card Image */}
                <div
                  className='relative aspect-video w-full overflow-hidden bg-muted'
                  style={{ transform: "translateZ(20px)" }}
                >
                  <Image
                    alt={event.title}
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                    fill
                    sizes='(min-width: 1024px) 33vw, 100vw'
                    src={event.thumbnail}
                  />

                  {/* Frequency Badge */}
                  {event.frequency && (
                    <div className='absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 font-bold text-[10px] text-white uppercase tracking-wider backdrop-blur-xs'>
                      <Calendar className='h-3 w-3 text-orange-500' />
                      {event.frequency}
                    </div>
                  )}

                  {/* Photos count */}
                  {event.images && event.images.length > 0 && (
                    <div className='absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 font-semibold text-[10px] text-white backdrop-blur-xs'>
                      <Camera className='h-3 w-3 text-orange-400' />
                      {event.images.length} Ảnh
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className='flex grow flex-col p-6' style={{ transform: "translateZ(30px)" }}>
                  <h3 className='font-bold text-foreground text-xl transition-colors group-hover:text-primary'>
                    {event.title}
                  </h3>
                  <div className='mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed'>
                    <MarkdownContent content={event.description} />
                  </div>
                  <div className='mt-auto flex items-center gap-1.5 border-border/10 border-t pt-4 font-semibold text-primary text-xs transition-colors group-hover:text-orange-500'>
                    Xem ảnh &amp; chi tiết hoạt động
                    <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
                  </div>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: EXTERNAL ACTIVITIES ──────────────────────── */}
      <section>
        <div className='mb-12 text-center md:text-left'>
          <ScrollReveal>
            <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
              &gt; external_activities
            </span>
            <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t.externalTitle}</h2>
            <p className='mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base'>
              {t.externalDesc}
            </p>
          </ScrollReveal>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {externalEvents.map((event, idx) => (
            <ScrollReveal className='h-full' delay={(idx % 3) * 100} duration={600} key={event.id} variant='fade-up'>
              <button
                className='block h-full w-full cursor-pointer border-none bg-transparent p-0 text-left focus:outline-none'
                onClick={() => {
                  setSelectedEvent(event);
                  setCurrentImageIdx(0);
                }}
                type='button'
              >
                {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse-tracking tilt effect inside an already-interactive parent button */}
                {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: same as above */}
                <div
                  className='group relative flex h-full select-none flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 ease-out hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5'
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "perspective(1000px)"
                  }}
                >
                  {/* Hover Glow Accent */}
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                  {/* Card Image */}
                  <div
                    className='relative aspect-[4/3] w-full overflow-hidden bg-muted'
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <Image
                      alt={event.title}
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                      fill
                      sizes='(min-width: 1024px) 33vw, 50vw'
                      src={event.thumbnail}
                    />

                    {/* Frequency Badge */}
                    {event.frequency && (
                      <div className='absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 font-bold text-[10px] text-white uppercase tracking-wider backdrop-blur-xs'>
                        <Calendar className='h-3 w-3 text-orange-500' />
                        {event.frequency}
                      </div>
                    )}

                    {/* Photos count */}
                    {event.images && event.images.length > 0 && (
                      <div className='absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 font-semibold text-[10px] text-white backdrop-blur-xs'>
                        <Camera className='h-3 w-3 text-orange-400' />
                        {event.images.length} Ảnh
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className='flex grow flex-col p-6' style={{ transform: "translateZ(30px)" }}>
                    <h3 className='font-bold text-foreground text-xl transition-colors group-hover:text-primary'>
                      {event.title}
                    </h3>
                    <div className='mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed'>
                      <MarkdownContent content={event.description} />
                    </div>

                    <div className='mt-auto flex items-center gap-1.5 border-border/10 border-t pt-4 font-semibold text-primary text-xs transition-colors group-hover:text-orange-500'>
                      Xem ảnh &amp; chi tiết hoạt động
                      <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
                    </div>
                  </div>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </section>

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
                                  ? "scale-102 border-orange-500"
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
                    <h2 className='truncate bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text font-black text-transparent text-white text-xl leading-tight tracking-tight sm:text-2xl'>
                      {selectedEvent.title}
                    </h2>

                    {selectedEvent.frequency && (
                      <span className='inline-flex items-center gap-1 font-bold font-mono text-orange-500 text-xs uppercase tracking-wider sm:text-sm'>
                        <Calendar className='h-4 w-4' />
                        Tần suất: {selectedEvent.frequency}
                      </span>
                    )}
                  </div>

                  <p className='scrollbar-thin scrollbar-thumb-white/10 mt-1 max-h-[110px] min-h-0 flex-1 overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed sm:text-base md:max-h-[90px]'>
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Optional CTA Link Button */}
                {selectedEvent.href && selectedEvent.href !== "#" && (
                  <div className='mt-2 flex shrink-0 items-center justify-end border-white/5 border-t pt-3'>
                    <Button
                      asChild
                      className='h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 font-bold transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] sm:w-auto'
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
