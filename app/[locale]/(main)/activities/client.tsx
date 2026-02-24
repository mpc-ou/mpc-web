"use client";

import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@/configs/i18n/routing";

type EventItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  href?: string;
  icon?: React.ReactNode;
};

export function EventsClient({
  internalEvents,
  externalEvents,
  t
}: {
  internalEvents: EventItem[];
  externalEvents: EventItem[];
  t: any;
}) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

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
    <div className='container mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8'>
      {/* Hoạt động nội bộ */}
      <section className='mb-24'>
        <div className='mb-10 text-center md:text-left'>
          <h2 className='font-bold text-3xl text-foreground tracking-tight'>{t.internalTitle}</h2>
          <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-primary/80 md:mx-0' />
          <p className='mt-4 max-w-2xl text-lg text-muted-foreground'>{t.internalDesc}</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {internalEvents.map((event) => (
            <Card
              className='group flex cursor-pointer flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg'
              key={event.id}
              onClick={() => {
                setSelectedEvent(event);
                setCurrentImageIdx(0);
              }}
            >
              <div className='relative aspect-video w-full overflow-hidden bg-muted'>
                <img
                  alt={event.title}
                  className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  src={event.thumbnail}
                />
                <div className='absolute right-2 bottom-2 rounded-md bg-black/60 px-2 py-1 text-white text-xs'>
                  +{event.images.length} Ảnh
                </div>
              </div>
              <CardHeader className='border-border/10 border-b pb-3'>
                <CardTitle className='text-xl'>{event.title}</CardTitle>
              </CardHeader>
              <CardContent className='flex-grow pt-4'>
                <CardDescription className='line-clamp-3 text-base leading-relaxed'>
                  {event.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hoạt động đối ngoại */}
      <section className='mb-24'>
        <div className='mb-10 text-center md:text-left'>
          <h2 className='font-bold text-3xl text-foreground tracking-tight'>{t.externalTitle}</h2>
          <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-blue-500/80 md:mx-0' />
          <p className='mt-4 max-w-2xl text-lg text-muted-foreground'>{t.externalDesc}</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {externalEvents.map((event) => {
            const content = (
              <div className='group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md'>
                <div className='relative aspect-[4/3] w-full overflow-hidden bg-muted'>
                  <img
                    alt={event.title}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                    src={event.thumbnail}
                  />
                  {event.images && event.images.length > 0 && (
                    <div className='absolute right-2 bottom-2 rounded-md bg-black/60 px-2 py-1 text-white text-xs'>
                      +{event.images.length} Ảnh
                    </div>
                  )}
                </div>

                <div className='flex grow flex-col p-6'>
                  <h3 className='mb-3 font-bold text-foreground text-xl transition-colors group-hover:text-primary'>
                    {event.title}
                  </h3>
                  <p className='mb-6 line-clamp-3 text-muted-foreground leading-relaxed'>{event.description}</p>

                  <div className='mt-auto flex items-center border-border/10 border-t pt-4 font-semibold text-primary text-sm'>
                    {event.href ? t.learnMore : "Xem bộ ảnh"}
                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </div>
              </div>
            );

            if (event.href && event.href !== "#") {
              return (
                <Link className='block h-full' href={event.href as any} key={event.id}>
                  {content}
                </Link>
              );
            }

            return (
              <button
                className='h-full w-full text-left'
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setCurrentImageIdx(0);
                }}
                type='button'
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>

      {/* Event Details Dialog (Image Gallery) */}
      <Dialog onOpenChange={(open) => !open && setSelectedEvent(null)} open={!!selectedEvent}>
        <DialogContent className='max-w-4xl overflow-hidden border-none bg-black/95 p-0'>
          <DialogTitle className='sr-only'>{selectedEvent?.title}</DialogTitle>
          {selectedEvent && (
            <div className='flex h-[80vh] flex-col'>
              {/* Header */}
              <div className='absolute inset-x-0 top-0 z-10 flex items-start justify-between bg-black/50 p-4 backdrop-blur-sm'>
                <div>
                  <h3 className='mb-1 font-bold text-white text-xl'>{selectedEvent.title}</h3>
                  <p className='line-clamp-2 max-w-2xl text-sm text-white/70'>{selectedEvent.description}</p>
                </div>
                <Button
                  className='rounded-full text-white hover:bg-white/20'
                  onClick={() => setSelectedEvent(null)}
                  size='icon'
                  variant='ghost'
                >
                  <X className='h-5 w-5' />
                </Button>
              </div>

              {/* Gallery Image */}
              <div className='relative flex flex-1 items-center justify-center'>
                {selectedEvent.images && selectedEvent.images.length > 0 ? (
                  <>
                    <img
                      alt={`${selectedEvent.title} - ảnh ${currentImageIdx + 1}`}
                      className='max-h-full max-w-full object-contain'
                      src={selectedEvent.images[currentImageIdx]}
                    />

                    {selectedEvent.images.length > 1 && (
                      <>
                        <Button
                          className='absolute top-1/2 left-4 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/80 hover:text-white'
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          size='icon'
                          variant='ghost'
                        >
                          <ChevronLeft className='h-8 w-8' />
                        </Button>
                        <Button
                          className='absolute top-1/2 right-4 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/80 hover:text-white'
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          size='icon'
                          variant='ghost'
                        >
                          <ChevronRight className='h-8 w-8' />
                        </Button>
                        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm'>
                          {currentImageIdx + 1} / {selectedEvent.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className='text-center text-white/50'>
                    <img
                      alt={selectedEvent.title}
                      className='mb-4 max-h-full max-w-full object-contain opacity-50'
                      src={selectedEvent.thumbnail}
                    />
                    <p>Chưa có hình ảnh nào được tải lên cho sự kiện này.</p>
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
