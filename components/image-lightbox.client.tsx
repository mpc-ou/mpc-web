"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type LightboxImage = {
  id?: string;
  url: string;
  title?: string | null;
  caption?: string | null;
};

type Props = {
  images: (string | LightboxImage)[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  /** Album title shown in the top bar. */
  title?: string;
};

const SWIPE_THRESHOLD_PX = 50;

const normalize = (img: string | LightboxImage): LightboxImage => (typeof img === "string" ? { url: img } : img);

const ImageLightbox = ({ images, initialIndex = 0, open, onClose, title }: Props) => {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const items = images.map(normalize);
  const count = items.length;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setIndex(Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0)));
    }
  }, [open, initialIndex, count]);

  const goNext = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, goNext, goPrev, onClose]);

  useEffect(() => {
    const thumb = stripRef.current?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  if (!(mounted && open) || count === 0) {
    return null;
  }

  const current = items[index] ?? items[0];
  const neighbours = count > 1 ? [items[(index + 1) % count], items[(index - 1 + count) % count]] : [];

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || count < 2) {
      return;
    }
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
      dx < 0 ? goNext() : goPrev();
    }
    touchX.current = null;
  };

  const navButton =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex";

  return createPortal(
    <div
      aria-label={title ?? current.title ?? "Image viewer"}
      aria-modal
      className='fade-in fixed inset-0 z-9999 flex animate-in select-none flex-col bg-black/95 text-white backdrop-blur-sm duration-200'
      role='dialog'
    >
      <div className='relative z-10 flex items-center gap-3 px-4 py-3 sm:px-6'>
        <div className='min-w-0 flex-1'>
          {title && <p className='truncate font-semibold text-sm sm:text-base'>{title}</p>}
          {count > 1 && (
            <p className='font-mono text-white/50 text-xs'>
              {index + 1} / {count}
            </p>
          )}
        </div>
        <button
          aria-label='Close'
          className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          onClick={onClose}
          ref={closeRef}
          type='button'
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      <div
        className='relative min-h-0 flex-1'
        onTouchEnd={onTouchEnd}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
      >
        <button aria-label='Close' className='absolute inset-0 cursor-default' onClick={onClose} type='button' />
        <div className='pointer-events-none absolute inset-2 sm:inset-x-20 sm:inset-y-4'>
          <span className='absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/20 border-t-primary' />
          <Image
            alt={current.title || current.caption || title || ""}
            className='fade-in animate-in object-contain duration-300'
            fill
            key={current.url}
            priority
            sizes='100vw'
            src={current.url}
          />
        </div>
        {neighbours.map((img) => (
          <link as='image' href={img.url} key={`preload-${img.url}`} rel='prefetch' />
        ))}
        {count > 1 && (
          <>
            <button aria-label='Previous image' className={cn(navButton, "left-4")} onClick={goPrev} type='button'>
              <ChevronLeft className='h-6 w-6' />
            </button>
            <button aria-label='Next image' className={cn(navButton, "right-4")} onClick={goNext} type='button'>
              <ChevronRight className='h-6 w-6' />
            </button>
          </>
        )}
      </div>

      {(current.title || current.caption) && (
        <div className='relative z-10 mx-auto max-w-2xl px-4 pt-3 text-center'>
          {current.title && <p className='font-semibold text-sm'>{current.title}</p>}
          {current.caption && <p className='text-white/60 text-xs'>{current.caption}</p>}
        </div>
      )}

      {count > 1 && (
        <div
          className='relative z-10 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden'
          ref={stripRef}
        >
          {items.map((img, i) => (
            <button
              aria-current={i === index}
              aria-label={`Image ${i + 1}`}
              className={cn(
                "relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                i === index ? "border-primary opacity-100" : "border-transparent opacity-45 hover:opacity-90"
              )}
              key={`${img.url}-${i}`}
              onClick={() => setIndex(i)}
              type='button'
            >
              <Image alt='' className='object-cover' fill sizes='64px' src={img.url} />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

export { ImageLightbox };
