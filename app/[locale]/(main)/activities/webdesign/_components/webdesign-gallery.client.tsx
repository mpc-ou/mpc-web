"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { GalleryMasonry } from "../../../_components/gallery-masonry.client";

export function WebDesignGalleryClient({
  images
}: {
  images: Array<{ id: string; url: string; caption: string | null; order: number }>;
}) {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; gallery
        </span>
        <h2 className='mt-4 font-black text-3xl text-foreground uppercase tracking-tight sm:text-4xl'>
          {t("galleryTitle")}
        </h2>
      </ScrollReveal>
      <div className='mx-auto max-w-6xl'>
        <GalleryMasonry className='h-auto min-h-[80vh]' images={images} />
      </div>
    </section>
  );
}
