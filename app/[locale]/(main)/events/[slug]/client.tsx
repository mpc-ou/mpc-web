"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";

type GalleryImage = { url: string; order: number };

export function EventContentClient({ gallery }: { gallery: GalleryImage[] }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [...gallery].sort((a, b) => (a.order || 0) - (b.order || 0)).map((g) => g.url);

  if (!images.length) {
    return null;
  }

  return (
    <>
      <h2 className='mb-6 border-border border-b pb-2 font-bold text-2xl'>Thư viện ảnh</h2>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
        {images.map((url, idx) => (
          <button
            className='group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-muted/30'
            key={url}
            onClick={() => setSelectedImage(idx)}
            type='button'
          >
            <Image
              alt={`Gallery image ${idx + 1}`}
              className='object-cover transition-transform duration-500 group-hover:scale-110'
              fill
              sizes='(min-width: 768px) 33vw, 50vw'
              src={url}
            />
            <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
              <span className='font-medium text-sm text-white'>Phóng to</span>
            </div>
          </button>
        ))}
      </div>

      <ImageLightbox
        images={images}
        initialIndex={selectedImage ?? 0}
        onClose={() => setSelectedImage(null)}
        open={selectedImage !== null}
      />
    </>
  );
}
