"use client";

import { useState } from "react";
import { Link } from "@/configs/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  t,
}: {
  internalEvents: EventItem[];
  externalEvents: EventItem[];
  t: any;
}) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const nextImage = () => {
    if (!selectedEvent) return;
    setCurrentImageIdx((prev) => (prev + 1) % selectedEvent.images.length);
  };

  const prevImage = () => {
    if (!selectedEvent) return;
    setCurrentImageIdx((prev) =>
      prev === 0 ? selectedEvent.images.length - 1 : prev - 1,
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mt-20">
      {/* Hoạt động nội bộ */}
      <section className="mb-24">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t.internalTitle}
          </h2>
          <div className="mt-2 h-1 w-20 bg-primary/80 mx-auto md:mx-0 rounded-full" />
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            {t.internalDesc}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {internalEvents.map((event) => (
            <Card
              key={event.id}
              className="group cursor-pointer overflow-hidden border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col"
              onClick={() => {
                setSelectedEvent(event);
                setCurrentImageIdx(0);
              }}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  +{event.images.length} Ảnh
                </div>
              </div>
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <CardDescription className="text-base leading-relaxed line-clamp-3">
                  {event.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hoạt động đối ngoại */}
      <section className="mb-24">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t.externalTitle}
          </h2>
          <div className="mt-2 h-1 w-20 bg-blue-500/80 mx-auto md:mx-0 rounded-full" />
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            {t.externalDesc}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {externalEvents.map((event) => {
            const content = (
              <div className="group flex flex-col h-full overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {event.images && event.images.length > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                      +{event.images.length} Ảnh
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col grow">
                  <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed mb-6">
                    {event.description}
                  </p>

                  <div className="mt-auto flex items-center text-sm font-semibold text-primary pt-4 border-t border-border/10">
                    {event.href ? t.learnMore : "Xem bộ ảnh"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );

            if (event.href && event.href !== "#") {
              return (
                <Link
                  key={event.id}
                  href={event.href as any}
                  className="block h-full"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={event.id}
                type="button"
                className="text-left w-full h-full"
                onClick={() => {
                  setSelectedEvent(event);
                  setCurrentImageIdx(0);
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>

      {/* Event Details Dialog (Image Gallery) */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
          <DialogTitle className="sr-only">{selectedEvent?.title}</DialogTitle>
          {selectedEvent && (
            <div className="flex flex-col h-[80vh]">
              {/* Header */}
              <div className="flex items-start justify-between p-4 bg-black/50 absolute top-0 inset-x-0 z-10 backdrop-blur-sm">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-white/70 text-sm line-clamp-2 max-w-2xl">
                    {selectedEvent.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white hover:bg-white/20"
                  onClick={() => setSelectedEvent(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Gallery Image */}
              <div className="flex-1 relative flex items-center justify-center">
                {selectedEvent.images && selectedEvent.images.length > 0 ? (
                  <>
                    <img
                      src={selectedEvent.images[currentImageIdx]}
                      alt={`${selectedEvent.title} - ảnh ${currentImageIdx + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />

                    {selectedEvent.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/80 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                        >
                          <ChevronLeft className="w-8 h-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/80 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                        >
                          <ChevronRight className="w-8 h-8" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          {currentImageIdx + 1} / {selectedEvent.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-white/50 text-center">
                    <img
                      src={selectedEvent.thumbnail}
                      alt={selectedEvent.title}
                      className="max-w-full max-h-full object-contain opacity-50 mb-4"
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
