"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";

type GalleryImage = {
  url: string;
  title?: string | null;
  caption?: string | null;
};

type Props = {
  images: (string | GalleryImage)[];
  title?: string;
};

const MAX_VISIBLE = 9;

export function PostGalleryPanel({ images, title }: Props) {
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
    <div>
      <h3 className='mb-3 font-bold text-muted-foreground text-xs uppercase tracking-wider'>
        {title ?? `Hình ảnh (${images.length})`}
      </h3>

      <div className='grid grid-cols-3 gap-1.5 lg:grid-cols-2 xl:grid-cols-3'>
        {visibleImages.map((img, i) => {
          const isLast = i === MAX_VISIBLE - 1 && overflow > 0;
          return (
            <button
              aria-label={isLast ? `Xem tất cả ${images.length} ảnh` : `Xem ảnh ${i + 1}`}
              className='group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              // biome-ignore lint/suspicious/noArrayIndexKey: gallery list
              key={img.url + i}
              onClick={() => openAt(i)}
              type='button'
            >
              {/* biome-ignore lint/performance/noImgElement: gallery thumbnail */}
              {/* biome-ignore lint/correctness/useImageSize: size by CSS */}
              <img
                alt={img.title || img.caption || `Gallery ${i + 1}`}
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                src={img.url}
              />
              {/* Overlay for last item when overflow exists */}
              {isLast && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]'>
                  <span className='font-black text-lg text-white drop-shadow'>+{overflow + 1}</span>
                </div>
              )}
              {/* Hover overlay for normal items */}
              {!isLast && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20'>
                  <svg
                    aria-hidden='true'
                    className='h-6 w-6 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100'
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
