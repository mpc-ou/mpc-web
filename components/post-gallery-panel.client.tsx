"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { cn } from "@/lib/utils";

type GalleryImage = {
  url: string;
  title?: string | null;
  caption?: string | null;
};

type Props = {
  images: (string | GalleryImage)[];
  title?: string;
  className?: string;
};

const MAX_VISIBLE = 8;

export function PostGalleryPanel({ images, title, className }: Props) {
  const t = useTranslations("common.gallery");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const normalizedImages = images.map((img, i) => {
    if (typeof img === "string") {
      return {
        id: String(i),
        url: img,
        title: null,
        caption: null
      };
    }
    return {
      id: String(i),
      url: img.url,
      title: img.title ?? null,
      caption: img.caption ?? null
    };
  });

  const visibleImages = normalizedImages.slice(0, MAX_VISIBLE);
  const overflow = normalizedImages.length - MAX_VISIBLE;

  const lightboxItems = normalizedImages.map((img) => ({
    id: img.id,
    url: img.url,
    title: img.title,
    caption: img.caption
  }));

  const openAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5", className)}>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <h3 className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
          {title ?? t("title", { count: images.length })}
        </h3>
        {images.length > 1 && (
          <button
            className='font-mono font-semibold text-primary text-xs hover:underline'
            onClick={() => openAt(0)}
            type='button'
          >
            {t("viewAll", { count: images.length })}
          </button>
        )}
      </div>

      <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'>
        {visibleImages.map((img, i) => {
          const isLast = i === MAX_VISIBLE - 1 && overflow > 0;
          return (
            <button
              aria-label={isLast ? t("viewAllAria", { count: images.length }) : t("viewImageAria", { index: i + 1 })}
              className='group relative h-20 w-full overflow-hidden rounded-xl border border-border/70 bg-muted transition-all hover:border-primary/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-22'
              // biome-ignore lint/suspicious/noArrayIndexKey: gallery list
              key={img.url + i}
              onClick={() => openAt(i)}
              type='button'
            >
              <Image
                alt={img.title || img.caption || `Gallery ${i + 1}`}
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                fill
                sizes='(min-width: 1024px) 12vw, (min-width: 640px) 25vw, 33vw'
                src={img.url}
              />
              {isLast && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-[1px]'>
                  <span className='font-black text-base text-white drop-shadow sm:text-lg'>+{overflow + 1}</span>
                </div>
              )}
              {!isLast && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25'>
                  <svg
                    aria-hidden='true'
                    className='h-5 w-5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <ImageLightbox
        images={lightboxItems}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        open={lightboxOpen}
      />
    </div>
  );
}
