"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function EventContentClient({ gallery }: { gallery: any[] }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = gallery.sort((a, b) => (a.order || 0) - (b.order || 0)).map((g) => g.url);

  if (!images.length) {
    return null;
  }

  const nextImage = () => {
    if (selectedImage === null) {
      return;
    }
    setSelectedImage((prev) => (prev! + 1) % images.length);
  };

  const prevImage = () => {
    if (selectedImage === null) {
      return;
    }
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev! - 1));
  };

  return (
    <>
      <h2 className='mb-6 border-border border-b pb-2 font-bold text-2xl'>Thư viện ảnh</h2>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
        {images.map((url, idx) => (
          <div
            className='group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-muted/30'
            key={idx}
            onClick={() => setSelectedImage(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`Gallery image ${idx + 1}`}
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
              src={url}
            />
            <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
              <span className='font-medium text-sm text-white'>Phóng to</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog onOpenChange={(open) => !open && setSelectedImage(null)} open={selectedImage !== null}>
        <DialogContent className='h-[90vh] max-w-5xl overflow-hidden border-none bg-black/95 p-0'>
          <DialogTitle className='sr-only'>Hình ảnh sự kiện</DialogTitle>
          {selectedImage !== null && (
            <div className='relative flex h-full flex-col'>
              <Button
                className='absolute top-4 right-4 z-50 rounded-full bg-black/50 text-white hover:bg-white/20'
                onClick={() => setSelectedImage(null)}
                size='icon'
                variant='ghost'
              >
                <X className='h-5 w-5' />
              </Button>

              <div className='relative flex flex-1 items-center justify-center p-4'>
                <img
                  alt={`Gallery image ${selectedImage + 1}`}
                  className='max-h-full max-w-full object-contain'
                  src={images[selectedImage]}
                />

                {images.length > 1 && (
                  <>
                    <Button
                      className='absolute top-1/2 left-4 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
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
                      className='absolute top-1/2 right-4 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      size='icon'
                      variant='ghost'
                    >
                      <ChevronRight className='h-8 w-8' />
                    </Button>
                    <div className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 text-sm text-white shadow-lg backdrop-blur-md'>
                      {selectedImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
