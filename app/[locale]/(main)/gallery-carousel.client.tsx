"use client";

import Autoplay from "embla-carousel-autoplay";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

type Props = {
  images: GalleryImage[];
};

const GalleryCarousel = ({ images }: Props) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
      >
        <CarouselContent className="-ml-4">
          {images.map((img, index) => (
            <CarouselItem
              className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              key={img.id}
            >
              <button
                className="group relative w-full overflow-hidden rounded-2xl bg-muted"
                onClick={() => handleImageClick(index)}
                type="button"
              >
                <div className="aspect-video">
                  <img
                    alt={img.caption ?? "Gallery"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    src={img.url}
                  />
                </div>
                <div className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="w-full bg-linear-to-t from-black/70 to-transparent px-3 py-3">
                    <p className="font-medium text-sm text-white">
                      {img.caption}
                    </p>
                  </div>
                </div>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
      </Carousel>

      <ImageLightbox
        images={images.map((img) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
        }))}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        open={lightboxOpen}
      />
    </>
  );
};

export { GalleryCarousel };
