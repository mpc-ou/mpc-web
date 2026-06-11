"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ImageItem = {
  id: string;
  url: string;
  title?: string | null;
  caption?: string | null;
};

type Props = {
  images: ImageItem[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
};

const ImageLightbox = ({ images, initialIndex = 0, open, onClose }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowRight") {
        goNext();
      }
      if (e.key === "ArrowLeft") {
        goPrev();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, goNext, goPrev, onClose]);

  if (!(mounted && open) || images.length === 0) {
    return null;
  }

  const current = images.at(currentIndex);

  const content = (
    <div className='fixed inset-0 z-9999 flex select-none items-center justify-center'>
      {/* Backdrop */}
      <button
        aria-label='Close lightbox'
        className='absolute inset-0 cursor-default bg-black/90'
        onClick={onClose}
        type='button'
      />

      {/* Close button */}
      <button
        aria-label='Close'
        className='absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20'
        onClick={onClose}
        type='button'
      >
        <X className='h-6 w-6' />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          aria-label='Previous image'
          className='absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20'
          onClick={goPrev}
          type='button'
        >
          <ChevronLeft className='h-6 w-6' />
        </button>
      )}

      {/* Image */}
      <div className='relative z-10 flex max-h-[90vh] max-w-[95vw] flex-col items-center'>
        {/* biome-ignore lint/performance/noImgElement: lightbox image */}
        {/* biome-ignore lint/correctness/useImageSize: dynamic sizing */}
        <img
          alt={current?.title || current?.caption || "Gallery image"}
          className='max-h-[75vh] max-w-[90vw] rounded-lg border border-zinc-800 object-contain shadow-2xl'
          src={current?.url}
        />
        {(current?.title || current?.caption) && (
          <div className='mt-4 max-w-[80vw] rounded-xl border border-zinc-800/50 bg-zinc-950/80 px-4 py-2 text-center shadow-lg backdrop-blur-md'>
            {current?.title && (
              <h4 className='mb-1 font-bold text-sm text-zinc-100 uppercase tracking-wide'>{current.title}</h4>
            )}
            {current?.caption && <p className='font-medium text-xs text-zinc-400'>{current.caption}</p>}
          </div>
        )}
        <p className='mt-2 rounded-full bg-zinc-900/60 px-2 py-0.5 font-mono text-white/50 text-xs'>
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          aria-label='Next image'
          className='absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20'
          onClick={goNext}
          type='button'
        >
          <ChevronRight className='h-6 w-6' />
        </button>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export { ImageLightbox };
